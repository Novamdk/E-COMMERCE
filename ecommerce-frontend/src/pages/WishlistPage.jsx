import { useCallback, useMemo } from 'react';
import { FiHeart } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import { useAsync } from '@/hooks/useAsync';
import { ROUTES } from '@/lib/constants';
import { getProducts } from '@/services/productService';
import { ProductGrid } from '@/features/catalog';
import { useWishlist } from '@/features/wishlist';

/**
 * Composes the wishlist feature with the catalog feature. Pages are the layer
 * where features meet — neither one imports the other.
 */
export default function WishlistPage() {
  const { productIds, count, clear } = useWishlist();
  const fetchProducts = useCallback(() => getProducts(), []);
  const { data, loading, error, refetch } = useAsync(fetchProducts);

  // Preserve the order items were saved in rather than catalog order.
  const saved = useMemo(() => {
    if (!data) return [];
    const byId = new Map(data.map((product) => [product.id, product]));
    return productIds.map((id) => byId.get(id)).filter(Boolean);
  }, [data, productIds]);

  const isEmpty = count === 0 || (!loading && !error && saved.length === 0);

  return (
    <PageShell>
      <PageHeader
        title="Saved items"
        description={
          isEmpty
            ? undefined
            : `${saved.length} ${saved.length === 1 ? 'product' : 'products'} saved.`
        }
        breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: 'Wishlist' }]}
        actions={
          !isEmpty && (
            <Button variant="ghost" onClick={clear}>
              Clear wishlist
            </Button>
          )
        }
      />

      <div className="mt-10">
        {error && <ErrorPanel title="Saved items could not load" error={error} onRetry={refetch} />}

        {isEmpty && !error && (
          <EmptyState
            icon={FiHeart}
            title="Nothing saved yet"
            body="Tap the heart on any product to keep it here. Your list survives a refresh."
            action={<Button to={ROUTES.SHOP}>Find something you like</Button>}
          />
        )}

        {!error && !isEmpty && (
          <ProductGrid
            products={saved}
            isLoading={loading}
            skeletonCount={Math.min(count, 6)}
            columns={4}
            hasPriorityImages
          />
        )}
      </div>
    </PageShell>
  );
}
