import { HttpError, route, send } from '../_lib/http.js';
import { requireAdmin, toAdminOrder } from '../_lib/admin.js';
import { loadOrder } from '../_lib/orders.js';
import { check, db } from '../_lib/supabase.js';

const VIEWS = {
  // Paid and waiting to be packed.
  'to-ship': ['paid'],
  shipped: ['fulfilled'],
  // Everything a customer actually paid for, plus what was undone later.
  all: ['paid', 'fulfilled', 'refunded', 'cancelled'],
  // Checkouts that never finished paying.
  unpaid: ['pending'],
};

/**
 * GET /api/admin/orders?view=to-ship|shipped|all|unpaid&q=  orders, newest first
 * GET /api/admin/orders?number=SK-XXXXXX                      one order with items
 * Admins only (see requireAdmin).
 */
export default route(['GET'], async (req, res) => {
  await requireAdmin(req);
  const url = new URL(req.url, 'http://local');

  const number = url.searchParams.get('number');
  if (number) {
    const { order, items } = await loadOrder('number', number.trim().toUpperCase());
    if (!order) throw new HttpError(404, 'Order not found.');
    return send(res, 200, { order: toAdminOrder(order, items) });
  }

  const view = VIEWS[url.searchParams.get('view')] ? url.searchParams.get('view') : 'to-ship';
  let query = db()
    .from('orders')
    .select('*, order_items(quantity)')
    .in('status', VIEWS[view])
    .order('created_at', { ascending: view === 'to-ship' })
    .limit(200);

  // Order number, email or last name. Commas and brackets would break the filter.
  const search = (url.searchParams.get('q') ?? '').replace(/[^\w@.+\- ]/g, '').trim();
  if (search) {
    const like = `%${search}%`;
    query = query.or(`number.ilike.${like},email.ilike.${like},last_name.ilike.${like}`);
  }

  const rows = check(await query);
  const orders = rows.map(({ order_items: items, ...order }) => {
    const { items: _skip, ...summary } = toAdminOrder(order, items);
    return summary;
  });

  const counts = {};
  for (const [name, statuses] of Object.entries(VIEWS)) {
    const { count, error } = await db()
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', statuses);
    if (!error) counts[name] = count ?? 0;
  }

  return send(res, 200, { view, orders, counts });
});
