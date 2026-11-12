import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiChevronRight, FiPackage, FiSearch } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminOrderPath } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import { AdminError, formatDateTime, fullName, listAdminOrders, STATUS } from '@/features/admin';

const VIEWS = [
  { id: 'to-ship', label: 'To ship', empty: 'Nothing to ship right now.' },
  { id: 'shipped', label: 'Shipped', empty: 'No shipped orders yet.' },
  { id: 'all', label: 'All paid', empty: 'No paid orders yet.' },
  { id: 'unpaid', label: 'Unfinished', empty: 'No unfinished checkouts.' },
];

export default function AdminOrdersPage() {
  usePageMeta({ title: 'Orders · Admin' });
  const [params, setParams] = useSearchParams();
  const view = VIEWS.some((v) => v.id === params.get('view')) ? params.get('view') : 'to-ship';
  const q = params.get('q') ?? '';
  const [draft, setDraft] = useState(q);

  const fetchOrders = useCallback(() => listAdminOrders({ view, q }), [view, q]);
  const { data, loading, error, refetch } = useAsync(fetchOrders);
  const orders = data?.orders ?? [];
  const current = VIEWS.find((v) => v.id === view);

  const setView = (id) => setParams(q ? { view: id, q } : { view: id });
  const search = (event) => {
    event.preventDefault();
    setParams(draft.trim() ? { view, q: draft.trim() } : { view });
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl">Orders</h1>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Order views">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={v.id === view}
            onClick={() => setView(v.id)}
            className={cn(
              'rounded-field shrink-0 border px-3.5 py-2 text-sm font-semibold whitespace-nowrap',
              v.id === view
                ? 'border-content bg-content text-content-inverse'
                : 'border-border bg-surface-raised text-content-muted hover:text-content',
            )}
          >
            {v.label}
            {data?.counts?.[v.id] != null && (
              <span className="ml-1.5 tabular-nums opacity-70">{data.counts[v.id]}</span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={search} className="mt-4" role="search">
        <label htmlFor="order-search" className="sr-only">
          Search by order number, email or last name
        </label>
        <Input
          id="order-search"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Order number, email or last name"
          prefix={<FiSearch className="size-4" />}
        />
      </form>

      <div className="mt-5">
        {loading && (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} radius="card" className="h-20 w-full" />
            ))}
          </div>
        )}

        {error && <AdminError error={error} onRetry={refetch} />}

        {!loading && !error && orders.length === 0 && (
          <EmptyState icon={FiPackage} title={q ? 'No orders match that search.' : current.empty} />
        )}

        {!loading && !error && orders.length > 0 && (
          <ul className="space-y-3">
            {orders.map((order) => {
              const status = STATUS[order.status] ?? STATUS.pending;
              return (
                <li key={order.number}>
                  <Link
                    to={adminOrderPath(order.number)}
                    className="rounded-card border-border bg-surface-raised hover:border-border-strong flex items-center gap-4 border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold tabular-nums">{order.number}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="mt-1 truncate text-sm">
                        {fullName(order) || order.email}
                        <span className="text-content-muted">
                          {' · '}
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </p>
                      <p className="text-content-muted mt-0.5 text-xs">
                        {formatDateTime(order.paidAt ?? order.createdAt)}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(order.totals.total)}
                    </span>
                    <FiChevronRight aria-hidden="true" className="text-content-subtle size-5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
