import { bearerToken, HttpError, route, send } from '../_lib/http.js';
import { loadOrder, tokensMatch, toClientOrder } from '../_lib/orders.js';
import { userFromToken } from '../_lib/supabase.js';

/**
 * GET /api/orders/SK-XXXXXX?t=<view token>
 * Returns one order to its owner: the signed-in account it belongs to, or
 * anyone holding the order's view token (guest checkout, emailed links).
 * Unknown and not-yours look the same, so order numbers cannot be probed.
 */
export default route(['GET'], async (req, res) => {
  const number = String(req.query?.number ?? '').toUpperCase();
  if (!/^SK-[A-Z0-9]{6}$/.test(number)) throw new HttpError(404, 'Order not found.');

  const { order, items } = await loadOrder('number', number);
  if (!order || order.status === 'pending') throw new HttpError(404, 'Order not found.');

  const token = typeof req.query?.t === 'string' ? req.query.t : '';
  let allowed = tokensMatch(token, order.view_token);
  if (!allowed && order.customer_id) {
    const user = await userFromToken(bearerToken(req.headers.authorization));
    allowed = user?.id === order.customer_id;
  }
  if (!allowed) throw new HttpError(404, 'Order not found.');

  return send(res, 200, { order: toClientOrder(order, items) });
});
