import { route, send } from '../_lib/http.js';
import { requireAdmin } from '../_lib/admin.js';
import { check, db } from '../_lib/supabase.js';

/**
 * GET /api/admin/customers  everyone who has paid for an order or made an
 * account, one row per email, most recent first. Admins only.
 */
export default route(['GET'], async (req, res) => {
  await requireAdmin(req);

  const [orders, accounts] = await Promise.all([
    db()
      .from('orders')
      .select('email, first_name, last_name, phone, customer_id, total_cents, status, paid_at')
      .in('status', ['paid', 'fulfilled', 'refunded', 'cancelled'])
      .order('paid_at', { ascending: false })
      .limit(5000)
      .then(check),
    db()
      .from('customers')
      .select('id, email, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)
      .then(check),
  ]);

  const byEmail = new Map();
  const row = (email) => {
    const key = String(email ?? '').toLowerCase();
    if (!byEmail.has(key)) {
      byEmail.set(key, {
        email: key,
        name: '',
        phone: '',
        hasAccount: false,
        joinedAt: null,
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: null,
      });
    }
    return byEmail.get(key);
  };

  for (const account of accounts) {
    const r = row(account.email);
    r.hasAccount = true;
    r.joinedAt = account.created_at;
    r.name ||= [account.first_name, account.last_name].filter(Boolean).join(' ');
  }
  for (const order of orders) {
    const r = row(order.email);
    if (order.customer_id) r.hasAccount = true;
    r.name ||= [order.first_name, order.last_name].filter(Boolean).join(' ');
    r.phone ||= order.phone ?? '';
    r.lastOrderAt ||= order.paid_at;
    // Refunded and cancelled orders count as orders but not as money spent.
    r.orderCount += 1;
    if (order.status === 'paid' || order.status === 'fulfilled') r.totalSpent += order.total_cents;
  }

  const customers = [...byEmail.values()].sort((a, b) =>
    String(b.lastOrderAt ?? b.joinedAt ?? '').localeCompare(
      String(a.lastOrderAt ?? a.joinedAt ?? ''),
    ),
  );
  return send(res, 200, { customers });
});
