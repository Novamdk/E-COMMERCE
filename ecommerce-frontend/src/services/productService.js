import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import contentData from '@/data/content.json';
import { MOCK_FAILURE_RATE, MOCK_LATENCY_MS, RELATED_PRODUCT_COUNT } from '@/lib/constants';
import { relatedTo } from '@/lib/filterProducts';

/**
 * The only place catalog data is read. Components never import the JSON.
 *
 * To move to a real API, replace the body of `request` with fetch() and keep
 * these function signatures — nothing else in the app touches the transport.
 */

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
  const delay = min + Math.random() * (max - min);

  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (MOCK_FAILURE_RATE > 0 && Math.random() < MOCK_FAILURE_RATE) {
        reject(new ServiceError('The catalog is temporarily unavailable.', 503));
        return;
      }
      resolve(structuredClone(payload));
    }, delay);
  });
}

/** @returns {Promise<object[]>} every product in the catalog */
export function getProducts() {
  return request(productsData);
}

/**
 * @param {string} slug
 * @returns {Promise<object>}
 * @throws {ServiceError} 404 when no product matches
 */
export async function getProductBySlug(slug) {
  const products = await request(productsData);
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new ServiceError(`No product found for "${slug}".`, 404);
  return product;
}

/**
 * @param {string} id
 * @returns {Promise<object>}
 * @throws {ServiceError} 404 when no product matches
 */
export async function getProductById(id) {
  const products = await request(productsData);
  const product = products.find((p) => p.id === String(id));
  if (!product) throw new ServiceError(`No product found for id "${id}".`, 404);
  return product;
}

/** @returns {Promise<object[]>} */
export function getCategories() {
  return request(categoriesData);
}

/**
 * @param {string} slug the product to find neighbours for
 * @returns {Promise<object[]>}
 */
export async function getRelatedProducts(slug) {
  const products = await request(productsData);
  const product = products.find((p) => p.slug === slug);
  return relatedTo(product, products, RELATED_PRODUCT_COUNT);
}

/** @returns {Promise<object>} editorial copy for the marketing surfaces */
export function getSiteContent() {
  return request(contentData);
}
