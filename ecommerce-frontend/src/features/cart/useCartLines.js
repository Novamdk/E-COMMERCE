import { useCallback, useMemo } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { calculateTotals } from '@/lib/calculateTotals';
import { GIFT_WITH_PURCHASE } from '@/lib/constants';
import { toPricedLines } from '@/lib/cartLine';
import { getProducts } from '@/services/productService';
import { useCart } from './useCart';
import { useT } from '@/features/i18n';

/**
 * Joins the stored cart to the catalog and derives the money breakdown.
 *
 * The cart itself holds no prices, so this is where ids become priced lines.
 * Every cart surface (drawer, cart page, checkout review) reads from here,
 * which is what keeps their totals identical.
 *
 * @param {{shippingMethodId?: string}} [options]
 * @returns {{lines: object[], gifts: object[], totals: object, loading: boolean, error: Error|null}}
 *   gifts: free gift-with-purchase products, once unlocked
 */
export function useCartLines({ shippingMethodId = 'standard' } = {}) {
  const { items, promoCode } = useCart();
  const { language } = useT();
  const fetchProducts = useCallback(() => getProducts(language), [language]);
  const { data, loading, error } = useAsync(fetchProducts);

  const lines = useMemo(() => toPricedLines(items, data ?? []), [items, data]);

  const totals = useMemo(
    () => calculateTotals({ lines, promoCode, shippingMethodId }),
    [lines, promoCode, shippingMethodId],
  );

  const gifts = useMemo(
    () =>
      totals.isGiftUnlocked
        ? (data ?? []).filter((product) => GIFT_WITH_PURCHASE.PRODUCT_IDS.includes(product.id))
        : [],
    [totals.isGiftUnlocked, data],
  );

  return { lines, gifts, totals, loading, error };
}
