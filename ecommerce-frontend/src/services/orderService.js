import { MOCK_LATENCY_MS, STORAGE_KEYS } from '@/lib/constants';
import { readStorage, writeStorage } from '@/lib/storage';
import { ServiceError } from './productService';

/**
 * Order persistence. Backed by localStorage because there is no server, but
 * shaped like a REST client so swapping in real endpoints is contained here.
 */

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
export async function getOrderById(orderId) {
  const all = readStorage(STORAGE_KEYS.ORDERS, []);
  const order = all.find((o) => o.id === orderId);
  if (!order) throw new ServiceError(`Order ${orderId} was not found.`, 404);
  return request(order);
}

/**
 * Persists a completed order and returns it with its generated reference.
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
