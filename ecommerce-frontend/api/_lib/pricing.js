import { createRequire } from 'node:module';
import { calculateTotals } from '../../src/lib/calculateTotals.js';
import { GIFT_WITH_PURCHASE, SHIPPING_METHODS } from '../../src/lib/constants.js';
import { HttpError } from './http.js';

/**
 * Prices an order on the server from the same catalog file and the same
 * money math the storefront uses, so the shopper pays exactly what the bag
 * showed and nobody can change a price from the browser.
 */

const require = createRequire(import.meta.url);
const catalog = require('../../src/data/products.json');
const byId = new Map(catalog.map((product) => [String(product.id), product]));

const MAX_LINES = 50;
const MAX_QTY = 99;

/**
 * @param {{productId: string, qty: number, size?: string|null, color?: string|null}[]} items
 * @param {{promoCode?: string|null, shippingMethodId?: string}} options
 */
export function priceOrder(items, { promoCode = null, shippingMethodId = 'standard' } = {}) {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(422, 'Your bag is empty.');
  if (items.length > MAX_LINES) throw new HttpError(422, 'Too many items in one order.');
  if (!SHIPPING_METHODS.some((method) => method.id === shippingMethodId)) {
    throw new HttpError(422, 'Choose a shipping method.');
  }

  const lines = items.map((item) => {
    const product = byId.get(String(item?.productId));
    if (!product) throw new HttpError(422, 'An item in your bag is no longer available.');
    const qty = Math.trunc(Number(item.qty));
    if (!(qty >= 1 && qty <= MAX_QTY))
      throw new HttpError(422, 'Check the quantities in your bag.');
    return {
      product,
      qty,
      size: typeof item.size === 'string' ? item.size.slice(0, 40) : null,
      color: typeof item.color === 'string' ? item.color.slice(0, 40) : null,
    };
  });

  const totals = calculateTotals({ lines, promoCode, shippingMethodId });

  const orderItems = lines.map(({ product, qty, size, color }) => ({
    product_id: String(product.id),
    slug: product.slug,
    title: product.title,
    unit_price_cents: product.price,
    quantity: qty,
    size,
    color,
    is_gift: false,
    line_total_cents: product.price * qty,
  }));

  // Gift with purchase rides along at no charge once unlocked.
  if (totals.isGiftUnlocked) {
    for (const id of GIFT_WITH_PURCHASE.PRODUCT_IDS) {
      const gift = byId.get(String(id));
      if (!gift) continue;
      orderItems.push({
        product_id: String(gift.id),
        slug: gift.slug,
        title: gift.title,
        unit_price_cents: 0,
        quantity: 1,
        size: null,
        color: null,
        is_gift: true,
        line_total_cents: 0,
      });
    }
  }

  return { totals, orderItems };
}

/** English catalog entry, for email event details. */
export const productById = (id) => byId.get(String(id));
