import { Image } from '@/components/ui/Image';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/formatCurrency';
import { lineTotal } from '@/lib/calculateTotals';
import { CartSummary } from '@/features/cart';

/**
 * Sticky order recap shown beside every checkout step.
 *
 * @param {object} props
 * @param {object[]} props.lines
 * @param {object} props.totals
 * @param {boolean} props.isLoading
 */
export function OrderTotalsAside({ lines, totals, isLoading }) {
  return (
    <aside aria-labelledby="checkout-summary-heading">
      <div className="rounded-panel border-border bg-surface-raised sticky top-28 space-y-6 border p-6">
        <h2 id="checkout-summary-heading" className="font-display text-xl">
          Order summary
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="aspect-square w-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3.5">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-3">
                <Image
                  name={line.product.images[0]}
                  alt=""
                  sizes="3rem"
                  ratio="aspect-square"
                  className="rounded-field w-12 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.product.title}</p>
                  <p className="text-content-subtle text-xs">
                    Qty {line.qty}
                    {line.size ? ` · ${line.size}` : ''}
                    {line.color ? ` · ${line.color}` : ''}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{formatCurrency(lineTotal(line))}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="border-border border-t pt-5">
          <CartSummary totals={totals} hasShippingEstimate={false} />
        </div>
      </div>
    </aside>
  );
}
