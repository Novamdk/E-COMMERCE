import { FiShoppingBag } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCart } from '../useCart';
import { useCartLines } from '../useCartLines';
import { CartLineItem } from './CartLineItem';

const TITLE_ID = 'cart-drawer-title';

/** Placeholder rows while the catalog resolves behind stored cart ids. */
function LineSkeletons({ count }) {
  return (
    <div className="divide-border divide-y px-5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-4 py-5">
          <Skeleton className="aspect-[4/5] w-20" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="mt-4 h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Slide-over cart, mounted once in the layout and opened from anywhere via
 * cart context.
 */
export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, itemCount } = useCart();
  const { lines, totals, loading, error } = useCartLines();

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      title={itemCount > 0 ? `Your cart (${itemCount})` : 'Your cart'}
      titleId={TITLE_ID}
      footer={
        lines.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-content-muted text-sm">Subtotal</span>
              <span className="font-display text-xl tabular-nums">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            <p className="text-content-subtle text-xs">
              Shipping and tax are calculated at checkout.
            </p>
            <div className="grid gap-2">
              <Button to={ROUTES.CHECKOUT} size="lg" isFullWidth onClick={closeDrawer}>
                Checkout
              </Button>
              <Button to={ROUTES.CART} variant="ghost" isFullWidth onClick={closeDrawer}>
                View full cart
              </Button>
            </div>
          </div>
        )
      }
    >
      {loading && itemCount > 0 && <LineSkeletons count={Math.min(itemCount, 3)} />}

      {error && !loading && (
        <div className="p-5">
          <p
            role="alert"
            className="rounded-field bg-danger-50 text-danger-600 px-3.5 py-3 text-sm"
          >
            We could not load your cart items. Please try again.
          </p>
        </div>
      )}

      {!loading && !error && lines.length === 0 && (
        <div className="p-5">
          <EmptyState
            icon={FiShoppingBag}
            title="Your cart is empty"
            body="Browse the collection and add something you love — it will show up here."
            action={
              <Button to={ROUTES.SHOP} onClick={closeDrawer}>
                Shop all products
              </Button>
            }
            className="border-0 bg-transparent px-0 py-4"
          />
        </div>
      )}

      {!loading && !error && lines.length > 0 && (
        <ul className="divide-border divide-y px-5">
          {lines.map((line) => (
            <CartLineItem key={line.id} line={line} />
          ))}
        </ul>
      )}
    </Drawer>
  );
}
