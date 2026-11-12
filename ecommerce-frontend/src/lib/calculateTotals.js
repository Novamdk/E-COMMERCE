import {
  FREE_SHIPPING_THRESHOLD,
  GIFT_WITH_PURCHASE,
  PROMO_CODES,
  SHIPPING_FLAT_RATE,
  SHIPPING_METHODS,
  TAX_RATE,
} from './constants.js';

/**
 * All order money math. Pure, integer-cents only, no React — so it is
 * verifiable in isolation and cannot drift between the drawer, the cart
 * page and the checkout review step.
 */

/**
 * @typedef {{ product: { price: number }, qty: number }} PricedLine
 */

/**
 * @param {PricedLine} line
 * @returns {number} line total in cents
 */
export function lineTotal(line) {
  return line.product.price * line.qty;
}

/**
 * @param {PricedLine[]} lines
 * @returns {number} sum of line totals in cents
 */
export function subtotalOf(lines) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

/**
 * Resolves a user-entered promo code to its definition.
 * @param {string|null|undefined} code
 * @returns {{code: string, type: string, value: number, label: string}|null}
 */
export function resolvePromo(code) {
  if (!code) return null;
  return PROMO_CODES[String(code).trim().toUpperCase()] ?? null;
}

/**
 * @param {number} subtotal in cents
 * @param {string|null} code
 * @returns {number} discount in cents, never more than the subtotal
 */
export function discountFor(subtotal, code) {
  const promo = resolvePromo(code);
  if (!promo) return 0;
  const raw = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return Math.min(raw, subtotal);
}

/**
 * @param {number} amountAfterDiscount in cents
 * @param {string} [methodId]
 * @param {boolean} [hasFreeShipping] a promo that waives the flat rate
 * @returns {number} shipping cost in cents
 */
export function shippingFor(amountAfterDiscount, methodId = 'standard', hasFreeShipping = false) {
  const method = SHIPPING_METHODS.find((m) => m.id === methodId) ?? SHIPPING_METHODS[0];
  if (amountAfterDiscount <= 0) return 0;
  const base =
    hasFreeShipping || amountAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  return base + method.surcharge;
}

/**
 * @param {number} taxableAmount in cents
 * @returns {number} tax in cents
 */
export function taxFor(taxableAmount) {
  return Math.round(Math.max(0, taxableAmount) * TAX_RATE);
}

/**
 * The single source of truth for an order's money breakdown.
 * @param {{ lines: PricedLine[], promoCode?: string|null, shippingMethodId?: string }} input
 * @returns {{subtotal:number, discount:number, shipping:number, tax:number, total:number,
 *            itemCount:number, freeShippingRemaining:number, promo:object|null,
 *            giftRemaining:number, isGiftUnlocked:boolean}}
 */
export function calculateTotals({ lines = [], promoCode = null, shippingMethodId = 'standard' }) {
  const subtotal = subtotalOf(lines);
  const discount = discountFor(subtotal, promoCode);
  const afterDiscount = subtotal - discount;
  const promo = resolvePromo(promoCode);
  const hasFreeShipping = Boolean(promo?.hasFreeShipping);
  const shipping = shippingFor(afterDiscount, shippingMethodId, hasFreeShipping);
  const tax = taxFor(afterDiscount);

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: afterDiscount + shipping + tax,
    itemCount: lines.reduce((n, line) => n + line.qty, 0),
    freeShippingRemaining: hasFreeShipping
      ? 0
      : Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount),
    promo,
    // Gift with purchase counts the bag before discounts, as Olaplex's does.
    giftRemaining: Math.max(0, GIFT_WITH_PURCHASE.THRESHOLD - subtotal),
    isGiftUnlocked: promo?.type === 'gift' && subtotal >= GIFT_WITH_PURCHASE.THRESHOLD,
  };
}
