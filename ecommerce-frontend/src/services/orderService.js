import { apiFetch, getAccessToken, isPayPalEnabled } from '@/lib/backend';
import { MOCK_LATENCY_MS, STORAGE_KEYS } from '@/lib/constants';
import { readStorage, writeStorage } from '@/lib/storage';
import { ServiceError } from './productService';

/**
 * Order persistence. With PayPal configured (see lib/backend.js) orders live
 * in the database and are read through /api; otherwise the original demo
 * keeps them in localStorage. Both return the same order shape.
 */

/* Guests see their order through a secret link; remember it in this browser. */
const GUEST_TOKENS_KEY = 'skenvision.orderTokens.v1';

/** @param {string} orderNumber @param {string} token */
export function rememberOrderToken(orderNumber, token) {
  if (!token) return;
  const tokens = readStorage(GUEST_TOKENS_KEY, {});
  writeStorage(GUEST_TOKENS_KEY, { ...tokens, [orderNumber]: token });
}

const tokenFor = (orderNumber) => readStorage(GUEST_TOKENS_KEY, {})[orderNumber] ?? null;

/** @template T @param {T} payload @returns {Promise<T>} */
function request(payload) {
  const { min, max } = MOCK_LATENCY_MS;
  const delay = min + Math.random() * (max - min);
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(payload), delay);
  });
}

const GUEST_ID_KEY = 'skenvision.guest.v1';

/**
 * A stable id for someone checking out without an account, so their orders
 * still group together in this browser.
 * @returns {string}
 */
export function getGuestId() {
  const existing = readStorage(GUEST_ID_KEY, null);
  if (existing) return existing;

  const id = `guest_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  writeStorage(GUEST_ID_KEY, id);
  return id;
}

/** @returns {string} a human-quotable order reference, e.g. "SK-7Q4M2X" */
function generateOrderNumber() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `SK-${suffix}`;
}

/**
 * @param {string} userId
 * @returns {Promise<object[]>} that user's orders, newest first
 */
export async function getOrders(userId) {
  if (isPayPalEnabled) {
    if (await getAccessToken()) {
      const { orders } = await apiFetch('/api/orders');
      return orders;
    }
    // Guests: the orders placed in this browser, through their secret links.
    const numbers = Object.keys(readStorage(GUEST_TOKENS_KEY, {})).slice(-20);
    const results = await Promise.allSettled(numbers.map((number) => getOrderById(number)));
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
      .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  }
  const all = readStorage(STORAGE_KEYS.ORDERS, []);
  const mine = all
    .filter((order) => order.userId === userId)
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  return request(mine);
}

/**
 * @param {string} orderId
 * @returns {Promise<object>}
 * @throws {ServiceError} 404 when the order is unknown
 */
export async function getOrderById(orderId, viewToken = null) {
  if (isPayPalEnabled) {
    const token = viewToken ?? tokenFor(orderId);
    if (token) rememberOrderToken(orderId, token);
    const query = token ? `?t=${encodeURIComponent(token)}` : '';
    const { order } = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}${query}`);
    return order;
  }
  const all = readStorage(STORAGE_KEYS.ORDERS, []);
  const order = all.find((o) => o.id === orderId);
  if (!order) throw new ServiceError(`Order ${orderId} was not found.`, 404);
  return request(order);
}

/**
 * Real checkout, step 1: the server prices the bag, saves a pending order and
 * opens a PayPal order for that total.
 *
 * @param {{items: object[], promoCode: string|null, shippingMethodId: string, shipping: object}} draft
 * @returns {Promise<{paypalOrderId: string, orderNumber: string}>}
 */
export function startPayPalCheckout(draft) {
  return apiFetch('/api/checkout/create', { method: 'POST', body: draft });
}

/**
 * Real checkout, step 2, after the shopper approves in PayPal: capture the
 * payment and get the confirmed order back.
 *
 * @param {string} paypalOrderId
 * @returns {Promise<object>} the order
 */
export async function completePayPalCheckout(paypalOrderId) {
  const { order, viewToken } = await apiFetch('/api/checkout/capture', {
    method: 'POST',
    body: { paypalOrderId },
  });
  rememberOrderToken(order.id, viewToken);
  return order;
}

/**
 * Demo checkout: persists a completed order and returns it with its generated reference.
 *
 * @param {{userId: string, lines: object[], totals: object, shipping: object,
 *          payment: object, shippingMethodId: string, promoCode: string|null}} draft
 * @returns {Promise<object>}
 */
export async function createOrder(draft) {
  const order = {
    id: generateOrderNumber(),
    placedAt: new Date().toISOString(),
    status: 'confirmed',
    userId: draft.userId,
    shippingMethodId: draft.shippingMethodId,
    promoCode: draft.promoCode ?? null,
    totals: draft.totals,
    shipping: draft.shipping,
    // Only ever keep the last four digits — this is a demo, but storing a full
    // card number anywhere, even in localStorage, is not a habit worth having.
    payment: {
      cardholder: draft.payment.cardholder,
      last4: String(draft.payment.cardNumber ?? '')
        .replace(/\D/g, '')
        .slice(-4),
    },
    lines: draft.lines.map((line) => ({
      productId: line.product.id,
      slug: line.product.slug,
      title: line.product.title,
      image: line.product.images?.[0] ?? null,
      unitPrice: line.product.price,
      qty: line.qty,
      size: line.size,
      color: line.color,
    })),
  };

  const all = readStorage(STORAGE_KEYS.ORDERS, []);
  writeStorage(STORAGE_KEYS.ORDERS, [...all, order]);
  return request(order);
}
