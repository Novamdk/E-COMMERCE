import { bearerToken, HttpError, route, send } from '../_lib/http.js';
import { toClientOrder } from '../_lib/orders.js';
import { check, db, userFromToken } from '../_lib/supabase.js';

/**
 * GET /api/orders — the signed-in shopper's paid orders, newest first.
 * Header: Authorization: Bearer <Supabase access token>
 */
export default route(['GET'], async (req, res) => {
  const user = await userFromToken(bearerToken(req.headers.authorization));
  if (!user) throw new HttpError(401, 'Please sign in to see your orders.');

  const orders = check(
    await db()
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', user.id)
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(100),
  );

  return send(res, 200, {
    orders: orders.map(({ order_items: items, ...order }) =>
      toClientOrder(
        order,
        [...items].sort((a, b) => a.id - b.id),
      ),
    ),
  });
});
