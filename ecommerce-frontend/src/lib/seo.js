/**
 * Search and AI-search metadata, as plain data. Used in two places: the
 * `usePageMeta` hook keeps <head> in step as the shopper navigates, and
 * scripts/prerender.mjs writes the same tags (plus readable page text) into
 * a static HTML file per route at build time, for crawlers that do not run
 * JavaScript. Keep this file free of `@/` imports so Node can load it.
 */
import { CURRENCY } from './constants.js';

export const BRAND = 'SK Envision';
export const DEFAULT_DESCRIPTION =
  'SK Envision natural hair and skin care: argan oil shampoo and conditioner, protein hair mask, scalp and hair serum, dark spot and collagen creams, and lash and brow serum. Free US shipping over $75.';
export const DEFAULT_IMAGE = '/og/default.jpg';

/** @param {string} [title] @returns {string} */
export const pageTitle = (title) =>
  title ? `${title} | ${BRAND}` : `${BRAND} | Natural Hair & Skin Care`;

/** Trims to a search-snippet length on a word boundary. */
export function snippet(text, max = 158) {
  const clean = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(' ', max - 1))}…`;
}

const money = (cents) => (cents / 100).toFixed(2);

/** @param {string} origin e.g. https://example.com */
export function organizationLd(origin, { phone, email, sameAs = [] } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: origin,
    logo: `${origin}/img/brand-mark-400.avif`,
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    sameAs,
  };
}

export function websiteLd(origin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * @param {object} product
 * @param {string} origin
 * @param {string} imagePath absolute path of the main image
 */
export function productLd(product, origin, imagePath) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: snippet(product.description, 500),
    sku: String(product.id),
    image: [`${origin}${imagePath}`],
    brand: { '@type': 'Brand', name: BRAND },
    url: `${origin}/shop/${product.slug}`,
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
    offers: {
      '@type': 'Offer',
      url: `${origin}/shop/${product.slug}`,
      price: money(product.price),
      priceCurrency: CURRENCY,
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

/** @param {{name: string, path: string}[]} crumbs */
export function breadcrumbLd(crumbs, origin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${origin}${crumb.path}`,
    })),
  };
}

/** @param {object[]} products */
export function itemListLd(products, origin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${origin}/shop/${product.slug}`,
      name: product.title,
    })),
  };
}

/** @param {{slug: string, title: string, excerpt: string, date: string}} post */
export function articleLd(post, origin, imagePath) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: [`${origin}${imagePath}`],
    author: { '@type': 'Organization', name: BRAND },
    publisher: { '@type': 'Organization', name: BRAND },
    mainEntityOfPage: `${origin}/journal/${post.slug}`,
  };
}
