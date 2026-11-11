/**
 * Asset pipeline: downloads every image in image-manifest.json from the source
 * site, re-encodes it to responsive AVIF, and writes an intrinsic-size lookup
 * so the app can set width/height on every <img> and avoid layout shift.
 *
 * Downloads are cached in .cache/images, so re-runs only re-encode.
 *
 *   npm run images          encode missing/changed assets
 *   npm run images -- --force   re-encode everything
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'scripts', 'image-manifest.json');
const CACHE = path.join(ROOT, '.cache', 'images');
const OUT = path.join(ROOT, 'public', 'img');
const META_OUT = path.join(ROOT, 'src', 'data', 'images.json');

const FORCE = process.argv.includes('--force');
const CONCURRENCY = 6;

/** Responsive widths per asset role. Never upscales past the source width. */
const WIDTHS = {
  product: [400, 800, 1200],
  hero: [768, 1280, 1920],
  editorial: [600, 1200],
  avatar: [96, 192],
  logo: [200, 400],
};

/** AVIF encode settings. effort 6 trades ~2x encode time for meaningfully smaller files. */
const AVIF = { quality: 52, effort: 6, chromaSubsampling: '4:2:0' };
/** Logos/cutouts keep 4:4:4 so edges against light surfaces stay crisp. */
const AVIF_SHARP_EDGES = { quality: 62, effort: 6, chromaSubsampling: '4:4:4' };

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

/**
 * Fetch a URL into the download cache, skipping the request if already cached.
 * @param {{name: string, url?: string, file?: string}} entry
 * @returns {Promise<string>} absolute path to the cached original
 */
async function ensureCached(entry) {
  // Art made for this site (not pulled from the old one) is committed as an
  // original under scripts/source-images and needs no download.
  if (entry.file) return path.join(ROOT, entry.file);

  const ext = path.extname(new URL(entry.url).pathname) || '.jpg';
  const dest = path.join(CACHE, entry.name + ext);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return dest;

  const res = await fetch(entry.url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${entry.url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

/**
 * Encode one cached original into every responsive AVIF width for its role.
 * @param {{name: string, kind: string}} entry
 * @param {string} src absolute path to the cached original
 * @returns {Promise<{name: string, meta: object}>}
 */
async function encode(entry, src) {
  const widths = WIDTHS[entry.kind] ?? WIDTHS.product;
  const opts = entry.kind === 'logo' || entry.kind === 'editorial' ? AVIF_SHARP_EDGES : AVIF;
  const input = sharp(src, { failOn: 'none' });
  const { width: sw, height: sh } = await input.metadata();

  const emitted = [];
  for (const w of widths) {
    if (w > sw && emitted.length) break; // never upscale, but always emit one size
    const target = Math.min(w, sw);
    const file = path.join(OUT, `${entry.name}-${target}.avif`);
    if (!FORCE && fs.existsSync(file)) {
      emitted.push(target);
      continue;
    }
    await sharp(src, { failOn: 'none' })
      .resize({ width: target, withoutEnlargement: true })
      .avif(opts)
      .toFile(file);
    emitted.push(target);
  }

  const widest = Math.max(...emitted);
  return {
    name: entry.name,
    meta: {
      width: widest,
      height: Math.round((sh / sw) * widest),
      aspect: Number((sw / sh).toFixed(4)),
      widths: [...new Set(emitted)].sort((a, b) => a - b),
    },
  };
}

/** Run tasks with a fixed concurrency ceiling. */
async function pool(items, limit, worker) {
  const out = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return out;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  fs.mkdirSync(CACHE, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });

  console.log(`encoding ${manifest.length} assets -> ${path.relative(ROOT, OUT)}\n`);
  const failures = [];

  const results = await pool(manifest, CONCURRENCY, async (entry, i) => {
    try {
      const src = await ensureCached(entry);
      const r = await encode(entry, src);
      process.stdout.write(`  [${String(i + 1).padStart(2)}/${manifest.length}] ${entry.name}\n`);
      return r;
    } catch (err) {
      failures.push({ name: entry.name, url: entry.url, error: err.message });
      process.stdout.write(
        `  [${String(i + 1).padStart(2)}/${manifest.length}] FAILED ${entry.name}: ${err.message}\n`,
      );
      return null;
    }
  });

  const meta = {};
  for (const r of results) if (r) meta[r.name] = r.meta;
  fs.writeFileSync(META_OUT, JSON.stringify(meta, null, 2) + '\n');

  const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.avif'));
  const outBytes = files.reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
  const inBytes = fs
    .readdirSync(CACHE)
    .reduce((n, f) => n + fs.statSync(path.join(CACHE, f)).size, 0);

  console.log(
    `\nencoded   ${Object.keys(meta).length}/${manifest.length} assets -> ${files.length} avif files`,
  );
  console.log(`originals ${(inBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(
    `avif      ${(outBytes / 1024 / 1024).toFixed(1)} MB   (${((1 - outBytes / inBytes) * 100).toFixed(1)}% smaller, all widths combined)`,
  );
  console.log(`meta      ${path.relative(ROOT, META_OUT)}`);
  if (failures.length) {
    console.log(`\n${failures.length} failure(s):`);
    for (const f of failures) console.log(`  ${f.name}  ${f.error}`);
    process.exitCode = 1;
  }
}

main();
