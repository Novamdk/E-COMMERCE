import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_SORT, PRICE_BOUNDS, QUERY_KEYS } from '@/lib/constants';

/**
 * The URL query string is the single source of truth for catalog filters.
 * Nothing here is mirrored into React state, which is what makes results
 * shareable, the back button correct, and a refresh lossless.
 */

/** @param {URLSearchParams} params @param {string} key @returns {number|null} */
function readInt(params, key) {
  const raw = params.get(key);
  if (raw == null || raw === '') return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
}

/**
 * @param {URLSearchParams} params
 * @returns {{search:string, category:string|null, minPrice:number|null,
 *            maxPrice:number|null, rating:number|null, sort:string, page:number}}
 */
function parseFilters(params) {
  const min = readInt(params, QUERY_KEYS.MIN_PRICE);
  const max = readInt(params, QUERY_KEYS.MAX_PRICE);

  return {
    search: params.get(QUERY_KEYS.SEARCH) ?? '',
    category: params.get(QUERY_KEYS.CATEGORY) || null,
    minPrice: min != null ? Math.max(PRICE_BOUNDS.min, min) : null,
    maxPrice: max != null ? Math.min(PRICE_BOUNDS.max, max) : null,
    rating: readInt(params, QUERY_KEYS.RATING),
    sort: params.get(QUERY_KEYS.SORT) ?? DEFAULT_SORT,
    page: Math.max(1, readInt(params, QUERY_KEYS.PAGE) ?? 1),
  };
}

/** Keys that invalidate the current page when they change. */
const PAGE_RESETTING = new Set([
  QUERY_KEYS.SEARCH,
  QUERY_KEYS.CATEGORY,
  QUERY_KEYS.MIN_PRICE,
  QUERY_KEYS.MAX_PRICE,
  QUERY_KEYS.RATING,
  QUERY_KEYS.SORT,
]);

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  /**
   * Writes a patch of filter values into the URL. Empty values are deleted
   * rather than written as blanks, so URLs stay clean and shareable.
   * @param {Record<string, string|number|null|undefined>} patch
   * @param {{resetPage?: boolean}} [options]
   */
  const setFilters = useCallback(
    (patch, options = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          let shouldResetPage = options.resetPage ?? false;

          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === undefined || value === '') next.delete(key);
            else next.set(key, String(value));
            if (PAGE_RESETTING.has(key)) shouldResetPage = true;
          }

          if (shouldResetPage) next.delete(QUERY_KEYS.PAGE);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (page) => setFilters({ [QUERY_KEYS.PAGE]: page > 1 ? page : null }, { resetPage: false }),
    [setFilters],
  );

  const clearFilters = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams]);

  const activeCount = useMemo(() => {
    const { category, minPrice, maxPrice, rating, search } = filters;
    return [category, minPrice, maxPrice, rating, search || null].filter((v) => v != null).length;
  }, [filters]);

  return { filters, setFilters, setPage, clearFilters, activeCount };
}
