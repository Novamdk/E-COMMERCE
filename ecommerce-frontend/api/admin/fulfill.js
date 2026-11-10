import { bearerToken, HttpError, readJson, route, send, siteUrl } from '../_lib/http.js';
import { sendOrderStatus } from '../_lib/klaviyo.js';
import { loadOrder, tokensMatch } from '../_lib/orders.js';
import { check, db } from '../_lib/supabase.js';

/**
 * POST /api/admin/fulfill — mark a paid order as shipped.
 * Header: Authorization: Bearer <ADMIN_API_TOKEN>
 * Body:   { orderNumber: "SK-XXXXXX", carrier?: "USPS", trackingNumber?: "..." }
 *
 * Saves the tracking details and sends Fulfilled Order to Klaviyo, which
 * starts the post-purchase and review emails.
 */
export default route(['POST'], async (req, res) => {
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken || !tokensMatch(bearerToken(req.headers.authorization), adminToken)) {
    throw new HttpError(401, 'Not allowed.');
  }

  const body = await readJson(req).catch(() => {
    throw new HttpError(400, 'Invalid JSON');
  });
  const number = String(body.orderNumber ?? '')
    .trim()
    .toUpperCase();
  const { order, items } = await loadOrder('number', number);
  if (!order) throw new HttpError(404, 'Order not found.');
  if (order.status === 'fulfilled') return send(res, 200, { ok: true, alreadyFulfilled: true });
  if (order.status !== 'paid') throw new HttpError(409, `Order is ${order.status}, not paid.`);

  const carrier = typeof body.carrier === 'string' ? body.carrier.trim().slice(0, 40) : null;
  const trackingNumber =
    typeof body.trackingNumber === 'string' ? body.trackingNumber.trim().slice(0, 80) : null;

  const [updated] = check(
    await db()
      .from('orders')
      .update({
        status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        carrier: carrier || null,
        tracking_number: trackingNumber || null,
      })
      .eq('id', order.id)
      .eq('status', 'paid')
      .select('*'),
  );
  if (updated) {
    await sendOrderStatus('Fulfilled Order', updated, items, siteUrl(req), {
      Carrier: carrier ?? '',
      TrackingNumber: trackingNumber ?? '',
    });
  }
  return send(res, 200, { ok: true });
});
