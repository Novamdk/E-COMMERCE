import { CURRENCY, STORAGE_KEYS } from '@/lib/constants';
import { readStorage, writeStorage } from '@/lib/storage';
import { getBaseProduct } from '@/services/productService';

/**
 * Advertising tags: Meta Pixel, TikTok Pixel and Google (GA4 and/or Google
 * Ads). Each one loads only when its ID is set in Vercel, so a build without
 * IDs sends nothing:
 *   VITE_META_PIXEL_ID       Meta Pixel ID (numbers only)
 *   VITE_TIKTOK_PIXEL_ID     TikTok Pixel ID
 *   VITE_GOOGLE_TAG_IDS      one or more of G-XXXX (GA4) and AW-XXXX (Ads), comma separated
 *   VITE_GOOGLE_ADS_PURCHASE optional Ads conversion, as AW-XXXX/label
 *
 * None of them load for a shopper who opted out on the privacy page, or whose
 * browser sends Global Privacy Control: under California law these tags
 * count as "sharing" for advertising, so both must be honoured.
 *
 * Events use each platform's standard names, so the ad accounts recognise
 * them without custom setup: page view, view item, add to cart, begin
 * checkout, purchase. Only real (PayPal) orders send a purchase.
 */

const META_ID = import.meta.env.VITE_META_PIXEL_ID;
const TIKTOK_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID;
const GOOGLE_IDS = String(import.meta.env.VITE_GOOGLE_TAG_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
const GOOGLE_ADS_PURCHASE = import.meta.env.VITE_GOOGLE_ADS_PURCHASE;

const hasAnyTag = Boolean(META_ID || TIKTOK_ID || GOOGLE_IDS.length);
const dollars = (cents) => Math.round(Number(cents) || 0) / 100;

let isLoaded = false;
const sentPurchases = new Set();

/* ------------------------------ opt-out ------------------------------ */

/** True when the browser sends the Global Privacy Control signal. */
export const hasGlobalPrivacyControl = () =>
  typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;

/** True when this shopper has opted out, by our setting or by their browser. */
export const hasAdOptOut = () =>
  hasGlobalPrivacyControl() || readStorage(STORAGE_KEYS.AD_OPT_OUT, false) === true;

/**
 * Saves the shopper's choice. Turning tags off reloads the page, because
 * scripts already running cannot be unloaded.
 *
 * @param {boolean} isOptedOut
 */
export function setAdOptOut(isOptedOut) {
  writeStorage(STORAGE_KEYS.AD_OPT_OUT, isOptedOut);
  if (isOptedOut && isLoaded) window.location.reload();
  if (!isOptedOut) loadAdTags();
}

/** True when at least one tag is configured for this build. */
export const isAdTrackingConfigured = () => hasAnyTag;

const isActive = () => isLoaded && typeof window !== 'undefined';

/* ------------------------------ loaders ------------------------------ */

function addScript(src) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/** Meta's documented base code (queue stub, then fbevents.js). */
function loadMeta() {
  if (window.fbq) return;
  const fbq = function fbq() {
    // The real script expects the arguments object, as in Meta's snippet.
    if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
    else fbq.queue.push(arguments);
  };
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  addScript('https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_ID);
}

/** TikTok's documented base code (queue stub, then events.js). */
function loadTikTok() {
  if (window.ttq) return;
  window.TiktokAnalyticsObject = 'ttq';
  const ttq = [];
  window.ttq = ttq;
  ttq.methods = [
    'page',
    'track',
    'identify',
    'instances',
    'debug',
    'on',
    'off',
    'once',
    'ready',
    'alias',
    'group',
    'enableCookie',
    'disableCookie',
    'holdConsent',
    'revokeConsent',
    'grantConsent',
  ];
  ttq.setAndDefer = (target, method) => {
    target[method] = (...args) => target.push([method, ...args]);
  };
  for (const method of ttq.methods) ttq.setAndDefer(ttq, method);
  ttq.instance = (id) => {
    const instance = ttq._i[id] || [];
    for (const method of ttq.methods) ttq.setAndDefer(instance, method);
    return instance;
  };
  ttq.load = (id, options) => {
    const src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    ttq._i = ttq._i || {};
    ttq._i[id] = [];
    ttq._i[id]._u = src;
    ttq._t = ttq._t || {};
    ttq._t[id] = Date.now();
    ttq._o = ttq._o || {};
    ttq._o[id] = options || {};
    addScript(`${src}?sdkid=${encodeURIComponent(id)}&lib=ttq`);
  };
  ttq.load(TIKTOK_ID);
}

/** gtag.js, configured for every Google ID. Page views are sent by route. */
function loadGoogle() {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  // gtag must push the arguments object itself, not an array.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_IDS[0])}`);
  window.gtag('js', new Date());
  for (const id of GOOGLE_IDS) window.gtag('config', id, { send_page_view: false });
}

/** Adds the configured tags once, unless the shopper opted out. */
export function loadAdTags() {
  if (typeof window === 'undefined' || isLoaded || !hasAnyTag || hasAdOptOut()) return;
  isLoaded = true;
  try {
    if (META_ID) loadMeta();
    if (TIKTOK_ID) loadTikTok();
    if (GOOGLE_IDS.length) loadGoogle();
  } catch {
    /* tracking must never break shopping */
  }
}

/* ------------------------------ events ------------------------------- */

/** Runs each platform's call, ignoring any that is missing or throws. */
function send({ meta, tiktok, google }) {
  if (!isActive()) return;
  const run = (fn) => {
    try {
      fn();
    } catch {
      /* best effort */
    }
  };
  if (META_ID && meta && window.fbq) run(meta);
  if (TIKTOK_ID && tiktok && window.ttq) run(tiktok);
  if (GOOGLE_IDS.length && google && window.gtag) run(google);
}

/** @param {{productId: string, qty: number}[]} items cart lines */
const toLines = (items) =>
  (items ?? [])
    .map((item) => {
      const product = getBaseProduct(item.productId);
      return product ? { product, qty: Number(item.qty) || 1 } : null;
    })
    .filter(Boolean);

const googleItem = ({ product, qty }) => ({
  item_id: product.id,
  item_name: product.title,
  item_brand: 'SK Envision',
  item_category: product.categories?.[0] ?? product.category ?? undefined,
  price: dollars(product.price),
  quantity: qty,
});

const tiktokItem = ({ product, qty }) => ({
  content_id: product.id,
  content_type: 'product',
  content_name: product.title,
  price: dollars(product.price),
  quantity: qty,
});

/** Call on every route change. */
export function adPageView() {
  send({
    meta: () => window.fbq('track', 'PageView'),
    tiktok: () => window.ttq.page(),
    google: () =>
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: document.title,
      }),
  });
}

/** @param {{id: string}} viewed */
export function adViewItem(viewed) {
  const product = getBaseProduct(viewed?.id);
  if (!product) return;
  const line = { product, qty: 1 };
  const value = dollars(product.price);
  send({
    meta: () =>
      window.fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.title,
        content_type: 'product',
        value,
        currency: CURRENCY,
      }),
    tiktok: () =>
      window.ttq.track('ViewContent', { contents: [tiktokItem(line)], value, currency: CURRENCY }),
    google: () =>
      window.gtag('event', 'view_item', { currency: CURRENCY, value, items: [googleItem(line)] }),
  });
}

/** @param {{productId: string, qty: number}} added the item and quantity just added */
export function adAddToCart(added) {
  const [line] = toLines([added]);
  if (!line) return;
  const value = dollars(line.product.price * line.qty);
  send({
    meta: () =>
      window.fbq('track', 'AddToCart', {
        content_ids: [line.product.id],
        content_name: line.product.title,
        content_type: 'product',
        contents: [{ id: line.product.id, quantity: line.qty }],
        value,
        currency: CURRENCY,
      }),
    tiktok: () =>
      window.ttq.track('AddToCart', { contents: [tiktokItem(line)], value, currency: CURRENCY }),
    google: () =>
      window.gtag('event', 'add_to_cart', {
        currency: CURRENCY,
        value,
        items: [googleItem(line)],
      }),
  });
}

/** @param {{items: {productId: string, qty: number}[], total: number}} checkout total in cents */
export function adBeginCheckout({ items, total }) {
  const lines = toLines(items);
  if (!lines.length) return;
  const value = dollars(total);
  send({
    meta: () =>
      window.fbq('track', 'InitiateCheckout', {
        content_ids: lines.map((l) => l.product.id),
        contents: lines.map((l) => ({ id: l.product.id, quantity: l.qty })),
        content_type: 'product',
        num_items: lines.reduce((sum, l) => sum + l.qty, 0),
        value,
        currency: CURRENCY,
      }),
    tiktok: () =>
      window.ttq.track('InitiateCheckout', {
        contents: lines.map(tiktokItem),
        value,
        currency: CURRENCY,
      }),
    google: () =>
      window.gtag('event', 'begin_checkout', {
        currency: CURRENCY,
        value,
        items: lines.map(googleItem),
      }),
  });
}

/**
 * A paid order, as returned by the capture endpoint. Sent once per order.
 * Free gift lines are left out so the item list matches what was bought.
 *
 * @param {{id: string, totals: {total: number, tax: number, shipping: number},
 *   lines: {productId: string, title: string, unitPrice: number, qty: number, isGift?: boolean}[]}} order
 */
export function adPurchase(order) {
  if (!order?.id || sentPurchases.has(order.id)) return;
  sentPurchases.add(order.id);
  const lines = (order.lines ?? []).filter((line) => !line.isGift);
  const value = dollars(order.totals?.total);
  const items = lines.map((line) => ({
    id: line.productId,
    name: line.title,
    price: dollars(line.unitPrice),
    qty: line.qty,
  }));
  send({
    meta: () =>
      window.fbq(
        'track',
        'Purchase',
        {
          content_ids: items.map((i) => i.id),
          contents: items.map((i) => ({ id: i.id, quantity: i.qty })),
          content_type: 'product',
          num_items: items.reduce((sum, i) => sum + i.qty, 0),
          value,
          currency: CURRENCY,
        },
        // Lets Meta drop a duplicate if a server-side event is added later.
        { eventID: order.id },
      ),
    tiktok: () =>
      window.ttq.track(
        'CompletePayment',
        {
          contents: items.map((i) => ({
            content_id: i.id,
            content_type: 'product',
            content_name: i.name,
            price: i.price,
            quantity: i.qty,
          })),
          value,
          currency: CURRENCY,
        },
        { event_id: order.id },
      ),
    google: () => {
      window.gtag('event', 'purchase', {
        transaction_id: order.id,
        value,
        tax: dollars(order.totals?.tax),
        shipping: dollars(order.totals?.shipping),
        currency: CURRENCY,
        items: items.map((i) => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.qty,
        })),
      });
      if (GOOGLE_ADS_PURCHASE) {
        window.gtag('event', 'conversion', {
          send_to: GOOGLE_ADS_PURCHASE,
          value,
          currency: CURRENCY,
          transaction_id: order.id,
        });
      }
    },
  });
}
