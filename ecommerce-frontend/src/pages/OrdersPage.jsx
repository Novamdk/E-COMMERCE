import { FiPackage } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import { ROUTES } from '@/lib/constants';
import { OrderCard, useOrders } from '@/features/orders';

export default function OrdersPage() {
  const { data: orders, loading, error, refetch } = useOrders();
  const isEmpty = !loading && !error && orders?.length === 0;

  return (
    <PageShell>
      <PageHeader
        title="Order history"
        description={isEmpty ? undefined : 'Every order you have placed in this browser.'}
        breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: 'Orders' }]}
      />

      <div className="mt-10">
        {loading && (
          <div className="space-y-4" aria-busy="true">
            <span className="sr-only" role="status">
              Loading your orders
            </span>
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} radius="card" className="h-44 w-full" />
            ))}
          </div>
        )}

        {error && <ErrorPanel title="Orders could not load" error={error} onRetry={refetch} />}

        {isEmpty && (
          <EmptyState
            icon={FiPackage}
            title="No orders yet"
            body="Orders you place will be listed here with their reference number and contents."
            action={<Button to={ROUTES.SHOP}>Start shopping</Button>}
          />
        )}

        {!loading && !error && orders?.length > 0 && (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
