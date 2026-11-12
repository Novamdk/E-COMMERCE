import { useCallback, useMemo, useState } from 'react';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatCurrency } from '@/lib/formatCurrency';
import { AdminError, formatDay, listAdminCustomers } from '@/features/admin';

export default function AdminCustomersPage() {
  usePageMeta({ title: 'Customers · Admin' });
  const fetchCustomers = useCallback(() => listAdminCustomers(), []);
  const { data, loading, error, refetch } = useAsync(fetchCustomers);
  const [q, setQ] = useState('');

  const customers = useMemo(() => {
    const term = q.trim().toLowerCase();
    const all = data ?? [];
    if (!term) return all;
    return all.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(term));
  }, [data, q]);

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl">Customers</h1>
      <p className="text-content-muted mt-1 text-sm">
        Everyone who paid for an order or made an account.
      </p>

      <div className="mt-5">
        <label htmlFor="customer-search" className="sr-only">
          Search customers
        </label>
        <Input
          id="customer-search"
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Name, email or phone"
          prefix={<FiSearch className="size-4" />}
        />
      </div>

      <div className="mt-5">
        {loading && (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} radius="card" className="h-20 w-full" />
            ))}
          </div>
        )}

        {error && <AdminError error={error} onRetry={refetch} />}

        {!loading && !error && customers.length === 0 && (
          <EmptyState
            icon={FiUsers}
            title={q ? 'No customers match that search.' : 'No customers yet.'}
          />
        )}

        {!loading && !error && customers.length > 0 && (
          <ul className="space-y-3">
            {customers.map((c) => (
              <li
                key={c.email}
                className="rounded-card border-border bg-surface-raised flex flex-wrap items-start gap-x-4 gap-y-2 border p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.name || c.email}</span>
                    {c.hasAccount && <Badge variant="brand">Account</Badge>}
                  </div>
                  <p className="text-content-muted mt-1 truncate text-sm">
                    <a href={`mailto:${c.email}`} className="hover:underline">
                      {c.email}
                    </a>
                    {c.phone && (
                      <>
                        {' · '}
                        <a href={`tel:${c.phone}`} className="hover:underline">
                          {c.phone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold tabular-nums">{formatCurrency(c.totalSpent)}</p>
                  <p className="text-content-muted text-xs">
                    {c.orderCount} {c.orderCount === 1 ? 'order' : 'orders'}
                    {c.lastOrderAt
                      ? ` · last ${formatDay(c.lastOrderAt)}`
                      : c.joinedAt
                        ? ` · joined ${formatDay(c.joinedAt)}`
                        : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
