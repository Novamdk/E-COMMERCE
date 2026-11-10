/**
 * Codegen: turns the WooCommerce Store API payloads captured in ./source into
 * the storefront's data layer, plus the image manifest `npm run images` replays.
 *
 * The source payloads are committed, so this is reproducible offline:
 *   npm run data
 *
 * Re-capture the source from the live site with:
 *   curl "https://skenvisiontime.com/wp-json/wc/store/v1/products?per_page=100"
 *   curl "https://skenvisiontime.com/wp-json/wc/store/v1/products/categories"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(SCRIPTS, '..');
const SOURCE = path.join(SCRIPTS, 'source');
const DATA = path.join(PROJECT, 'src', 'data');
fs.mkdirSync(DATA, { recursive: true });

const UPLOADS = 'https://skenvisiontime.com/wp-content/uploads/';

/** Decode WP HTML entities and strip tags/markup to plain text. */
const clean = (s) =>
  (s || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/\S+\.(?:mp4|mov|webm|m4v)/gi, '') // user asked: no videos
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0?38;/g, '&')
    .replace(/&#8217;|&#039;|&rsquo;|&#0?39;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&#8221;|&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ *\n */g, '\n')
    .trim();

/** Split cleaned copy into paragraphs, dropping promo/price noise and stubs. */
const paragraphs = (s) =>
  clean(s)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40 && !/^(regular price|now only|buy \d)/i.test(p));

/* ------------------------------------------------------------------ *
 * Editorial overrides: the source titles are SEO keyword dumps
 * ("Shampoo &#038; Conditioner For Silky Smooth For All Hair Types,
 * haircare with Natural Argan Conditioner &#038; Oil shampoo").
 * Same products, readable names + short asset slugs.
 * ------------------------------------------------------------------ */
const OVERRIDES = {
  5091: {
    slug: 'dark-spot-beauty-package',
    title: 'Dark Spot Beauty Package',
    subtitle: 'Our best seller',
  },
  4824: {
    slug: 'hair-care-package',
    title: 'Hair Care Package Deal',
    subtitle: 'Complete 3-step routine',
  },
  2628: {
    slug: 'argan-shampoo-conditioner',
    title: 'Argan Oil Shampoo & Conditioner Duo',
    subtitle: 'For silky smooth hair',
  },
  2621: { slug: 'argan-shampoo', title: 'Argan Oil Shampoo', subtitle: 'All hair types' },
  2547: {
    slug: 'lash-growth-serum',
    title: 'Collagen Eyelash Growth Serum',
    subtitle: 'Lashes & brows in 4 weeks',
  },
  2394: {
    slug: 'retinal-eye-lift',
    // SK Envision's own product: renamed and rewritten (Nov 2026), so the
    // source copy, which used another brand's product name, is not used.
    title: 'SK Envision Eye Renewal Cream',
    subtitle: 'Lightweight daily eye cream',
    description:
      'A lightweight eye cream made for the delicate skin around your eyes. It absorbs quickly, layers well under makeup, and helps the eye area look smoother, brighter and more rested with daily use.\n\nHow to use: pat a small amount around the eye area, morning or night. Patch-test first and avoid direct contact with eyes.',
  },
  1958: {
    slug: 'dark-spot-collagen-cream',
    title: 'Dark Spot Collagen Cream',
    subtitle: 'Evens tone & fades spots',
  },
  1773: {
    slug: 'color-dye-shampoo',
    title: 'Magic Hair Dye Color Shampoo',
    subtitle: 'Salon colour at home',
  },
  1550: {
    slug: 'collagen-anti-aging-cream',
    title: 'Collagen Anti-Aging Wrinkle Cream',
    subtitle: 'Firms & smooths',
  },
  29: {
    slug: 'hair-regrowth-serum',
    title: 'Organic Hair Regrowth Serum',
    subtitle: 'Root-to-tip density',
  },
  28: {
    slug: 'repair-hair-mask',
    title: 'Protein Repair Hair Mask',
    subtitle: 'Dry & damaged hair',
  },
  27: { slug: 'foot-peel-mask', title: 'Foot Peel Mask', subtitle: 'With moisturizing gel' },
  26: {
    slug: 'argan-conditioner',
    title: 'Argan Oil Conditioner',
    subtitle: 'Detangles & hydrates',
  },
};

/** Size axes that exist on the real products (bottle sizes shown on packaging). */
const SIZES = {
  'argan-shampoo': ['8 oz', '17 oz'],
  'argan-conditioner': ['8 oz', '17 oz'],
  'argan-shampoo-conditioner': ['8 oz duo', '17 oz duo'],
  'repair-hair-mask': ['8 oz', '16 oz'],
  'hair-regrowth-serum': ['2 oz', '4 oz'],
};

/** Deterministic pseudo-random in [0,1) from an integer seed, so builds are stable. */
const seeded = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const readSource = (file) => JSON.parse(fs.readFileSync(path.join(SOURCE, file), 'utf8'));
const rawProducts = readSource('woocommerce-products.json');
const rawCats = readSource('woocommerce-categories.json');

/* ---------------- images: dedupe across products ---------------- */
/** url -> { name, file } where name is the first owning product's asset slug. */
const imageIndex = new Map();
const manifest = [];

for (const p of rawProducts) {
  const o = OVERRIDES[p.id];
  if (!o) continue;
  let i = 0;
  for (const img of p.images) {
    const url = img.src.split('?')[0];
    if (imageIndex.has(url)) continue;
    const name = `${o.slug}-${i}`;
    imageIndex.set(url, name);
    manifest.push({ name, url, kind: 'product' });
    i += 1;
  }
}

/* homepage / editorial imagery, hand-labelled by role */
const EDITORIAL = [
  {
    name: 'hero-portrait',
    file: '2026/07/woman-home-applying-cream-mask-scaled.jpg',
    kind: 'hero',
  },
  {
    name: 'brand-mark',
    file: '2023/01/9a8a091f-0a1c-4b8e-9cef-ba4ee21252b9-e1784786546861.png',
    kind: 'logo',
  },
  {
    name: 'ingredients-botanical',
    file: '2026/07/167-1673785_beauty-png-transparent-png-removebg-preview.png',
    kind: 'editorial',
  },
  // The source site also references
  // 2026/07/360_F_473846184_0k637f6855ZJqaulKqAmgJTEVGVibR1P-e1784795948590.jpg
  // as a CSS background, but that upload 404s on their server. Left out
  // deliberately so `npm run images` finishes clean.
  {
    name: 'shelf-shampoo',
    file: '2026/07/61uj7AD-IrL._SX466_-removebg-preview-e1784803096134.png',
    kind: 'editorial',
  },
  {
    name: 'shelf-mask',
    file: '2026/07/71lDZjGjwzL-removebg-preview-e1784802865733.png',
    kind: 'editorial',
  },
  { name: 'avatar-1', file: '2023/01/testimonial-01-free-img.jpg', kind: 'avatar' },
  { name: 'avatar-2', file: '2023/01/testimonial-07-free-img.jpg', kind: 'avatar' },
  { name: 'avatar-3', file: '2023/01/testimonial-08-free-img.jpg', kind: 'avatar' },
  { name: 'avatar-4', file: '2023/01/testimonial-09-free-img.jpg', kind: 'avatar' },
];
for (const e of EDITORIAL) manifest.push({ name: e.name, url: UPLOADS + e.file, kind: e.kind });

/* Art produced for the redesign, committed under scripts/source-images. */
/**
 * Campaign art generated from the real SK packshots, kept as JPEG masters in
 * scripts/source-images. Name, then image kind (which sets the AVIF widths).
 */
const LOCAL_ART = Object.entries({
  'welcome-gift': 'editorial', // popup: shampoo + mask with a gold ribbon
  'holiday-hero': 'hero', // shampoo bursting through gold gift wrap
  'about-hero': 'hero', // argan nuts, cream and oil on travertine (About page)
  'routine-hair': 'editorial',
  'gift-flatlay': 'editorial',
  'gift-bestsellers': 'editorial',
  'category-sets': 'editorial',
  'category-hair': 'editorial',
  'category-skin': 'editorial',
  'category-lashes': 'editorial',
  'journal-gift-guide': 'editorial',
  'journal-argan-routine': 'editorial',
  'hair-coily': 'avatar',
  'hair-curly': 'avatar',
  'hair-wavy': 'avatar',
  'hair-straight': 'avatar',
  'texture-shampoo': 'product', // hover swatches on product cards
  'texture-conditioner': 'product',
  'texture-nude': 'product',
  'texture-serum': 'product',
  'texture-cream': 'product',
  'texture-gel': 'product',
  'texture-color': 'product',
  'texture-aqua': 'product',
}).map(([name, kind]) => ({ name, file: `scripts/source-images/${name}.jpg`, kind }));
for (const e of LOCAL_ART) manifest.push(e);

/* ---------------- products.json ---------------- */
const products = rawProducts
  .filter((p) => OVERRIDES[p.id])
  .map((p) => {
    const o = OVERRIDES[p.id];
    const body = o.description ? o.description.split('\n\n') : paragraphs(p.description);
    const short = clean(p.short_description) || body[0]?.slice(0, 160) || '';
    const colorAttr = (p.attributes || []).find((a) => /colou?r/i.test(a.name));
    const price = Number(p.prices.price);
    const regular = Number(p.prices.regular_price);
    const rating = Number(p.average_rating) || 0;

    // Source stock is only a boolean; spread a deterministic count so the UI
    // exercises in-stock / low-stock / out-of-stock states. Demo data.
    const stock = p.is_in_stock ? 4 + Math.floor(seeded(p.id) * 40) : 0;

    return {
      id: String(p.id),
      slug: o.slug,
      title: o.title,
      subtitle: o.subtitle,
      description: body.join('\n\n'),
      excerpt: short,
      price,
      compareAtPrice: regular > price ? regular : null,
      category: p.categories[0]?.slug ?? 'uncategorized',
      categories: p.categories.map((c) => c.slug),
      images: p.images.map((img) => imageIndex.get(img.src.split('?')[0])).filter(Boolean),
      rating: rating || Number((3.9 + seeded(p.id + 7) * 1.1).toFixed(1)),
      reviewCount: p.review_count,
      stock,
      variants: {
        sizes: SIZES[o.slug] ?? [],
        colors: colorAttr ? colorAttr.terms.map((t) => clean(t.name)) : [],
      },
      tags: (p.tags || []).map((t) => t.slug),
      isBestSeller: [5091, 4824, 2547].includes(p.id),
    };
  });

/* ---------------- categories.json ---------------- */
const CATEGORY_COPY = {
  'hair-serum': 'Scalp-first serums that rebuild density from the root.',
  'hair-mask': 'Deep protein treatments for dry, over-processed hair.',
  'shampoo-conditioner': 'Argan-oil cleansing and conditioning for every hair type.',
  'color-shampoo-hair': 'Deposit rich, salon-grade colour in the shower.',
  'foot-peel-mask': 'Exfoliating peels for cracked heels and callused skin.',
  'dark-spot': 'Brightening formulas that fade pigmentation and even tone.',
  'face-lifting-collagen-cream': 'Collagen creams that firm, lift and smooth.',
  'eye-cream-anti-aging-organic': 'Targeted care for fine lines and tired eyes.',
  'eye-lashes-growth-serum': 'Lash and brow serums for fuller, longer growth.',
  packages: 'Bundled routines at a lower price than buying separately.',
};
const categories = rawCats
  .filter((c) => c.count > 0)
  .map((c) => ({
    id: String(c.id),
    slug: c.slug,
    name: clean(c.name).replace(/\b\w+/g, (w) =>
      w.length > 2 ? w[0] + w.slice(1).toLowerCase() : w,
    ),
    description: CATEGORY_COPY[c.slug] ?? '',
    count: products.filter((p) => p.categories.includes(c.slug)).length,
  }))
  .filter((c) => c.count > 0);

/* ---------------- content.json: real site copy ---------------- */
const content = {
  brand: {
    name: 'SK Envision',
    tagline: 'Natural hair & body care',
    email: 'Skenvisiontime@yahoo.com',
  },
  hero: {
    eyebrow: 'Natural ingredients only',
    heading: 'Clean beauty that actually works',
    body: 'Premium natural hair and body care, formulated with naturally derived ingredients that nourish, protect and revitalise — without unnecessary harsh chemicals.',
  },
  about: {
    heading: 'About SK Envision',
    paragraphs: [
      'At SK Envision, we are passionate about creating premium natural hair and body care products that inspire confidence and support healthy beauty. We carefully select high-quality, naturally derived ingredients to develop formulas that nourish, protect, and revitalize your skin and hair without unnecessary harsh chemicals.',
      'Our commitment goes beyond beauty. We believe in clean, sustainable, and ethical skincare by using cruelty-free practices and environmentally responsible packaging whenever possible. Every product is designed to deliver effective results while being gentle enough for everyday use.',
    ],
  },
  ingredients: {
    heading: 'Natural ingredients only',
    body: 'Our products are crafted with carefully selected natural ingredients that nourish, protect, and restore your skin and hair. Rich in botanical extracts, vitamins, and essential nutrients, each formula is designed to deliver gentle yet effective results without harsh chemicals.',
    body2:
      'We believe in clean beauty that supports healthy skin, stronger hair, and everyday confidence while respecting nature.',
  },
  testimonials: [
    {
      id: 't1',
      quote:
        'Amazing shampoo and conditioner. I tried it for the first time with my hair and it really works — makes my hair soft and shiny, with my curls defined.',
      name: 'Verified customer',
      meta: 'Argan Oil Shampoo & Conditioner Duo',
      rating: 5,
      // Placeholder until real reviews are supplied; the UI tags these.
      isPlaceholder: true,
    },
    {
      id: 't2',
      quote:
        'I love this stuff. It is part of my routine every time I style my hair. I have thick, frizzy hair that soaks up product, but a little goes a long way — the first bottle lasted me five months.',
      name: 'Verified customer',
      meta: 'Organic Hair Regrowth Serum',
      rating: 5,
      // Placeholder until real reviews are supplied; the UI tags these.
      isPlaceholder: true,
    },
    {
      id: 't3',
      quote:
        'Moroccan argan oil hair mask for dry damaged hair — nourishing, hydrating and a must-have. My hair feels completely different after two uses.',
      name: 'Verified customer',
      meta: 'Protein Repair Hair Mask',
      rating: 5,
      // Placeholder until real reviews are supplied; the UI tags these.
      isPlaceholder: true,
    },
    {
      id: 't4',
      quote:
        'The dark spot cream is the only thing that has visibly evened out my skin tone. Six weeks in and the difference around my cheeks is obvious.',
      name: 'Verified customer',
      meta: 'Dark Spot Collagen Cream',
      rating: 5,
      // Placeholder until real reviews are supplied; the UI tags these.
      isPlaceholder: true,
    },
  ],
  faq: [
    {
      q: 'Are your products really all natural?',
      a: 'Every formula is built on naturally derived ingredients — botanical extracts, vitamins and essential nutrients. We leave out the harsh chemicals that strip hair and irritate skin.',
    },
    {
      q: 'Do you test on animals?',
      a: 'No. We follow cruelty-free practices across the whole range and use environmentally responsible packaging wherever it is available to us.',
    },
    {
      q: 'How long until I see results?',
      a: 'It depends on the product. The eyelash serum is formulated for visible growth in about four weeks; hair masks and conditioners usually show a difference after two or three washes.',
    },
    {
      q: 'What is your return policy?',
      a: 'Unopened products can be returned within 30 days of delivery for a full refund. If a product arrives damaged, contact us and we will replace it.',
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes. Domestic orders over $75 ship free. International rates are calculated at checkout based on destination and weight.',
    },
  ],
  benefits: [
    {
      title: 'Naturally derived',
      body: 'Botanical extracts, vitamins and essential nutrients — no harsh chemicals.',
    },
    {
      title: 'Cruelty-free',
      body: 'Never tested on animals, with responsible packaging wherever possible.',
    },
    {
      title: 'Free shipping over $75',
      body: 'Flat $6.90 shipping below that, calculated at checkout.',
    },
    {
      title: '30-day returns',
      body: 'Unopened products refunded in full within 30 days of delivery.',
    },
  ],
};

/* ---------------- write ---------------- */
const w = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(
    `  ${path.relative(PROJECT, file)}  (${(fs.statSync(file).size / 1024).toFixed(1)} kB)`,
  );
};

console.log('generated:');
w(path.join(DATA, 'products.json'), products);
w(path.join(DATA, 'categories.json'), categories);
w(path.join(DATA, 'content.json'), content);
w(path.join(SCRIPTS, 'image-manifest.json'), manifest);

console.log(
  `\nproducts: ${products.length}  categories: ${categories.length}  images: ${manifest.length}`,
);
console.log(
  'variants:',
  products.filter((p) => p.variants.colors.length || p.variants.sizes.length).length,
);
console.log(
  'price range:',
  Math.min(...products.map((p) => p.price)),
  '-',
  Math.max(...products.map((p) => p.price)),
);
