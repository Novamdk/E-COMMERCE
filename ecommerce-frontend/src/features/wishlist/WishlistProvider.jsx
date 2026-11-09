import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import { readStorage, writeStorage } from '@/lib/storage';
import { WishlistContext } from './WishlistContext';
import { initialWishlistState, wishlistReducer } from './wishlistReducer';

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialWishlistState);

  useEffect(() => {
    const stored = readStorage(STORAGE_KEYS.WISHLIST, null);
    if (stored) dispatch({ type: 'HYDRATE', payload: stored });
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.WISHLIST, state);
  }, [state]);

  const toggle = useCallback((productId) => {
    dispatch({ type: 'TOGGLE', payload: { productId } });
  }, []);

  const remove = useCallback((productId) => {
    dispatch({ type: 'REMOVE', payload: { productId } });
  }, []);

  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  // A Set keeps the per-card isWishlisted check O(1) across a full grid.
  const idSet = useMemo(() => new Set(state.productIds), [state.productIds]);
  const isWishlisted = useCallback((productId) => idSet.has(String(productId)), [idSet]);

  const value = useMemo(
    () => ({
      productIds: state.productIds,
      count: state.productIds.length,
      isWishlisted,
      toggle,
      remove,
      clear,
    }),
    [state.productIds, isWishlisted, toggle, remove, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
