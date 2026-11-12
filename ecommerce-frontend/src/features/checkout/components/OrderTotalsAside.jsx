import { useId, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Image } from '@/components/ui/Image';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import { lineTotal } from '@/lib/calculateTotals';
import { CartSummary } from '@/features/cart';
import { primaryImage } from '@/lib/productImage';

/**
 * Order recap for every checkout step. On a wide screen it is a sticky
 * column; on a phone it sits at the top of the page as a bar with the total
 * that opens to show the items and the breakdown.
 *
 * @param {object} props
 * @param {object[]} props.lines
 * @param {object} props.totals
 * @param {boolean} props.isLoading
 * @param {boolean} [props.isOpenOnPhone] start opened on a phone (the pay step); the
 *   checkout gives each step its own key so this applies again on a step change
 * @param {string} [props.className]
 */
export function OrderTotalsAside({ lines, totals, isLoading, isOpenOnPhone = false, className }) {
  const [isOpen, setIsOpen] = useState(isOpenOnPhone);
  const panelId = useId();

  return (
    <aside aria-labelledby="checkout-summary-heading" className={className}>
      <div className="rounded-panel border-border bg-surface-raised border lg:sticky lg:top-28">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left lg:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            {isOpen ? 'Hide order summary' : 'Show order summary'}
            <FiChevronDown
              aria-hidden="true"
              className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
            />
          </span>
          <span className="font-semibold tabular-nums">
            {isLoading ? '…' : formatCurrency(totals.total)}
          </span>
        </button>

        <div
          id={panelId}
          className={cn(
            'space-y-5 px-5 pb-5 lg:block lg:space-y-6 lg:p-6',
            isOpen ? 'block' : 'hidden',
          )}
        >
          <h2 id="checkout-summary-heading" className="font-display hidden text-xl lg:block">
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
                    name={primaryImage(line.product)}
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
      </div>
    </aside>
  );
}
