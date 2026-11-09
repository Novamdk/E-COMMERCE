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
  COLLECTION: '/collections/:slug',
  QUIZ: '/quiz/:quizId',
  GIFT_GUIDE: '/gift-guide',
  JOURNAL: '/journal',
  JOURNAL_POST: '/journal/:slug',
  STORES: '/stores',
  NOT_FOUND: '*',
};

/** @param {string} slug @returns {string} */
export const productPath = (slug) => `/shop/${slug}`;
/** @param {string} orderId @returns {string} */
export const orderPath = (orderId) => `/orders/${orderId}`;
/** @param {string} slug a key of COLLECTIONS @returns {string} */
export const collectionPath = (slug) => `/collections/${slug}`;
/** @param {'hair'|'gift'} quizId @returns {string} */
export const quizPath = (quizId) => `/quiz/${quizId}`;
/** @param {string} slug @returns {string} */
export const journalPath = (slug) => `/journal/${slug}`;
/** Home with the welcome offer opened, e.g. from the hero's sign-up button. */
export const WELCOME_OFFER_PATH = '/?offer=welcome';

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
  // Unlocked by finishing a quiz and leaving an email.
  // Gift with purchase: no money off, the GIFT_WITH_PURCHASE products ride along free.
  SKGIFT: {
    code: 'SKGIFT',
    type: 'gift',
    value: 0,
    label: 'Free gift with orders over $100',
  },
  QUIZ15: {
    code: 'QUIZ15',
    type: 'percent',
    value: 15,
    label: '15% off + free shipping',
    hasFreeShipping: true,
  },
};

/**
 * Gift with purchase, shown as a progress bar in the cart. Once the bag
 * reaches THRESHOLD (before discounts) and CODE is applied, PRODUCT_IDS are
 * added to the order at no charge. Edit PRODUCT_IDS to change the gifts.
 */
export const GIFT_WITH_PURCHASE = {
  CODE: 'SKGIFT',
  THRESHOLD: 10000, // $100.00
  PRODUCT_IDS: ['27'], // Foot Peel Mask
};

/** The code a finished quiz unlocks. */
export const QUIZ_PROMO_CODE = 'QUIZ15';

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
  SPIN_DURATION_S: 5.5,
  FULL_TURNS: 5,
};

/* ------------------------------ contact ----------------------------- */
/** Business contact details, as listed on skenvisiontime.com's footer. */
export const CONTACT = {
  ADDRESS_LINES: ['16027 Brookhurst St, Suite I-618', 'Fountain Valley, CA 92708'],
  PHONE: '949-434-1415',
  PHONE_HREF: 'tel:+19494341415',
  EMAIL: 'Skenvisiontimes@gmail.com',
};

/** Official social profiles. `id` picks the icon in the footer. */
export const SOCIAL_LINKS = [
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/skenvision' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/skenvision/' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@skenvisiontime' },
  {
    id: 'pinterest',
    label: 'Pinterest',
    href: 'https://www.pinterest.com/skenvision_revitalize/',
  },
];

/* --------------------------- announcements -------------------------- */
/**
 * Messages that rotate in the bar above the header. Built from the rates
 * above so the bar can never advertise a threshold checkout does not honour.
 * Each is a translation key plus the values it fills in.
 */
export const ANNOUNCEMENTS = [
  { key: 'announcements.freeShipping', values: { amount: `$${FREE_SHIPPING_THRESHOLD / 100}` } },
  { key: 'announcements.promo', values: { code: PROMO_CODES.SKGLOW10.code } },
  { key: 'announcements.natural' },
];

/* ---------------------------- collections --------------------------- */
/**
 * Curated, shopper-facing collections, each a rule over the catalog. The
 * source categories overlap heavily (most hair products sit in all three
 * hair categories), so collections pick products by id or flag instead.
 * Titles are translation keys under `collections.*`. Order here is menu order.
 */
export const COLLECTIONS = {
  bestsellers: { title: 'collections.bestsellers', match: { bestSellers: true } },
  'holiday-sets': { title: 'collections.holidaySets', match: { category: 'packages' } },
  'shampoo-conditioner': {
    title: 'collections.shampooConditioner',
    match: { ids: ['2628', '2621', '26', '1773'] },
  },
  treatments: { title: 'collections.treatments', match: { ids: ['28', '29', '4824'] } },
  'skin-care': {
    title: 'collections.skinCare',
    match: { ids: ['1958', '1550', '2394', '5091'] },
  },
  'eyes-lashes': { title: 'collections.eyesLashes', match: { ids: ['2547', '2394'] } },
  body: { title: 'collections.body', match: { ids: ['27'] } },
};

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

/* ------------------------------ stores ------------------------------ */
/**
 * Regions the stockist list is grouped by, in display order. `id` matches a
 * store's `region` in src/data/stores.json.
 */
export const STORE_REGIONS = [
  { id: 'oc', label: 'stores.regions.oc' },
  { id: 'sd', label: 'stores.regions.sd' },
  { id: 'la', label: 'stores.regions.la' },
];

/* --------------------------- persistence --------------------------- */
export const STORAGE_KEYS = {
  CART: 'skenvision.cart.v1',
  WISHLIST: 'skenvision.wishlist.v1',
  SESSION: 'skenvision.session.v1',
  ORDERS: 'skenvision.orders.v1',
  CHECKOUT: 'skenvision.checkout.v1',
  SPIN_WHEEL: 'skenvision.spinWheel.v1',
  LANGUAGE: 'skenvision.language.v1',
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
