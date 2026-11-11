import { COLLECTIONS, DEFAULT_SORT } from './constants';

/**
 * Catalog filtering, sorting and pagination as pure functions, so the hook
 * that drives the listing page stays a thin wrapper over testable logic.
 */

/**
 * @param {object} product
 * @param {string} term already lowercased
 * @returns {boolean}
 */
function matchesSearch(product, term) {
  if (!term) return true;
  const haystack = [product.title, product.subtitle, product.excerpt, ...(product.tags ?? [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(term);
}

/**
 * @param {object[]} products
 * @param {{search?:string, category?:string, minPrice?:number|null,
 *          maxPrice?:number|null, rating?:number|null}} filters
 * @returns {object[]}
 */
export function filterProducts(products, filters = {}) {
  const term = (filters.search ?? '').trim().toLowerCase();
  const { category, minPrice, maxPrice, rating } = filters;

  return products.filter((product) => {
    if (category && !product.categories.includes(category)) return false;
    if (minPrice != null && product.price < minPrice) return false;
    if (maxPrice != null && product.price > maxPrice) return false;
    if (rating != null && product.rating < rating) return false;
    return matchesSearch(product, term);
  });
}

const COMPARATORS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'rating-desc': (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  'name-asc': (a, b) => a.title.localeCompare(b.title),
  // Best sellers first, then the deepest discounts, then the strongest ratings.
  featured: (a, b) =>
    Number(b.isBestSeller) - Number(a.isBestSeller) ||
    savingOf(b) - savingOf(a) ||
    b.rating - a.rating,
};

/** @param {object} p @returns {number} absolute saving in cents */
function savingOf(p) {
  return p.compareAtPrice ? p.compareAtPrice - p.price : 0;
}

/**
 * @param {object[]} products
 * @param {string} sort one of SORT_OPTIONS' values
 * @returns {object[]} a new sorted array
 */
export function sortProducts(products, sort = DEFAULT_SORT) {
  const comparator = COMPARATORS[sort] ?? COMPARATORS[DEFAULT_SORT];
  return [...products].sort(comparator);
}

/**
 * @param {object[]} items
 * @param {number} page 1-based
 * @param {number} pageSize
 * @returns {{items:object[], page:number, pageCount:number, total:number}}
 */
export function paginate(items, page, pageSize) {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    total,
  };
}

/**
 * Products sharing the most categories with the given one, closest price first.
 * @param {object} product
 * @param {object[]} all
 * @param {number} limit
 * @returns {object[]}
 */
export function relatedTo(product, all, limit) {
  if (!product) return [];
  return all
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      product: p,
      shared: p.categories.filter((c) => product.categories.includes(c)).length,
      priceGap: Math.abs(p.price - product.price),
    }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => b.shared - a.shared || a.priceGap - b.priceGap)
    .slice(0, limit)
    .map((entry) => entry.product);
}

/** Review count that earns a product a place in the Bestsellers collection. */
const BESTSELLER_REVIEWS = 900;

/**
 * Products in one curated collection, best sellers first (the order every
 * collection page opens with).
 *
 * @param {object[]} products
 * @param {string} slug a key of COLLECTIONS
 * @returns {object[]|null} null when the collection does not exist
 */
export function collectionProducts(products, slug) {
  const collection = COLLECTIONS[slug];
  if (!collection) return null;
  const { ids, category, bestSellers } = collection.match;
  const matched = products.filter((product) => {
    if (ids) return ids.includes(product.id);
    if (category) return product.categories.includes(category);
    if (bestSellers) return product.isBestSeller || product.reviewCount >= BESTSELLER_REVIEWS;
    return true;
  });
  return sortProducts(matched, DEFAULT_SORT);
}

/**
 * The curated collection a product is shown under on its own page: the first
 * id-picked collection that lists it, else the sets, else bestsellers.
 * @param {object} product
 * @returns {string} a COLLECTIONS slug
 */
export function collectionOf(product) {
  const byId = Object.entries(COLLECTIONS).find(([, collection]) =>
    collection.match.ids?.includes(product.id),
  );
  if (byId) return byId[0];
  return product.categories.includes('packages') ? 'holiday-sets' : 'bestsellers';
}
