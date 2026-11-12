import { useCallback } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Image } from '@/components/ui/Image';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { useAsync } from '@/hooks/useAsync';
import { isPayPalEnabled } from '@/lib/backend';
import { productPath, ROUTES, SHIPPING_METHODS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';
import { getOrderById } from '@/services/orderService';

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeStyle: 'short',
});

/** @param {{label: string, value: string}} props */
function SummaryRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-content-muted">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isJustPlaced = Boolean(location.state?.isJustPlaced);
  // Guests open their order from the link in the confirmation email (?t=…).
  const viewToken = searchParams.get('t');

  const fetchOrder = useCallback(() => getOrderById(orderId, viewToken), [orderId, viewToken]);
  const { data: order, loading, error, refetch } = useAsync(fetchOrder);

  if (loading) {
    return (
      <PageShell width="narrow">
        <Skeleton className="size-14" radius="full" />
        <Skeleton className="mt-6 h-11 w-3/4" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-10 h-64 w-full" radius="panel" />
      </PageShell>
    );
  }

  if (error?.status === 404) {
    return (
      <PageShell width="narrow">
        <EmptyState
          icon={FiPackage}
          title="We could not find that order"
          body={
            isPayPalEnabled
              ? 'Open the order from the link in your confirmation email, or sign in to the account you ordered with.'
              : 'Order references are stored in this browser. If you cleared your site data, the record is gone.'
          }
          action={<Button to={ROUTES.ORDERS}>View your orders</Button>}
        />
      </PageShell>
    );
  }

  if (error || !order) {
    return (
      <PageShell width="narrow">
        <ErrorPanel title="This order could not load" error={error} onRetry={refetch} />
      </PageShell>
    );
  }

  const method = SHIPPING_METHODS.find((m) => m.id === order.shippingMethodId);
  const itemCount = order.lines.reduce((n, line) => n + line.qty, 0);

  return (
    <PageShell width="narrow">
      <span className="bg-success-50 text-success-600 grid size-14 place-items-center rounded-full">
        <FiCheckCircle aria-hidden="true" className="size-7" />
      </span>

      <h1 className="font-display text-display-sm sm:text-display mt-6">
        {isJustPlaced ? 'Thank you — your order is confirmed' : `Order ${order.id}`}
      </h1>

      <p className="text-content-muted mt-4 leading-relaxed">
        We have emailed a confirmation to{' '}
        <span className="text-content font-medium">{order.shipping.email}</span>. Your reference is{' '}
        <span className="text-content font-medium tabular-nums">{order.id}</span>.
      </p>

      {!isPayPalEnabled && (
        <p className="rounded-field bg-surface-sunken text-content-muted mt-4 px-3.5 py-3 text-xs leading-relaxed">
          This is a demo storefront — no email was actually sent, no payment was taken, and nothing
          will ship. The order is recorded in your browser so the history page has something real to
          show.
        </p>
      )}

      <section
        aria-labelledby="order-items-heading"
        className="rounded-panel border-border bg-surface-raised mt-10 border p-6"
      >
        <h2 id="order-items-heading" className="font-display text-xl">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </h2>

        <ul className="divide-border mt-4 divide-y">
          {order.lines.map((line) => (
            <li
              key={`${line.productId}-${line.size ?? ''}-${line.color ?? ''}-${line.isGift ? 'gift' : ''}`}
              className="flex items-center gap-3 py-3.5"
            >
              <Image
                name={line.image}
                alt=""
                sizes="3.5rem"
                ratio="aspect-square"
                className="rounded-field w-14 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  <Link to={productPath(line.slug)} className="hover:underline">
                    {line.title}
                  </Link>
                </p>
                <p className="text-content-subtle text-xs">
                  Qty {line.qty}
                  {line.size ? ` · ${line.size}` : ''}
                  {line.color ? ` · ${line.color}` : ''}
                </p>
              </div>
              <p className="text-sm font-medium tabular-nums">
                {line.isGift ? 'Free gift' : formatCurrency(line.unitPrice * line.qty)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="border-border mt-5 space-y-2.5 border-t pt-5">
          <SummaryRow label="Subtotal" value={formatCurrency(order.totals.subtotal)} />
          {order.totals.discount > 0 && (
            <SummaryRow
              label={`Discount (${order.promoCode})`}
              value={`−${formatCurrency(order.totals.discount)}`}
            />
          )}
          <SummaryRow
            label={`Shipping (${method?.label ?? 'Standard'})`}
            value={order.totals.shipping === 0 ? 'Free' : formatCurrency(order.totals.shipping)}
          />
          <SummaryRow label="Tax" value={formatCurrency(order.totals.tax)} />
          <div className="border-border flex items-baseline justify-between gap-4 border-t pt-3">
            <span className="font-medium">Total paid</span>
            <span className="font-display text-2xl tabular-nums">
              {formatCurrency(order.totals.total)}
            </span>
          </div>
        </dl>
      </section>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold">Shipping to</h2>
          <address className="text-content-muted mt-2 text-sm leading-relaxed not-italic">
            {order.shipping.firstName} {order.shipping.lastName}
            <br />
            {order.shipping.address1}
            {order.shipping.address2 && <>, {order.shipping.address2}</>}
            <br />
            {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}
          </address>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Order details</h2>
          <p className="text-content-muted mt-2 text-sm leading-relaxed">
            Placed {DATE_FORMAT.format(new Date(order.placedAt))}
            <br />
            {order.payment.last4 ? `Card ending ${order.payment.last4}` : 'Paid with PayPal'}
            <br />
            {method?.detail}
            {order.tracking && (
              <>
                <br />
                Shipped with {order.tracking.carrier}, tracking {order.tracking.number}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        <Button to={ROUTES.SHOP}>Continue shopping</Button>
        <Button to={ROUTES.ORDERS} variant="secondary">
          View all orders
        </Button>
      </div>
    </PageShell>
  );
}
