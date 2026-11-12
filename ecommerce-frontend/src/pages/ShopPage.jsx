import { useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PAGE_SIZE, ROUTES } from '@/lib/constants';
import { getCategories } from '@/services/productService';
import { ProductGrid, SortSelect, useProductFilters, useProducts } from '@/features/catalog';
import { useT } from '@/features/i18n';

/**
 * The full catalog across the whole width, four to a row, with no filter
 * column: just the count and a sort menu. Category and search links from the
 * menu and header still narrow the list through the URL.
 */
export default function ShopPage() {
  const { filters, setFilters, setPage, clearFilters, activeCount } = useProductFilters();
  const { items, page, pageCount, total, loading, error, refetch } = useProducts();

  const { t, language } = useT();
  usePageMeta({ title: t('seo.shopTitle'), description: t('seo.shop'), path: '/shop' });
  const fetchCategories = useCallback(() => getCategories(language), [language]);
  const { data: categories } = useAsync(fetchCategories);

  const activeCategory = (categories ?? []).find((c) => c.slug === filters.category);

  return (
    <PageShell>
      <PageHeader
        title={activeCategory?.name ?? 'All products'}
        description={
          activeCategory?.description ??
          'Natural hair and body care, formulated without harsh chemicals.'
        }
        breadcrumbs={[
          { label: 'Home', to: ROUTES.HOME },
          { label: activeCategory?.name ?? 'Shop' },
        ]}
      />

      <div className="mt-8 flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-content-muted text-sm">
          {loading
            ? 'Loading products…'
            : `${total} ${total === 1 ? 'product' : 'products'}${
                pageCount > 1 ? ` · page ${page} of ${pageCount}` : ''
              }`}
        </p>
        <SortSelect value={filters.sort} onFiltersChange={setFilters} />
      </div>

      <div className="mt-6">
        {error && <ErrorPanel title="Products could not load" error={error} onRetry={refetch} />}

        {!error && !loading && items.length === 0 && (
          <EmptyState
            icon={FiSearch}
            title="No products match those filters"
            body="Try a different search, or see every product."
            action={
              activeCount > 0 && (
                <Button variant="secondary" onClick={clearFilters}>
                  Show all products
                </Button>
              )
            }
          />
        )}

        {!error && (loading || items.length > 0) && (
          <ProductGrid
            products={items}
            isLoading={loading}
            skeletonCount={PAGE_SIZE}
            columns={4}
            hasPriorityImages
          />
        )}

        {!error && !loading && pageCount > 1 && (
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} className="mt-14" />
        )}
      </div>
    </PageShell>
  );
}
