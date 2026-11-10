import { readText, route, send, siteUrl } from '../_lib/http.js';
import { sendOrderStatus } from '../_lib/klaviyo.js';
import { loadOrder, markPaid } from '../_lib/orders.js';
import { capturePayPalOrder, verifyWebhook } from '../_lib/paypal.js';
import { check, db } from '../_lib/supabase.js';

/**
 * POST /api/paypal/webhook — PayPal's notifications for SK Envision's app.
 * Subscribe the webhook (in the PayPal developer dashboard) to:
 *   CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED,
 *   PAYMENT.CAPTURE.REFUNDED, PAYMENT.CAPTURE.REVERSED, PAYMENT.CAPTURE.DENIED
 * and put its id in PAYPAL_WEBHOOK_ID. Every delivery is verified with PayPal
 * before anything changes, and each event id is handled once.
 *
 * This is the safety net for shoppers who approve and then close the tab
 * before the site's capture call finishes, and the only way refunds made in
 * PayPal reach the order and Klaviyo.
 */

const orderIdOf = (resource) =>
  resource?.supplementary_data?.related_ids?.order_id ?? resource?.id ?? null;

async function handle(event, site) {
  const resource = event.resource ?? {};

  switch (event.event_type) {
    case 'CHECKOUT.ORDER.APPROVED': {
      const { order } = await loadOrder('paypal_order_id', resource.id);
      if (order?.status === 'pending')
        await markPaid(order, await capturePayPalOrder(resource.id), site);
      return;
    }
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const { order } = await loadOrder('paypal_order_id', orderIdOf(resource));
      if (order?.status === 'pending') {
        await markPaid(order, { purchase_units: [{ payments: { captures: [resource] } }] }, site);
      }
      return;
    }
    case 'PAYMENT.CAPTURE.REFUNDED':
    case 'PAYMENT.CAPTURE.REVERSED':
    case 'PAYMENT.CAPTURE.DENIED': {
      // A refund resource links to its capture; a capture resource is the capture.
      const captureId =
        event.event_type === 'PAYMENT.CAPTURE.REFUNDED'
          ? (resource.links
              ?.find((link) => link.rel === 'up')
              ?.href?.split('/')
              .pop() ?? null)
          : resource.id;
      let { order, items } = await loadOrder('paypal_capture_id', captureId);
      if (!order) ({ order, items } = await loadOrder('paypal_order_id', orderIdOf(resource)));
      if (!order) return;

      const isRefund = event.event_type !== 'PAYMENT.CAPTURE.DENIED';
      const status = isRefund ? 'refunded' : 'cancelled';
      if (order.status === status) return;
      const now = new Date().toISOString();
      check(
        await db()
          .from('orders')
          .update({ status, ...(isRefund ? { refunded_at: now } : { cancelled_at: now }) })
          .eq('id', order.id),
      );
      await sendOrderStatus(isRefund ? 'Refunded Order' : 'Cancelled Order', order, items, site, {
        ...(isRefund && resource.amount ? { RefundAmount: Number(resource.amount.value) } : {}),
      });
      return;
    }
    default:
  }
}

export default route(['POST'], async (req, res) => {
  const raw = await readText(req);
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return send(res, 400, { error: 'Invalid JSON' });
  }

  const headers = Object.fromEntries(
    Object.entries(req.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value]),
  );
  if (!(await verifyWebhook(headers, event))) return send(res, 401, { error: 'Invalid signature' });

  // Record first so a retry of the same delivery does nothing twice.
  const { error } = await db()
    .from('paypal_events')
    .insert({
      id: event.id,
      event_type: event.event_type,
      resource_id: event.resource?.id ?? null,
    });
  if (error?.code === '23505') return send(res, 200, { ok: true, duplicate: true });
  if (error) throw new Error(`Supabase: ${error.message}`);

  try {
    await handle(event, siteUrl(req));
  } catch (handleError) {
    // Let PayPal retry later: forget the event so the retry is processed.
    await db().from('paypal_events').delete().eq('id', event.id);
    throw handleError;
  }
  return send(res, 200, { ok: true });
});
