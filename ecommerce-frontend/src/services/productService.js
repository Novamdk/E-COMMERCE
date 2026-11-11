import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import contentData from '@/data/content.json';
import detailsData from '@/data/product-details.json';
import frData from '@/data/i18n/fr.json';
import esData from '@/data/i18n/es.json';
import itData from '@/data/i18n/it.json';
import viData from '@/data/i18n/vi.json';
import { MOCK_FAILURE_RATE, MOCK_LATENCY_MS, RELATED_PRODUCT_COUNT } from '@/lib/constants';
import { relatedTo } from '@/lib/filterProducts';

/**
 * The only place catalog data is read. Components never import the JSON.
 *
 * To move to a real API, replace the body of `request` with fetch() and keep
 * these function signatures — nothing else in the app touches the transport.
 */

/**
 * Translated copy per language, keyed by product id and category slug. Only
 * words live here; prices, stock and images always come from the base data,
 * so a translation can never change what a shopper pays. English is the base
 * data itself. A real API would take the language as a request parameter.
 */
const TRANSLATIONS = { fr: frData, es: esData, it: itData, vi: viData };

/** @param {object[]} products @param {string} [language] */
function localizeProducts(products, language) {
  const overrides = TRANSLATIONS[language]?.products;
  if (!overrides) return products;
  return products.map((product) => ({ ...product, ...overrides[product.id] }));
}

/** @param {object[]} categories @param {string} [language] */
function localizeCategories(categories, language) {
  const overrides = TRANSLATIONS[language]?.categories;
  if (!overrides) return categories;
  return categories.map((category) => ({ ...category, ...overrides[category.slug] }));
}

/**
 * Section by section, keeping fields a translation leaves out (ids, ratings).
 * @param {object} content @param {string} [language]
 */
function localizeContent(content, language) {
  const overrides = TRANSLATIONS[language]?.content;
  if (!overrides) return content;
  const merged = { ...content };
  for (const [section, value] of Object.entries(overrides)) {
    const base = content[section];
    if (Array.isArray(value) && Array.isArray(base)) {
      merged[section] = base.map((item, index) => ({ ...item, ...value[index] }));
    } else if (value && typeof value === 'object' && base && typeof base === 'object') {
      merged[section] = { ...base, ...value };
    } else {
      merged[section] = value;
    }
  }
  return merged;
}

/** Thrown for simulated transport failures so the UI has a real error path. */
export class ServiceError extends Error {
  /** @param {string} message @param {number} [status] */
  constructor(message, status = 500) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
  }
}

/**
 * Resolves with a deep copy after a realistic delay, occasionally failing.
 * @template T
 * @param {T} payload
 * @returns {Promise<T>}
 */
function request(payload) {
  const { min, max } = MOCK_LATENCY_MS;
  // No fake latency when pages are rendered at build time.
  const delay = typeof window === 'undefined' ? 0 : min + Math.random() * (max - min);

  return new Promise((resolve, reject) => {
    globalThis.setTimeout(() => {
      if (delay > 0 && MOCK_FAILURE_RATE > 0 && Math.random() < MOCK_FAILURE_RATE) {
        reject(new ServiceError('The catalog is temporarily unavailable.', 503));
        return;
      }
      resolve(structuredClone(payload));
    }, delay);
  });
}

/**
 * @param {string} [language] e.g. "fr"; English when omitted
 * @returns {Promise<object[]>} every product in the catalog
 */
export function getProducts(language) {
  return request(localizeProducts(productsData, language));
}

/**
 * The English catalog entry for one product, read synchronously. For
 * analytics and email events, which should always carry the same product names
 * whatever language the shopper browses in.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getBaseProduct(id) {
  return productsData.find((product) => product.id === String(id));
}

/**
 * @param {string} slug
 * @param {string} [language]
 * @returns {Promise<object>}
 * @throws {ServiceError} 404 when no product matches
 */
export async function getProductBySlug(slug, language) {
  const products = await request(localizeProducts(productsData, language));
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new ServiceError(`No product found for "${slug}".`, 404);
  // The product page also shows key benefits and how-to-use steps.
  const details = detailsData[language]?.[product.id] ?? detailsData.en[product.id];
  return { ...product, benefits: details?.benefits ?? [], howToUse: details?.howToUse ?? [] };
}

/**
 * @param {string} id
 * @param {string} [language]
 * @returns {Promise<object>}
 * @throws {ServiceError} 404 when no product matches
 */
export async function getProductById(id, language) {
  const products = await request(localizeProducts(productsData, language));
  const product = products.find((p) => p.id === String(id));
  if (!product) throw new ServiceError(`No product found for id "${id}".`, 404);
  return product;
}

/**
 * @param {string} [language]
 * @returns {Promise<object[]>}
 */
export function getCategories(language) {
  return request(localizeCategories(categoriesData, language));
}

/**
 * @param {string} slug the product to find neighbours for
 * @param {string} [language]
 * @returns {Promise<object[]>}
 */
export async function getRelatedProducts(slug, language) {
  const products = await request(localizeProducts(productsData, language));
  const product = products.find((p) => p.slug === slug);
  return relatedTo(product, products, RELATED_PRODUCT_COUNT);
}

/**
 * @param {string} [language]
 * @returns {Promise<object>} editorial copy for the marketing surfaces
 */
export function getSiteContent(language) {
  return request(localizeContent(contentData, language));
}
