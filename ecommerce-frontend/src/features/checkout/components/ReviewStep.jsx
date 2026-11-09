import { FiEdit2 } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { SHIPPING_METHODS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';
import { lineTotal } from '@/lib/calculateTotals';

const CARD = 'rounded-card border border-border bg-surface-raised p-5';

/** @param {{title: string, onEdit: () => void, children: import('react').ReactNode}} props */
function ReviewCard({ title, onEdit, children }) {
  return (
    <section className={CARD}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 text-xs transition-colors"
        >
          <FiEdit2 aria-hidden="true" className="size-3.5" />
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

/**
 * @param {object} props
 * @param {object} props.form the useCheckoutForm instance
 * @param {object[]} props.lines
 * @param {object} props.totals
 * @param {boolean} props.isPlacing
 * @param {string|null} props.submitError
 * @param {() => void} props.onPlaceOrder
 * @param {(step: string) => void} props.onEditStep
 */
export function ReviewStep({
  form,
  lines,
  totals,
  isPlacing,
  submitError,
  onPlaceOrder,
  onEditStep,
}) {
  const { values } = form;
  const method = SHIPPING_METHODS.find((m) => m.id === form.shippingMethodId);
  const last4 = values.cardNumber.replace(/\D/g, '').slice(-4);

  return (
    <div className="space-y-5">
      {submitError && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-field bg-danger-50 text-danger-600 px-3.5 py-3 text-sm"
        >
          {submitError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <ReviewCard title="Deliver to" onEdit={() => onEditStep('shipping')}>
          <address className="text-content-muted text-sm leading-relaxed not-italic">
            <span className="text-content block font-medium">
              {values.firstName} {values.lastName}
            </span>
            {values.address1}
            {values.address2 && <>, {values.address2}</>}
            <br />
            {values.city}, {values.state} {values.postalCode}
            <br />
            {values.email}
            <br />
            {values.phone}
          </address>
          <p className="border-border mt-3 border-t pt-3 text-sm">
            <span className="font-medium">{method?.label}</span>
            <span className="text-content-muted"> — {method?.detail}</span>
          </p>
        </ReviewCard>

        <ReviewCard title="Paying with" onEdit={() => onEditStep('payment')}>
          <p className="text-content-muted text-sm leading-relaxed">
            <span className="text-content block font-medium">{values.cardholder}</span>
            Card ending {last4}
            <br />
            Expires {values.cardExpiry}
          </p>
        </ReviewCard>
      </div>

      <section className={CARD}>
        <h3 className="mb-3 text-sm font-semibold">
          {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
        </h3>
        <ul className="divide-border divide-y">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center gap-3 py-3">
              <Image
                name={line.product.images[0]}
                alt=""
                sizes="3.5rem"
                ratio="aspect-square"
                className="rounded-field w-14 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{line.product.title}</p>
                <p className="text-content-subtle text-xs">
                  Qty {line.qty}
                  {[line.size, line.color].filter(Boolean).map((v) => ` · ${v}`)}
                </p>
              </div>
              <p className="text-sm font-medium tabular-nums">{formatCurrency(lineTotal(line))}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button
          size="lg"
          className="sm:flex-1"
          isLoading={isPlacing}
          disabled={lines.length === 0}
          onClick={onPlaceOrder}
        >
          Place order · {formatCurrency(totals.total)}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => onEditStep('payment')}>
          Back to payment
        </Button>
      </div>
    </div>
  );
}
