import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Image } from '@/components/ui/Image';
import { orderPath, productPath } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/**
 * One row in the order history.
 * @param {{ order: object }} props
 */
export function OrderCard({ order }) {
  const itemCount = order.lines.reduce((n, line) => n + line.qty, 0);

  return (
    <article className="rounded-card border-border bg-surface-raised border">
      <header className="border-border flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div>
            <p className="text-content-subtle text-xs">Order</p>
            <p className="font-medium tabular-nums">{order.id}</p>
          </div>
          <div>
            <p className="text-content-subtle text-xs">Placed</p>
            <p className="text-sm">{DATE_FORMAT.format(new Date(order.placedAt))}</p>
          </div>
          <div>
            <p className="text-content-subtle text-xs">Total</p>
            <p className="text-sm font-medium tabular-nums">{formatCurrency(order.totals.total)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success">{order.status}</Badge>
          <Link
            to={orderPath(order.id)}
            className="text-brand-700 hover:text-brand-800 text-sm transition-colors"
          >
            View details
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        {order.lines.slice(0, 5).map((line) => (
          <Link
            key={`${line.productId}-${line.size ?? ''}-${line.color ?? ''}-${line.isGift ? 'gift' : ''}`}
            to={productPath(line.slug)}
            aria-label={line.title}
            className="shrink-0"
          >
            <Image
              name={line.image}
              alt=""
              sizes="3.5rem"
              ratio="aspect-square"
              className="rounded-field w-14"
            />
          </Link>
        ))}
        <p className="text-content-muted text-sm">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
          {order.lines.length > 5 && ` · ${order.lines.length - 5} more`}
        </p>
      </div>
    </article>
  );
}
