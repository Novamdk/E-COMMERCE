/**
 * Runs after `vite build`. The storefront is a single-page app, so without
 * this every URL would serve the same empty index.html: search engines that
 * do not run JavaScript, link previews and AI assistants (ChatGPT, Claude,
 * Perplexity and friends mostly read raw HTML) would see no products.
 *
 * For every public route this writes dist/<route>/index.html with:
 *   - its own <title>, description, canonical URL, Open Graph/Twitter tags
 *   - schema.org JSON-LD (Organization, Product, BreadcrumbList, Article)
 *   - the page's main text as plain HTML inside #root, which React replaces
 *     on load (createRoot, not hydration), so shoppers never see it
 * plus sitemap.xml, robots.txt, llms.txt and 1200x630 JPEG share images.
 *
 * Vercel serves real files before the SPA rewrite, so /shop/argan-shampoo
 * gets dist/shop/argan-shampoo/index.html.
 *
 * The site origin comes from SITE_URL, else Vercel's production domain.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  COLLECTIONS,
  CONTACT,
  FREE_SHIPPING_THRESHOLD,
  SHOW_STORE_FINDER,
  SOCIAL_LINKS,
} from '../src/lib/constants.js';
import {
  articleLd,
  BRAND,
  breadcrumbLd,
  DEFAULT_DESCRIPTION,
  itemListLd,
  organizationLd,
  pageTitle,
  productLd,
  snippet,
  websiteLd,
} from '../src/lib/seo.js';
import { en } from '../src/features/i18n/messages/en.js';
import { POSTS } from '../src/features/journal/posts.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

const products = read('src/data/products.json');
const content = read('src/data/content.json');
const details = read('src/data/product-details.json').en;
const images = read('src/data/images.json');

const ORIGIN = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'https://e-commerce-sk.vercel.app'
).replace(/\/$/, '');

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

/* ------------------------------ helpers ------------------------------ */

const esc = (text) =>
  String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const t = (key, values = {}) => {
  const raw = key.split('.').reduce((node, part) => node?.[part], en) ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
};

const money = (cents) => `$${(cents / 100).toFixed(2)}`;
const biggest = (name) => {
  const meta = images[name];
  return meta ? `/img/${name}-${Math.max(...(meta.widths ?? [meta.width]))}.avif` : undefined;
};
const primaryImageOf = (product) => product.images[0];

const byFeatured = (a, b) =>
  Number(b.isBestSeller) - Number(a.isBestSeller) ||
  (b.compareAtPrice ?? b.price) - b.price - ((a.compareAtPrice ?? a.price) - a.price);

function collectionItems(slug) {
  const { ids, category, bestSellers } = COLLECTIONS[slug].match;
  return products
    .filter((product) => {
      if (ids) return ids.includes(product.id);
      if (category) return product.categories.includes(category);
      if (bestSellers) return product.isBestSeller || product.reviewCount >= 900;
      return true;
    })
    .sort(byFeatured);
}

const productList = (items) =>
  `<ul>${items
    .map(
      (p) =>
        `<li><a href="/shop/${p.slug}">${esc(p.title)}</a> — ${esc(p.subtitle)}. ${money(p.price)}${
          p.compareAtPrice ? ` (${money(p.compareAtPrice)} value)` : ''
        }, rated ${p.rating}/5 from ${p.reviewCount} reviews.</li>`,
    )
    .join('')}</ul>`;

const nav = `<nav><a href="/">Home</a> · <a href="/shop">Shop all</a> · <a href="/gift-guide">Holiday gift guide</a> · ${Object.keys(
  COLLECTIONS,
)
  .map((slug) => `<a href="/collections/${slug}">${esc(t(COLLECTIONS[slug].title))}</a>`)
  .join(
    ' · ',
  )} · <a href="/quiz/hair">Hair quiz</a> · <a href="/quiz/gift">Gift finder</a> · <a href="/journal">Blog</a> · <a href="/about">About</a>${SHOW_STORE_FINDER ? ' · <a href="/stores">Find a store</a>' : ''} · <a href="/contact">Contact</a></nav>`;

/* ------------------------------- pages ------------------------------- */

/** @type {{path: string, title?: string, description: string, image?: string, type?: string, jsonLd?: object[], body: string, priority?: number}[]} */
const pages = [];

pages.push({
  path: '/',
  description: DEFAULT_DESCRIPTION,
  image: '/og/default.jpg',
  priority: 1,
  jsonLd: [
    organizationLd(ORIGIN, {
      phone: CONTACT.PHONE,
      email: CONTACT.EMAIL,
      sameAs: SOCIAL_LINKS.map((link) => link.href),
    }),
    websiteLd(ORIGIN),
  ],
  body: `<h1>${BRAND}: natural hair and skin care</h1>
<p>${esc(DEFAULT_DESCRIPTION)}</p>
<p>${esc(t('home.hero.heading'))} ${esc(t('home.hero.body'))} ${esc(t('home.hero.finePrint'))}</p>
<h2>${esc(t('home.bestsellers.title'))}</h2>${productList([...products].sort(byFeatured).slice(0, 8))}`,
});

pages.push({
  path: '/shop',
  title: 'Shop all products',
  description: t('seo.shop'),
  priority: 0.9,
  jsonLd: [itemListLd([...products].sort(byFeatured), ORIGIN)],
  body: `<h1>Shop all ${BRAND} products</h1>${productList([...products].sort(byFeatured))}`,
});

for (const product of products) {
  const d = details[product.id] ?? { benefits: [], howToUse: [] };
  const paragraphs = product.description.split('\n\n').filter(Boolean);
  pages.push({
    path: `/shop/${product.slug}`,
    title: product.title,
    description: `${product.title}: ${product.subtitle}. ${paragraphs[0] ?? ''}`,
    image: `/og/${product.slug}.jpg`,
    ogSource: biggest(primaryImageOf(product)),
    type: 'product',
    priority: 0.8,
    jsonLd: [
      productLd(product, ORIGIN, biggest(primaryImageOf(product))),
      breadcrumbLd(
        [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: product.title, path: `/shop/${product.slug}` },
        ],
        ORIGIN,
      ),
    ],
    body: `<h1>${esc(product.title)}</h1>
<p>${esc(product.subtitle)}. Price ${money(product.price)}${
      product.compareAtPrice ? ` (${money(product.compareAtPrice)} value)` : ''
    }. Rated ${product.rating} out of 5 from ${product.reviewCount} reviews. ${
      product.stock > 0 ? 'In stock.' : 'Out of stock.'
    } Free US shipping on orders over ${money(FREE_SHIPPING_THRESHOLD)}.</p>
${d.benefits.length ? `<h2>Key benefits</h2><ul>${d.benefits.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
${d.howToUse.length ? `<h2>How to use</h2><ol>${d.howToUse.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
<h2>Details</h2>${paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}`,
  });
}

for (const slug of Object.keys(COLLECTIONS)) {
  const name = t(COLLECTIONS[slug].title);
  const items = collectionItems(slug);
  pages.push({
    path: `/collections/${slug}`,
    title: name,
    description: t('seo.collection', { name }),
    priority: 0.8,
    jsonLd: [itemListLd(items, ORIGIN)],
    body: `<h1>${esc(name)}</h1><p>${esc(t('seo.collection', { name }))}</p>${productList(items)}`,
  });
}

pages.push({
  path: '/gift-guide',
  title: t('nav.giftGuide'),
  description: `${t('giftGuide.title')}. ${t('giftGuide.body')}`,
  image: '/og/gift-guide.jpg',
  ogSource: biggest('gift-flatlay'),
  priority: 0.9,
  body: `<h1>${esc(t('giftGuide.title'))}</h1><p>${esc(t('giftGuide.body'))}</p>
<h2>${esc(t('giftGuide.sets'))}</h2>${productList(collectionItems('holiday-sets'))}
<h2>${esc(t('giftGuide.under50'))}</h2>${productList(products.filter((p) => p.price < 5000))}
<h2>${esc(t('giftGuide.bestsellers'))}</h2>${productList(collectionItems('bestsellers'))}`,
});

for (const quizId of ['hair', 'gift']) {
  const title = t(`quiz.${quizId}.title`);
  pages.push({
    path: `/quiz/${quizId}`,
    title,
    description: `${title}: ${t('quiz.teaser.body')}`,
    priority: 0.6,
    body: `<h1>${esc(title)}</h1><p>${esc(t('quiz.teaser.body'))}</p>`,
  });
}

pages.push({
  path: '/journal',
  title: t('journal.title'),
  description: POSTS.map((post) => post.copy.en.title).join('. '),
  priority: 0.6,
  body: `<h1>${esc(t('journal.title'))}</h1><ul>${POSTS.map(
    (post) =>
      `<li><a href="/journal/${post.slug}">${esc(post.copy.en.title)}</a>: ${esc(post.copy.en.excerpt)}</li>`,
  ).join('')}</ul>`,
});

for (const post of POSTS) {
  const copy = { ...post, ...post.copy.en };
  pages.push({
    path: `/journal/${post.slug}`,
    title: copy.title,
    description: copy.excerpt,
    image: `/og/${post.image}.jpg`,
    ogSource: biggest(post.image),
    type: 'article',
    priority: 0.6,
    jsonLd: [articleLd(copy, ORIGIN, biggest(post.image))],
    body: `<article><h1>${esc(copy.title)}</h1><p>${esc(copy.excerpt)}</p>${copy.sections
      .map((s) => `<h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p>`)
      .join('')}</article>`,
  });
}

pages.push({
  path: '/about',
  title: 'About',
  description: t('seo.about'),
  priority: 0.5,
  body: `<h1>${esc(content.about.heading)}</h1>${content.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}`,
});

pages.push({
  path: '/contact',
  title: 'Contact us',
  description: `Contact ${BRAND}: ${CONTACT.PHONE}, ${CONTACT.EMAIL}, ${CONTACT.ADDRESS_LINES.join(', ')}.`,
  priority: 0.4,
  body: `<h1>Contact ${BRAND}</h1><p>Phone ${esc(CONTACT.PHONE)}. Email ${esc(CONTACT.EMAIL)}. ${esc(
    CONTACT.ADDRESS_LINES.join(', '),
  )}.</p>`,
});

if (SHOW_STORE_FINDER)
  pages.push({
    path: '/stores',
    title: t('stores.title'),
    description: t('seo.stores'),
    priority: 0.5,
    body: `<h1>${esc(t('stores.title'))}</h1><p>${esc(t('stores.intro'))}</p>`,
  });

/* ------------------------------- write ------------------------------- */

function render(page) {
  const url = `${ORIGIN}${page.path === '/' ? '/' : page.path}`;
  const title = pageTitle(page.title);
  const description = snippet(page.description);
  const image = `${ORIGIN}${page.image ?? '/og/default.jpg'}`;
  const head = `<!-- seo:start -->
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:site_name" content="${BRAND}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:type" content="${page.type ?? 'website'}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />
    ${
      page.jsonLd?.length
        ? `<script type="application/ld+json" id="ld-json">${JSON.stringify(
            page.jsonLd.length === 1 ? page.jsonLd[0] : page.jsonLd,
          ).replace(/</g, '\\u003c')}</script>`
        : ''
    }
    <!-- seo:end -->`;

  let html = template.replace(/<!-- seo:start[\s\S]*?<!-- seo:end -->/, head);
  // Only the homepage shows the hero, so only it preloads the hero image.
  if (page.path !== '/') html = html.replace(/<!-- lcp:start[\s\S]*?<!-- lcp:end -->/, '');
  // Readable text for crawlers. Visually hidden, and replaced by the app on load.
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"><div class="sr-only">${nav}<main>${page.body}</main></div></div>`,
  );
  return html;
}

for (const page of pages) {
  const dir = page.path === '/' ? DIST : path.join(DIST, page.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(page));
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) =>
      `  <url><loc>${ORIGIN}${page.path}</loc><lastmod>${today}</lastmod><priority>${page.priority ?? 0.5}</priority></url>`,
  )
  .join('\n')}
</urlset>
`,
);

fs.writeFileSync(
  path.join(DIST, 'robots.txt'),
  `# Search engines and AI assistants are welcome to read the storefront.
User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /sign-in
Disallow: /sign-up
Disallow: /wishlist

Sitemap: ${ORIGIN}/sitemap.xml
`,
);

// llms.txt: a plain-language map of the store for AI assistants (llmstxt.org).
fs.writeFileSync(
  path.join(DIST, 'llms.txt'),
  `# ${BRAND}

> ${DEFAULT_DESCRIPTION}

${BRAND} is a natural hair and skin care brand based at ${CONTACT.ADDRESS_LINES.join(', ')}. Formulas use naturally derived ingredients such as argan oil, collagen, proteins and botanical extracts, and are cruelty-free. Prices are in US dollars. Orders over ${money(FREE_SHIPPING_THRESHOLD)} ship free in the US; unopened products can be returned within 30 days.

Contact: ${CONTACT.PHONE} · ${CONTACT.EMAIL}

## Products

${[...products]
  .sort(byFeatured)
  .map((p) => {
    const d = details[p.id];
    return `- [${p.title}](${ORIGIN}/shop/${p.slug}): ${p.subtitle}. ${money(p.price)}, rated ${p.rating}/5 (${p.reviewCount} reviews).${
      d?.benefits?.length ? ` ${d.benefits.join('; ')}.` : ''
    }`;
  })
  .join('\n')}

## Collections

${Object.keys(COLLECTIONS)
  .map((slug) => `- [${t(COLLECTIONS[slug].title)}](${ORIGIN}/collections/${slug})`)
  .join('\n')}
- [Holiday gift guide](${ORIGIN}/gift-guide)

## Help choosing

- [Hair quiz](${ORIGIN}/quiz/hair): four questions about hair type, texture, concern and styling, then a recommended routine.
- [Gift finder](${ORIGIN}/quiz/gift): who the gift is for, what they love and a budget, then gift picks.

## Journal

${POSTS.map((post) => `- [${post.copy.en.title}](${ORIGIN}/journal/${post.slug}): ${post.copy.en.excerpt}`).join('\n')}
`,
);

/* --------------------------- share images ---------------------------- */

const shareImages = [
  {
    out: 'default.jpg',
    source: path.join(ROOT, 'scripts/source-images/holiday-hero.jpg'),
    position: 'right',
  },
  ...pages
    .filter((page) => page.ogSource && page.image)
    .map((page) => ({
      out: path.basename(page.image),
      source: path.join(DIST, page.ogSource),
      position: 'centre',
      background: page.type === 'product',
    })),
];

fs.mkdirSync(path.join(DIST, 'og'), { recursive: true });
await Promise.all(
  shareImages.map(async ({ out, source, position, background }) => {
    try {
      const image = background
        ? // Packshots sit on the stone colour, contained, so nothing is cropped.
          sharp(source)
            .resize(1200, 630, { fit: 'contain', background: '#f3f0eb' })
            .flatten({ background: '#f3f0eb' })
        : sharp(source).resize(1200, 630, { fit: 'cover', position });
      await image.jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(DIST, 'og', out));
    } catch (error) {
      console.warn(`share image ${out} skipped: ${error.message}`);
    }
  }),
);

console.log(
  `prerendered ${pages.length} routes for ${ORIGIN}, plus sitemap.xml, robots.txt, llms.txt`,
);
