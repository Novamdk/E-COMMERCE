import { randomBytes, timingSafeEqual } from 'node:crypto';
import { sendPlacedOrder } from './klaviyo.js';
import { completedCapture } from './paypal.js';
import { productById } from './pricing.js';
import { check, db } from './supabase.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1

/** A human-quotable reference, e.g. "SK-7Q4M2X". */
export function newOrderNumber() {
  const bytes = randomBytes(6);
  let suffix = '';
  for (const byte of bytes) suffix += ALPHABET[byte % ALPHABET.length];
  return `SK-${suffix}`;
}

/** Secret for a guest's order link. */
export const newViewToken = () => randomBytes(24).toString('hex');

/** Constant-time compare for view tokens. */
export function tokensMatch(a, b) {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

/** Loads an order and its items by any unique column. */
export async function loadOrder(column, value) {
  const order = check(await db().from('orders').select('*').eq(column, value).maybeSingle());
  if (!order) return { order: null, items: [] };
  const items = check(
    await db().from('order_items').select('*').eq('order_id', order.id).order('id'),
  );
  return { order, items };
}

/**
 * The shape the storefront's order pages already render (see
 * OrderConfirmationPage and OrderCard), so those pages work unchanged.
 */
export function toClientOrder(order, items) {
  const address = order.shipping_address ?? {};
  return {
    id: order.number,
    placedAt: order.paid_at ?? order.created_at,
    status: order.status,
    shippingMethodId: order.shipping_method,
    promoCode: order.promo_code,
    totals: {
      subtotal: order.subtotal_cents,
      discount: order.discount_cents,
      shipping: order.shipping_cents,
      tax: order.tax_cents,
      total: order.total_cents,
    },
    shipping: {
      firstName: order.first_name ?? '',
      lastName: order.last_name ?? '',
      email: order.email,
      phone: order.phone ?? '',
      address1: address.address1 ?? '',
      address2: address.address2 ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      postalCode: address.postalCode ?? '',
    },
    payment: { method: 'PayPal' },
    tracking: order.tracking_number
      ? { carrier: order.carrier, number: order.tracking_number }
      : null,
    lines: items.map((item) => ({
      productId: item.product_id,
      slug: item.slug,
      title: item.title,
      image: productById(item.product_id)?.images?.[0] ?? null,
      unitPrice: item.unit_price_cents,
      qty: item.quantity,
      size: item.size,
      color: item.color,
      isGift: item.is_gift,
    })),
  };
}

/**
 * Marks an order paid after PayPal reports a completed capture for the full
 * amount. Shared by the checkout capture call and the webhook, and safe to run
 * twice: only the first run (pending -> paid) takes stock and emails Klaviyo.
 *
 * @param {object} order the order row
 * @param {object} paypalOrder PayPal's order response after capture
 * @param {string} site public site address for links in emails
 * @returns {Promise<{order: object, items: object[], didPay: boolean}>}
 */
export async function markPaid(order, paypalOrder, site) {
  const capture = completedCapture(paypalOrder);
  if (!capture) return { ...(await loadOrder('id', order.id)), didPay: false };

  const paidCents = Math.round(Number(capture.amount?.value) * 100);
  if (capture.amount?.currency_code !== order.currency || paidCents !== order.total_cents) {
    // Never treat a short or foreign-currency payment as the order.
    console.error('PayPal capture amount mismatch', order.number, capture.amount);
    return { ...(await loadOrder('id', order.id)), didPay: false };
  }

  const updated = check(
    await db()
      .from('orders')
      .update({ status: 'paid', paypal_capture_id: capture.id, paid_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('status', 'pending')
      .select('*'),
  );

  const { order: fresh, items } = await loadOrder('id', order.id);
  const didPay = updated.length > 0;
  if (didPay) {
    check(await db().rpc('decrement_stock', { p_order_id: order.id }));
    await sendPlacedOrder(fresh, items, site);
  }
  return { order: fresh, items, didPay };
}
