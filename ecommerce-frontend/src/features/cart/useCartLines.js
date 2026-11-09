import { useCallback, useMemo } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { calculateTotals } from '@/lib/calculateTotals';
import { toPricedLines } from '@/lib/cartLine';
import { getProducts } from '@/services/productService';
import { useCart } from './useCart';

/**
 * Joins the stored cart to the catalog and derives the money breakdown.
 *
 * The cart itself holds no prices, so this is where ids become priced lines.
 * Every cart surface (drawer, cart page, checkout review) reads from here,
 * which is what keeps their totals identical.
 *
 * @param {{shippingMethodId?: string}} [options]
 * @returns {{lines: object[], totals: object, loading: boolean, error: Error|null}}
 */
export function useCartLines({ shippingMethodId = 'standard' } = {}) {
  const { items, promoCode } = useCart();
  const fetchProducts = useCallback(() => getProducts(), []);
  const { data, loading, error } = useAsync(fetchProducts);

  const lines = useMemo(() => toPricedLines(items, data ?? []), [items, data]);

  const totals = useMemo(
    () => calculateTotals({ lines, promoCode, shippingMethodId }),
    [lines, promoCode, shippingMethodId],
  );

  return { lines, totals, loading, error };
}
