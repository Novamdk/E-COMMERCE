import { useCallback, useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import { useAsync } from '@/hooks/useAsync';
import { PAGE_SIZE, ROUTES } from '@/lib/constants';
import { getCategories } from '@/services/productService';
import {
  ActiveFilterChips,
  Filters,
  ProductGrid,
  SearchField,
  SortSelect,
  useProductFilters,
  useProducts,
} from '@/features/catalog';

const FILTER_DRAWER_TITLE_ID = 'filter-drawer-title';

export default function ShopPage() {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const { filters, setFilters, setPage, clearFilters, activeCount } = useProductFilters();
  const { items, page, pageCount, total, loading, error, refetch } = useProducts();

  const fetchCategories = useCallback(() => getCategories(), []);
  const { data: categories } = useAsync(fetchCategories);

  const activeCategory = (categories ?? []).find((c) => c.slug === filters.category);

  const filterPanel = (
    <Filters
      filters={filters}
      categories={categories ?? []}
      onFiltersChange={setFilters}
      onClear={clearFilters}
      activeCount={activeCount}
    />
  );

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

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-28">{filterPanel}</div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <SearchField value={filters.search} onFiltersChange={setFilters} />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="lg:hidden"
                >
                  <FiFilter aria-hidden="true" className="size-4" />
                  Filters{activeCount > 0 && ` (${activeCount})`}
                </Button>
                <SortSelect value={filters.sort} onFiltersChange={setFilters} />
              </div>
            </div>

            <ActiveFilterChips
              filters={filters}
              categories={categories ?? []}
              onFiltersChange={setFilters}
            />

            <p aria-live="polite" className="text-content-muted text-sm">
              {loading
                ? 'Loading products…'
                : `${total} ${total === 1 ? 'product' : 'products'}${
                    pageCount > 1 ? ` · page ${page} of ${pageCount}` : ''
                  }`}
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <ErrorPanel title="Products could not load" error={error} onRetry={refetch} />
            )}

            {!error && !loading && items.length === 0 && (
              <EmptyState
                icon={FiSearch}
                title="No products match those filters"
                body="Try widening the price range, lowering the rating threshold, or clearing the search term."
                action={
                  activeCount > 0 && (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear all filters
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
                columns={3}
                hasPriorityImages
              />
            )}

            {!error && !loading && pageCount > 1 && (
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
                className="mt-14"
              />
            )}
          </div>
        </div>
      </div>

      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filters"
        titleId={FILTER_DRAWER_TITLE_ID}
        side="left"
        footer={
          <Button isFullWidth onClick={() => setIsFilterDrawerOpen(false)}>
            Show {total} {total === 1 ? 'product' : 'products'}
          </Button>
        }
      >
        <div className="p-5">{filterPanel}</div>
      </Drawer>
    </PageShell>
  );
}
