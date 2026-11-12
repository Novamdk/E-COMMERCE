import { apiFetch } from '@/lib/backend';

/**
 * Calls behind the private admin area. Every one of them is checked on the
 * server (ADMIN_EMAILS), so hiding the pages is a convenience, not the lock.
 */

/** @param {{view: string, q?: string}} params */
export function listAdminOrders({ view, q = '' }) {
  const query = new URLSearchParams({ view });
  if (q.trim()) query.set('q', q.trim());
  return apiFetch(`/api/admin/orders?${query}`);
}

/** @param {string} number e.g. "SK-7Q4M2X" */
export async function getAdminOrder(number) {
  const { order } = await apiFetch(`/api/admin/orders?number=${encodeURIComponent(number)}`);
  return order;
}

/** @param {{orderNumber: string, carrier: string, trackingNumber: string}} body */
export async function shipAdminOrder(body) {
  const { order } = await apiFetch('/api/admin/fulfill', { method: 'POST', body });
  return order;
}

export async function listAdminCustomers() {
  const { customers } = await apiFetch('/api/admin/customers');
  return customers;
}
