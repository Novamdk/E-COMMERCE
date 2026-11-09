import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';

/**
 * @param {object} props
 * @param {{label: string, value: string, tone?: 'default'|'positive'}} props
 */
function Row({ label, value, tone = 'default' }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-content-muted">{label}</dt>
      <dd
        className={cn(
          'font-medium tabular-nums',
          tone === 'positive' ? 'text-success-600' : 'text-content',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * The order money breakdown. Receives computed totals — it never does math.
 *
 * @param {object} props
 * @param {object} props.totals result of calculateTotals
 * @param {boolean} [props.hasShippingEstimate] label shipping as an estimate
 */
export function CartSummary({ totals, hasShippingEstimate = true }) {
  const { subtotal, discount, shipping, tax, total, promo, freeShippingRemaining } = totals;

  return (
    <div className="space-y-3">
      <dl className="space-y-2.5">
        <Row label="Subtotal" value={formatCurrency(subtotal)} />

        {discount > 0 && (
          <Row
            label={`Discount (${promo?.code})`}
            value={`−${formatCurrency(discount)}`}
            tone="positive"
          />
        )}

        <Row
          label={hasShippingEstimate ? 'Shipping (estimated)' : 'Shipping'}
          value={shipping === 0 ? 'Free' : formatCurrency(shipping)}
          tone={shipping === 0 ? 'positive' : 'default'}
        />

        <Row label="Tax" value={formatCurrency(tax)} />
      </dl>

      {freeShippingRemaining > 0 && subtotal > 0 && (
        <p className="rounded-field bg-surface-brand text-brand-700 px-3.5 py-2.5 text-xs">
          Add {formatCurrency(freeShippingRemaining)} more for free shipping.
        </p>
      )}

      <div className="border-border flex items-baseline justify-between gap-4 border-t pt-3">
        <span className="font-medium">Total</span>
        <span className="font-display text-2xl tabular-nums">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
