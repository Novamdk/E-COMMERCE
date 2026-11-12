import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiExternalLink, FiPrinter, FiTruck } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { BrandMark } from '@/components/layout/BrandMark';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { CONTACT, ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';
import {
  addressLines,
  AdminError,
  CARRIERS,
  formatDateTime,
  getAdminOrder,
  shipAdminOrder,
  shippingLabel,
  STATUS,
  trackingUrl,
} from '@/features/admin';

function Panel({ title, action, children }) {
  return (
    <section className="rounded-card border-border bg-surface-raised border p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-content-muted text-xs font-semibold tracking-[0.14em] uppercase">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ label, value, isStrong = false }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-content-muted">{label}</dt>
      <dd className={isStrong ? 'font-semibold tabular-nums' : 'tabular-nums'}>{value}</dd>
    </div>
  );
}

function itemDetail(item) {
  return [item.size, item.color, item.isGift ? 'Free gift' : null].filter(Boolean).join(' · ');
}

/** Copies the shipping address in label order, for pasting into a label site. */
function CopyAddress({ order }) {
  const [isCopied, setIsCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(addressLines(order).join('\n'));
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="text-content-muted hover:text-content inline-flex items-center gap-1.5 text-xs font-semibold"
    >
      <FiCopy aria-hidden="true" className="size-3.5" />
      {isCopied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ShipForm({ order, onShipped }) {
  const isShipped = order.status === 'fulfilled';
  const [carrier, setCarrier] = useState(order.carrier || 'USPS');
  const [tracking, setTracking] = useState(order.trackingNumber);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await shipAdminOrder({
        orderNumber: order.number,
        carrier,
        trackingNumber: tracking,
      });
      setIsConfirming(false);
      onShipped(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (isShipped) save();
    else setIsConfirming(true);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <FormField id="carrier" label="Carrier">
          <select
            id="carrier"
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            className="rounded-field border-border bg-surface-raised h-11 w-full border px-3"
          >
            {CARRIERS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </FormField>
        <FormField id="tracking" label="Tracking number" isOptional>
          <Input
            id="tracking"
            value={tracking}
            onChange={(event) => setTracking(event.target.value)}
            autoComplete="off"
            inputMode="text"
          />
        </FormField>
      </div>

      {error && (
        <p role="alert" className="text-danger-600 text-sm">
          {error}
        </p>
      )}

      {isConfirming ? (
        <div className="rounded-field bg-ink-50 space-y-3 p-4 text-sm">
          <p>
            Mark {order.number} as shipped? This tells Klaviyo, which sends the customer the shipped
            email once that email is turned on.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={save} isLoading={isSaving}>
              Yes, mark shipped
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button type="submit" variant={isShipped ? 'secondary' : 'primary'} isLoading={isSaving}>
          <FiTruck aria-hidden="true" className="size-4" />
          {isShipped ? 'Save tracking' : 'Mark shipped'}
        </Button>
      )}
    </form>
  );
}

/** Only shown when printing: what goes in the box. */
function PackingSlip({ order }) {
  return (
    <div className="hidden text-black print:block">
      <div className="flex items-start justify-between gap-6">
        <BrandMark size="lg" />
        <div className="text-right text-sm">
          <p className="text-lg font-semibold">Packing slip</p>
          <p>Order {order.number}</p>
          <p>{formatDateTime(order.paidAt ?? order.createdAt)}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-semibold">Ship to</p>
          {addressLines(order).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div>
          <p className="font-semibold">From</p>
          <p>SK Envision</p>
          {CONTACT.ADDRESS_LINES.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black">
            <th className="py-2 font-semibold">Item</th>
            <th className="py-2 text-right font-semibold">Qty</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="py-2">
                {item.title}
                {itemDetail(item) && <span className="block text-xs">{itemDetail(item)}</span>}
              </td>
              <td className="py-2 text-right">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-10 text-sm">
        Thank you for your order! Questions? {CONTACT.EMAIL} · {CONTACT.PHONE}
      </p>
    </div>
  );
}

export default function AdminOrderPage() {
  const { number } = useParams();
  usePageMeta({ title: `${number} · Admin` });
  const fetchOrder = useCallback(() => getAdminOrder(number), [number]);
  const { data, loading, error, refetch } = useAsync(fetchOrder);
  const [saved, setSaved] = useState(null);
  const order = saved?.number === number ? saved : data;

  const back = (
    <Link
      to={ROUTES.ADMIN_ORDERS}
      className="text-content-muted hover:text-content inline-flex items-center gap-1.5 text-sm font-semibold print:hidden"
    >
      <FiArrowLeft aria-hidden="true" className="size-4" />
      All orders
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {back}
        <Skeleton className="h-10 w-1/2" />
        <Skeleton radius="card" className="h-40 w-full" />
        <Skeleton radius="card" className="h-40 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-4">
        {back}
        <AdminError error={error} onRetry={refetch} />
      </div>
    );
  }

  const status = STATUS[order.status] ?? STATUS.pending;
  const trackHref = trackingUrl(order.carrier, order.trackingNumber);
  const canShip = order.status === 'paid' || order.status === 'fulfilled';

  return (
    <>
      <div className="space-y-5 print:hidden">
        {back}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-2xl tabular-nums sm:text-3xl">{order.number}</h1>
          <Badge variant={status.variant} size="md">
            {status.label}
          </Badge>
          <Button variant="secondary" size="sm" className="ml-auto" onClick={() => window.print()}>
            <FiPrinter aria-hidden="true" className="size-4" />
            Print packing slip
          </Button>
        </div>
        <p className="text-content-muted -mt-3 text-sm">
          Paid {formatDateTime(order.paidAt ?? order.createdAt)}
          {order.fulfilledAt && ` · Shipped ${formatDateTime(order.fulfilledAt)}`}
        </p>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Ship to" action={<CopyAddress order={order} />}>
            <address className="text-sm leading-relaxed not-italic">
              {addressLines(order).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <p className="text-content-muted mt-3 text-sm">
              <a href={`mailto:${order.email}`} className="hover:underline">
                {order.email}
              </a>
              {order.phone && (
                <>
                  {' · '}
                  <a href={`tel:${order.phone}`} className="hover:underline">
                    {order.phone}
                  </a>
                </>
              )}
            </p>
            <p className="mt-2 text-sm">
              <span className="text-content-muted">Shipping: </span>
              {shippingLabel(order.shippingMethod)}
            </p>
          </Panel>

          <Panel title={order.status === 'fulfilled' ? 'Shipment' : 'Ship this order'}>
            {canShip ? (
              <>
                {trackHref && (
                  <a
                    href={trackHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-700 mb-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  >
                    Track on {order.carrier}
                    <FiExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                )}
                <ShipForm key={order.status} order={order} onShipped={setSaved} />
              </>
            ) : (
              <p className="text-content-muted text-sm">
                {order.status === 'pending'
                  ? 'This checkout was never paid. Do not ship it.'
                  : `This order was ${status.label.toLowerCase()}. Do not ship it.`}
              </p>
            )}
          </Panel>
        </div>

        <Panel title={`Items (${order.itemCount})`}>
          <ul className="divide-border divide-y">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-4 py-2.5 text-sm">
                <span>
                  <span className="font-semibold tabular-nums">{item.quantity} ×</span> {item.title}
                  {itemDetail(item) && (
                    <span className="text-content-muted block text-xs">{itemDetail(item)}</span>
                  )}
                </span>
                <span className="tabular-nums">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="border-border mt-3 space-y-1.5 border-t pt-3">
            <Row label="Subtotal" value={formatCurrency(order.totals.subtotal)} />
            {order.totals.discount > 0 && (
              <Row
                label={order.promoCode ? `Discount (${order.promoCode})` : 'Discount'}
                value={`−${formatCurrency(order.totals.discount)}`}
              />
            )}
            <Row label="Shipping" value={formatCurrency(order.totals.shipping)} />
            <Row label="Tax" value={formatCurrency(order.totals.tax)} />
            <Row label="Total paid" value={formatCurrency(order.totals.total)} isStrong />
          </dl>
          {order.paypalCaptureId && (
            <p className="text-content-subtle mt-3 text-xs">
              PayPal transaction {order.paypalCaptureId}
            </p>
          )}
        </Panel>
      </div>

      <PackingSlip order={order} />
    </>
  );
}
