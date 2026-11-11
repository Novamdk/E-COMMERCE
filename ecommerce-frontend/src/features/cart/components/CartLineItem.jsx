import { Link } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import { Image } from '@/components/ui/Image';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { cn } from '@/lib/cn';
import { productPath } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';
import { lineTotal } from '@/lib/calculateTotals';
import { useCart } from '../useCart';
import { primaryImage } from '@/lib/productImage';

/**
 * One row of the cart, used in both the drawer and the full cart page.
 *
 * @param {object} props
 * @param {{id: string, product: object, qty: number, size: string|null, color: string|null}} props.line
 * @param {'compact'|'full'} [props.layout]
 */
export function CartLineItem({ line, layout = 'compact' }) {
  const { setQty, removeItem } = useCart();
  const { product } = line;
  const isFull = layout === 'full';
  const variantLabel = [line.size, line.color].filter(Boolean).join(' · ');

  return (
    <li className="flex gap-4 py-5">
      <Link to={productPath(product.slug)} tabIndex={-1} aria-hidden="true" className="shrink-0">
        <Image
          name={primaryImage(product)}
          alt=""
          sizes={isFull ? '7rem' : '5rem'}
          ratio="aspect-[4/5]"
          className={cn('rounded-field', isFull ? 'w-28' : 'w-20')}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={cn('font-medium', isFull ? 'text-base' : 'text-sm')}>
              <Link to={productPath(product.slug)} className="hover:underline">
                {product.title}
              </Link>
            </h3>
            {variantLabel && <p className="text-content-subtle mt-0.5 text-xs">{variantLabel}</p>}
          </div>

          <button
            type="button"
            onClick={() => removeItem(line.id)}
            aria-label={`Remove ${product.title} from cart`}
            className="rounded-field text-content-subtle hover:bg-danger-50 hover:text-danger-600 grid size-8 shrink-0 place-items-center transition-colors"
          >
            <FiTrash2 className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1.5">
          <QuantityStepper
            value={line.qty}
            onChange={(next) => setQty(line.id, next)}
            max={Math.max(1, product.stock)}
            size="sm"
            label={product.title}
          />

          <div className="text-right">
            <p className="font-semibold tabular-nums">{formatCurrency(lineTotal(line))}</p>
            {line.qty > 1 && (
              <p className="text-content-subtle text-xs tabular-nums">
                {formatCurrency(product.price)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
