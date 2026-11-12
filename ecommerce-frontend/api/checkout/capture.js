import { HttpError, readJson, route, send, siteUrl } from '../_lib/http.js';
import { loadOrder, markPaid, toClientOrder } from '../_lib/orders.js';
import { capturePayPalOrder, completedCapture } from '../_lib/paypal.js';

/**
 * POST /api/checkout/capture
 * Body: { paypalOrderId }
 *
 * Called after the shopper approves in PayPal. Captures the money, checks it
 * matches the order total, marks the order paid and sends Placed Order to
 * Klaviyo. Returns { order, viewToken } for the confirmation page.
 */
export default route(['POST'], async (req, res) => {
  const body = await readJson(req).catch(() => {
    throw new HttpError(400, 'Invalid JSON');
  });
  const paypalOrderId = typeof body.paypalOrderId === 'string' ? body.paypalOrderId.trim() : '';
  if (!paypalOrderId) throw new HttpError(422, 'Missing PayPal order.');

  const { order } = await loadOrder('paypal_order_id', paypalOrderId);
  if (!order) throw new HttpError(404, 'We could not find that order.');

  if (order.status === 'pending') {
    const paypalOrder = await capturePayPalOrder(paypalOrderId);
    const result = await markPaid(order, paypalOrder, siteUrl(req));
    if (result.order.status !== 'paid') {
      // Money moved but not for this order's total: a person has to look.
      if (completedCapture(paypalOrder)) {
        throw new HttpError(
          409,
          `We received your payment but could not confirm order ${order.number}. Please contact us and we will sort it out.`,
        );
      }
      throw new HttpError(402, 'Your payment did not go through. You have not been charged.');
    }
    return send(res, 200, {
      order: toClientOrder(result.order, result.items),
      viewToken: result.order.view_token,
    });
  }

  if (order.status === 'cancelled' || order.status === 'refunded') {
    throw new HttpError(409, 'This order is no longer active.');
  }

  // Already paid (a retry, or the webhook got there first).
  const { order: fresh, items } = await loadOrder('id', order.id);
  return send(res, 200, { order: toClientOrder(fresh, items), viewToken: fresh.view_token });
});
