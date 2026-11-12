import { bearerToken, HttpError } from './http.js';
import { tokensMatch } from './orders.js';
import { db } from './supabase.js';

/** Emails allowed into /admin, from ADMIN_EMAILS (comma or space separated). */
export function adminEmails() {
  return String(process.env.ADMIN_EMAILS ?? '')
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Lets a request through only for the store's admins: a signed-in account
 * whose confirmed email is listed in ADMIN_EMAILS, or a script sending the
 * ADMIN_API_TOKEN. Everyone else gets 401 (not signed in) or 403.
 *
 * @returns {Promise<{email: string}>}
 */
export async function requireAdmin(req) {
  const token = bearerToken(req.headers.authorization);
  if (!token) throw new HttpError(401, 'Please sign in.');

  const apiToken = process.env.ADMIN_API_TOKEN;
  if (apiToken && tokensMatch(token, apiToken)) return { email: 'api' };

  const { data, error } = await db().auth.getUser(token);
  const user = error ? null : data?.user;
  if (!user) throw new HttpError(401, 'Please sign in.');

  const allowed = adminEmails();
  if (!allowed.length) throw new HttpError(403, 'The admin area is not set up yet.');
  const email = String(user.email ?? '').toLowerCase();
  // An unconfirmed sign-up must not borrow an admin's address.
  const isConfirmed = Boolean(user.email_confirmed_at ?? user.confirmed_at);
  if (!isConfirmed || !allowed.includes(email)) {
    throw new HttpError(403, 'This account does not have access to the admin area.');
  }
  return { email };
}

/** The fields the admin screens show for one order. */
export function toAdminOrder(order, items = []) {
  const address = order.shipping_address ?? {};
  return {
    number: order.number,
    status: order.status,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    fulfilledAt: order.fulfilled_at,
    cancelledAt: order.cancelled_at,
    refundedAt: order.refunded_at,
    hasAccount: Boolean(order.customer_id),
    email: order.email,
    firstName: order.first_name ?? '',
    lastName: order.last_name ?? '',
    phone: order.phone ?? '',
    address: {
      address1: address.address1 ?? '',
      address2: address.address2 ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      postalCode: address.postalCode ?? '',
      country: address.country ?? 'US',
    },
    shippingMethod: order.shipping_method,
    promoCode: order.promo_code,
    totals: {
      subtotal: order.subtotal_cents,
      discount: order.discount_cents,
      shipping: order.shipping_cents,
      tax: order.tax_cents,
      total: order.total_cents,
    },
    carrier: order.carrier ?? '',
    trackingNumber: order.tracking_number ?? '',
    paypalCaptureId: order.paypal_capture_id ?? '',
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    items: items.map((item) => ({
      productId: item.product_id,
      slug: item.slug,
      title: item.title,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unit_price_cents,
      lineTotal: item.line_total_cents,
      isGift: item.is_gift,
    })),
  };
}
