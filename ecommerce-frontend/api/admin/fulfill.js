import { HttpError, readJson, route, send, siteUrl } from '../_lib/http.js';
import { requireAdmin, toAdminOrder } from '../_lib/admin.js';
import { sendOrderStatus } from '../_lib/klaviyo.js';
import { loadOrder } from '../_lib/orders.js';
import { check, db } from '../_lib/supabase.js';

/**
 * POST /api/admin/fulfill  mark a paid order as shipped, or fix the tracking
 * on one already shipped. Admins only (see requireAdmin).
 * Body: { orderNumber: "SK-XXXXXX", carrier?: "USPS", trackingNumber?: "..." }
 *
 * The first time an order is marked shipped, Klaviyo gets Fulfilled Order
 * with the carrier and tracking number, which starts the shipped email.
 */
export default route(['POST'], async (req, res) => {
  await requireAdmin(req);

  const body = await readJson(req).catch(() => {
    throw new HttpError(400, 'Invalid JSON');
  });
  const number = String(body.orderNumber ?? '')
    .trim()
    .toUpperCase();
  const { order, items } = await loadOrder('number', number);
  if (!order) throw new HttpError(404, 'Order not found.');

  const carrier = typeof body.carrier === 'string' ? body.carrier.trim().slice(0, 40) : '';
  const trackingNumber =
    typeof body.trackingNumber === 'string'
      ? body.trackingNumber.replace(/\s+/g, '').slice(0, 80)
      : '';

  if (order.status === 'fulfilled') {
    // Only the tracking details change; the shipped email has already gone.
    const [fixed] = check(
      await db()
        .from('orders')
        .update({ carrier: carrier || null, tracking_number: trackingNumber || null })
        .eq('id', order.id)
        .select('*'),
    );
    return send(res, 200, { ok: true, order: toAdminOrder(fixed ?? order, items) });
  }
  if (order.status !== 'paid') throw new HttpError(409, `This order is ${order.status}, not paid.`);

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
      Carrier: carrier,
      TrackingNumber: trackingNumber,
      TrackingURL: trackingUrl(carrier, trackingNumber),
    });
  }
  const { order: fresh, items: freshItems } = await loadOrder('id', order.id);
  return send(res, 200, { ok: true, order: toAdminOrder(fresh, freshItems) });
});

/** The carrier's own tracking page, for the shipped email's button. */
function trackingUrl(carrier, number) {
  if (!number) return '';
  const n = encodeURIComponent(number);
  switch (carrier.toLowerCase()) {
    case 'usps':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    case 'ups':
      return `https://www.ups.com/track?tracknum=${n}`;
    case 'fedex':
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    case 'dhl':
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`;
    default:
      return '';
  }
}
