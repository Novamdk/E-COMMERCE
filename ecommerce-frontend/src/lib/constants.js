/**
 * Every magic number, rate, key and path in the storefront.
 * Nothing in src/ should contain a literal route string or money rate.
 */

export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  PRODUCT: '/shop/:slug',
  CART: '/cart',
  WISHLIST: '/wishlist',
  CHECKOUT: '/checkout',
  CHECKOUT_SHIPPING: '/checkout/shipping',
  CHECKOUT_PAYMENT: '/checkout/payment',
  CHECKOUT_REVIEW: '/checkout/review',
  ORDERS: '/orders',
  ORDER: '/orders/:orderId',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  ABOUT: '/about',
  CONTACT: '/contact',
  NOT_FOUND: '*',
};

/** @param {string} slug @returns {string} */
export const productPath = (slug) => `/shop/${slug}`;
/** @param {string} orderId @returns {string} */
export const orderPath = (orderId) => `/orders/${orderId}`;
/** @param {string} categorySlug @returns {string} */
export const categoryPath = (categorySlug) => `/shop?category=${encodeURIComponent(categorySlug)}`;

/* ------------------------------ money ------------------------------ */
/** All prices are integer minor units (cents) to keep the math exact. */
export const CURRENCY = 'USD';
export const FREE_SHIPPING_THRESHOLD = 7500; // $75.00
export const SHIPPING_FLAT_RATE = 690; // $6.90
export const TAX_RATE = 0.0825; // 8.25%

export const PROMO_CODES = {
  SKGLOW10: { code: 'SKGLOW10', type: 'percent', value: 10, label: '10% off your order' },
  WELCOME25: { code: 'WELCOME25', type: 'percent', value: 25, label: '25% off your first order' },
};

/* ---------------------------- spin wheel ---------------------------- */
/**
 * Welcome-offer wheel. The segments are what the wheel shows; every spin
 * lands on WIN_INDEX, so every shopper gets the same offer and the code the
 * popup applies always matches where the wheel stops.
 */
export const SPIN_WHEEL = {
  SEGMENTS: ['5%', '10%', '15%', '20%', '25%', '10%', '15%', '20%'],
  WIN_INDEX: 4,
  PROMO_CODE: 'WELCOME25',
  /** First visit only, and not until the shopper has had a look around. */
  OPEN_DELAY_MS: 8000,
  SPIN_DURATION_S: 4.2,
  FULL_TURNS: 6,
};

/* --------------------------- announcements -------------------------- */
/**
 * Messages that rotate in the bar above the header. Built from the rates
 * above so the bar can never advertise a threshold checkout does not honour.
 */
export const ANNOUNCEMENTS = [
  `Free shipping on orders over $${FREE_SHIPPING_THRESHOLD / 100}`,
  `10% off with code ${PROMO_CODES.SKGLOW10.code}`,
  'Naturally derived · Cruelty-free',
];
/** How long each announcement stays up before the next one slides in. */
export const ANNOUNCEMENT_INTERVAL_MS = 5000;

/* ----------------------------- catalog ----------------------------- */
export const PAGE_SIZE = 9;
export const PRICE_BOUNDS = { min: 0, max: 15000 };
export const RELATED_PRODUCT_COUNT = 4;

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'Top rated' },
  { value: 'name-asc', label: 'Name: A–Z' },
];
export const DEFAULT_SORT = 'featured';

export const RATING_FILTERS = [4, 3, 2, 1];

export const LOW_STOCK_THRESHOLD = 8;

/* ---------------------------- query keys ---------------------------- */
export const QUERY_KEYS = {
  SEARCH: 'q',
  CATEGORY: 'category',
  MIN_PRICE: 'minPrice',
  MAX_PRICE: 'maxPrice',
  RATING: 'rating',
  SORT: 'sort',
  PAGE: 'page',
};

/* --------------------------- persistence --------------------------- */
export const STORAGE_KEYS = {
  CART: 'skenvision.cart.v1',
  WISHLIST: 'skenvision.wishlist.v1',
  SESSION: 'skenvision.session.v1',
  ORDERS: 'skenvision.orders.v1',
  CHECKOUT: 'skenvision.checkout.v1',
  SPIN_WHEEL: 'skenvision.spinWheel.v1',
};

/* ------------------------------ misc ------------------------------- */
export const SEARCH_DEBOUNCE_MS = 300;
/** Simulated latency window for the mock data service. */
export const MOCK_LATENCY_MS = { min: 180, max: 520 };
/** Share of mock requests that fail, so error states are real. 0 disables. */
export const MOCK_FAILURE_RATE = 0;

export const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard', detail: '4–7 business days', surcharge: 0 },
  { id: 'express', label: 'Express', detail: '2–3 business days', surcharge: 1200 },
];
