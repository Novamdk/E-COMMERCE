import { productPath, ROUTES } from '@/lib/constants';
import { getBaseProduct } from '@/services/productService';

/**
 * Klaviyo onsite tracking (klaviyo.js) for SK Envision.
 *
 * The script loads only when VITE_KLAVIYO_PUBLIC_KEY is set, so local
 * development and preview builds without the key send nothing. The public key
 * is the account's "site ID": it can only identify browsers and record onsite
 * events, never read data, so it is safe in the bundle. The private API key is
 * used server side only (see /api/subscribe.js) and never reaches the browser.
 *
 * Event names and property names match what the SK Envision flows and
 * templates in Klaviyo read (Viewed Product, Added to Cart, Started Checkout).
 * Placed Order, Ordered Product and Fulfilled are sent from the server once a
 * real order exists, because the browser cannot be trusted with order totals.
 */

const PUBLIC_KEY = import.meta.env.VITE_KLAVIYO_PUBLIC_KEY;
const BRAND = 'SK Envision';

let isLoaded = false;

/** True when tracking is configured for this build. */
export const isKlaviyoEnabled = () => Boolean(PUBLIC_KEY) && typeof window !== 'undefined';

/**
 * Klaviyo's documented queue stub: calls made before klaviyo.js arrives are
 * queued on window._klOnsite and replayed once it loads, so nothing is lost on
 * a slow connection.
 */
function installQueue() {
  if (window.klaviyo) return;
  window._klOnsite = window._klOnsite || [];
  try {
    window.klaviyo = new Proxy(
      {},
      {
        get(_target, method) {
          if (method === 'push') {
            return (...args) => window._klOnsite.push(...args);
          }
          return (...args) => {
            const callback = typeof args[args.length - 1] === 'function' ? args.pop() : undefined;
            return new Promise((resolve) => {
              window._klOnsite.push([
                method,
                ...args,
                (result) => {
                  callback?.(result);
                  resolve(result);
                },
              ]);
            });
          };
        },
      },
    );
  } catch {
    window.klaviyo = window.klaviyo || [];
    window.klaviyo.push = (...args) => window._klOnsite.push(...args);
  }
}

/** Adds klaviyo.js to the page once. Safe to call more than once. */
export function loadKlaviyo() {
  if (!isKlaviyoEnabled() || isLoaded) return;
  isLoaded = true;
  installQueue();

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://static.klaviyo.com/onsite/js/${encodeURIComponent(PUBLIC_KEY)}/klaviyo.js?company_id=${encodeURIComponent(PUBLIC_KEY)}`;
  document.head.appendChild(script);
}

/** Tracking must never break shopping, so every call is fire-and-forget. */
function call(method, ...args) {
  if (!isKlaviyoEnabled()) return;
  try {
    loadKlaviyo();
    const result = window.klaviyo?.[method]?.(...args);
    if (result && typeof result.catch === 'function') result.catch(() => {});
  } catch {
    /* ignore: analytics is best-effort */
  }
}

const origin = () => (typeof window === 'undefined' ? '' : window.location.origin);
const dollars = (cents) => Math.round(Number(cents) || 0) / 100;

/**
 * Product photos on the site are AVIF, which several email clients cannot
 * show. The build also writes a JPG per product for social previews, so the
 * events point there and abandonment emails always have an image.
 */
const productImageUrl = (product) =>
  product?.slug ? `${origin()}/og/${product.slug}.jpg` : `${origin()}/og/default.jpg`;

const productUrl = (product) => `${origin()}${productPath(product.slug)}`;

/**
 * A link that rebuilds this cart on any device, for abandonment emails. The
 * cart lives in the shopper's browser, so a plain /cart link would open empty
 * on their phone. CartProvider reads ?items= on load (see cartFromUrl).
 *
 * Format: productId~size~color~qty, comma separated.
 *
 * @param {{productId:string,size?:string|null,color?:string|null,qty:number}[]} items
 */
export function cartRestoreUrl(items) {
  const encoded = items
    .map((item) =>
      [item.productId, item.size ?? '', item.color ?? '', item.qty]
        .map((part) => encodeURIComponent(String(part)))
        .join('~'),
    )
    .join(',');
  return `${origin()}${ROUTES.CART}${encoded ? `?items=${encoded}` : ''}`;
}

/**
 * Reverse of cartRestoreUrl. Returns null when the URL carries no cart.
 * @param {string} search location.search
 */
export function cartFromUrl(search) {
  const raw = new URLSearchParams(search).get('items');
  if (!raw) return null;
  const items = raw
    .split(',')
    .map((chunk) => {
      const [productId, size, color, qty] = chunk.split('~').map((part) => {
        try {
          return decodeURIComponent(part ?? '');
        } catch {
          return '';
        }
      });
      if (!productId) return null;
      return { productId, size: size || null, color: color || null, qty: Number(qty) || 1 };
    })
    .filter(Boolean);
  return items.length ? items : null;
}

/**
 * Cart items as stored ({productId, size, color, qty}) joined to the English
 * catalog, so every event names products the same way.
 */
const toLines = (items) =>
  (items ?? [])
    .map((item) => {
      const product = getBaseProduct(item.productId);
      return product
        ? { product, qty: item.qty, size: item.size ?? null, color: item.color ?? null }
        : null;
    })
    .filter(Boolean);

/** One line in Klaviyo's standard e-commerce shape. */
function toKlaviyoItem({ product, qty, size, color }) {
  return {
    ProductID: product.id,
    SKU: product.id,
    ProductName: product.title,
    Quantity: qty,
    ItemPrice: dollars(product.price),
    RowTotal: dollars(product.price * qty),
    ProductURL: productUrl(product),
    ImageURL: productImageUrl(product),
    ProductCategories: product.categories ?? [product.category].filter(Boolean),
    ...(size ? { Size: size } : {}),
    ...(color ? { Color: color } : {}),
  };
}

const uniqueCategories = (lines) => [
  ...new Set(lines.flatMap(({ product }) => product.categories ?? [product.category])),
];

/**
 * Ties this browser to a person, so their browsing and cart events reach the
 * right profile. Call with whatever is known; Klaviyo merges by email.
 *
 * @param {{email?: string, firstName?: string, lastName?: string, name?: string}} person
 */
export function identify({ email, firstName, lastName, name } = {}) {
  if (!email) return;
  const [nameFirst, ...nameRest] = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = firstName || nameFirst;
  const last = lastName || (nameRest.length ? nameRest.join(' ') : undefined);
  call('identify', {
    email: String(email).trim().toLowerCase(),
    ...(first ? { first_name: first } : {}),
    ...(last ? { last_name: last } : {}),
  });
}

/** @param {{id: string}} viewed the product on screen (any language) */
export function trackViewedProduct(viewed) {
  const product = getBaseProduct(viewed?.id);
  if (!product) return;
  const url = productUrl(product);
  const image = productImageUrl(product);
  const categories = product.categories ?? [product.category].filter(Boolean);
  const price = dollars(product.price);

  call('track', 'Viewed Product', {
    ProductName: product.title,
    ProductID: product.id,
    SKU: product.id,
    Categories: categories,
    ImageURL: image,
    URL: url,
    ProductURL: url,
    Brand: BRAND,
    Price: price,
    ItemPrice: price,
    ...(product.compareAtPrice ? { CompareAtPrice: dollars(product.compareAtPrice) } : {}),
  });

  // Powers Klaviyo's "recently viewed" product blocks in emails.
  call('trackViewedItem', {
    Title: product.title,
    ItemId: product.id,
    Categories: categories,
    ImageUrl: image,
    Url: url,
    Metadata: { Brand: BRAND, Price: price },
  });
}

/**
 * @param {{productId: string, qty: number, size?: string|null, color?: string|null}} added
 *   the item just added, with the quantity added
 * @param {{productId: string, qty: number, size?: string|null, color?: string|null}[]} cartItems
 *   the whole cart after adding
 */
export function trackAddedToCart(added, cartItems) {
  const [addedLine] = toLines([added]);
  if (!addedLine) return;
  const lines = toLines(cartItems);
  const items = lines.map(toKlaviyoItem);
  const value = items.reduce((sum, item) => sum + item.RowTotal, 0);
  const { product } = addedLine;

  call('track', 'Added to Cart', {
    $value: Math.round(value * 100) / 100,
    AddedItemProductName: product.title,
    AddedItemProductID: product.id,
    AddedItemSKU: product.id,
    AddedItemCategories: product.categories ?? [product.category].filter(Boolean),
    AddedItemImageURL: productImageUrl(product),
    AddedItemURL: productUrl(product),
    AddedItemPrice: dollars(product.price),
    AddedItemQuantity: addedLine.qty,
    ItemNames: items.map((item) => item.ProductName),
    CheckoutURL: cartRestoreUrl(cartItems),
    Items: items,
  });
}

/**
 * Sent once per checkout, when the shopper has given an email on the shipping
 * step, so the abandoned-checkout flow has someone to write to.
 *
 * @param {{items: object[], total: number}} checkout cart items and the order total in cents
 */
export function trackStartedCheckout({ items: cartItems, total }) {
  const lines = toLines(cartItems);
  if (!lines.length) return;
  const items = lines.map(toKlaviyoItem);
  const cartKey = lines
    .map((line) => `${line.product.id}x${line.qty}`)
    .join('-')
    .slice(0, 80);

  call('track', 'Started Checkout', {
    $event_id: `${cartKey}_${Math.floor(Date.now() / 1000)}`,
    $value: dollars(total),
    ItemNames: items.map((item) => item.ProductName),
    CheckoutURL: cartRestoreUrl(cartItems),
    Categories: uniqueCategories(lines),
    Items: items,
  });
}
