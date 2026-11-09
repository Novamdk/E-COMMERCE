import { useCallback, useMemo } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { PAGE_SIZE } from '@/lib/constants';
import { filterProducts, paginate, sortProducts } from '@/lib/filterProducts';
import { getProducts } from '@/services/productService';
import { useProductFilters } from './useProductFilters';

/**
 * Fetches the catalog once, then derives the visible page from the URL filters.
 *
 * @returns {{items: object[], page: number, pageCount: number, total: number,
 *            catalogSize: number, loading: boolean, error: Error|null, refetch: () => void}}
 */
export function useProducts() {
  const fetchProducts = useCallback(() => getProducts(), []);
  const { data, loading, error, refetch } = useAsync(fetchProducts);
  const { filters } = useProductFilters();

  // Memoised deliberately: this filters, then copies and sorts the whole
  // catalog. Without it the work repeats on every unrelated re-render of the
  // listing page (search input keystrokes, drawer open/close).
  const result = useMemo(() => {
    if (!data) return { items: [], page: 1, pageCount: 1, total: 0 };
    const matched = filterProducts(data, filters);
    const ordered = sortProducts(matched, filters.sort);
    return paginate(ordered, filters.page, PAGE_SIZE);
  }, [data, filters]);

  return {
    ...result,
    catalogSize: data?.length ?? 0,
    loading,
    error,
    refetch,
  };
}
