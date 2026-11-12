import { FiShoppingBag } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Skeleton } from '@/components/ui/Skeleton';
import { Image } from '@/components/ui/Image';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import { isPayPalEnabled } from '@/lib/backend';
import { ROUTES } from '@/lib/constants';
import { primaryImage } from '@/lib/productImage';
import { CartLineItem, CartSummary, PromoForm, useCart, useCartLines } from '@/features/cart';

export default function CartPage() {
  const { itemCount } = useCart();
  const { lines, gifts, totals, loading, error } = useCartLines();

  const isEmpty = !loading && !error && lines.length === 0;

  return (
    <PageShell>
      <PageHeader
        title="Your cart"
        description={
          isEmpty
            ? undefined
            : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} ready to check out.`
        }
        breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: 'Cart' }]}
      />

      <div className="mt-10">
        {error && <ErrorPanel title="Your cart could not load" error={error} />}

        {isEmpty && (
          <EmptyState
            icon={FiShoppingBag}
            title="Your cart is empty"
            body="Once you add something it will appear here, and stay here even if you close the tab."
            action={<Button to={ROUTES.SHOP}>Shop all products</Button>}
          />
        )}

        {(loading || lines.length > 0) && !error && (
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
            <div className="min-w-0">
              {loading ? (
                <div className="divide-border divide-y">
                  {Array.from({ length: Math.max(1, Math.min(itemCount, 3)) }, (_, i) => (
                    <div key={i} className="flex gap-4 py-5">
                      <Skeleton className="aspect-[4/5] w-28" />
                      <div className="flex-1 space-y-2.5">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-3.5 w-1/4" />
                        <Skeleton className="mt-6 h-9 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="divide-border border-border divide-y border-y">
                  {lines.map((line) => (
                    <CartLineItem key={line.id} line={line} layout="full" />
                  ))}
                  {gifts.map((product) => (
                    <li key={`gift-${product.id}`} className="flex items-center gap-4 py-5">
                      <Image
                        name={primaryImage(product)}
                        alt=""
                        sizes="7rem"
                        ratio="aspect-[4/5]"
                        className="rounded-field w-28"
                      />
                      <div>
                        <p className="text-gold-700 text-xs font-semibold tracking-[0.14em] uppercase">
                          Free gift
                        </p>
                        <p className="mt-1 font-medium">{product.title}</p>
                        <p className="text-content-muted mt-1 text-sm">Free</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8">
                <Button to={ROUTES.SHOP} variant="ghost">
                  ← Continue shopping
                </Button>
              </div>
            </div>

            <aside aria-labelledby="summary-heading">
              <div className="rounded-panel border-border bg-surface-raised sticky top-28 space-y-6 border p-6">
                <h2 id="summary-heading" className="font-display text-xl">
                  Order summary
                </h2>

                <PromoForm promo={totals.promo} />
                <CartSummary totals={totals} />

                <Button to={ROUTES.CHECKOUT} size="lg" isFullWidth disabled={lines.length === 0}>
                  Proceed to checkout
                </Button>

                {!isPayPalEnabled && (
                  <p className="text-content-subtle text-center text-xs">
                    Demo storefront — no payment is taken.
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </PageShell>
  );
}
