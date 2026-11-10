import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import { readStorage, writeStorage } from '@/lib/storage';
import { resolvePromo } from '@/lib/calculateTotals';
import { cartFromUrl, trackAddedToCart } from '@/lib/klaviyo';
import { CartContext } from './CartContext';
import { cartReducer, initialCartState } from './cartReducer';

/**
 * Owns cart contents plus the open/closed state of the cart drawer, so any
 * surface that adds an item can also reveal the drawer without prop drilling.
 */
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Latest state for callbacks that must stay stable (addItem reads it to
  // report the whole cart to Klaviyo).
  const stateRef = useRef(state);

  // Rehydrate once on mount, then mirror every change back. A cart link from
  // an abandonment email (?items=...) wins over what this browser had, so the
  // shopper sees the bag they left even on another device.
  useEffect(() => {
    const stored = readStorage(STORAGE_KEYS.CART, null);
    const fromLink = cartFromUrl(window.location.search);
    if (fromLink) {
      dispatch({
        type: 'HYDRATE',
        payload: { items: fromLink, promoCode: stored?.promoCode ?? null },
      });
      const url = new URL(window.location.href);
      url.searchParams.delete('items');
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    } else if (stored) {
      dispatch({ type: 'HYDRATE', payload: stored });
    }
  }, []);

  useEffect(() => {
    stateRef.current = state;
    writeStorage(STORAGE_KEYS.CART, state);
  }, [state]);

  const addItem = useCallback((product, { size = null, color = null, qty = 1 } = {}) => {
    const action = { type: 'ADD_ITEM', payload: { productId: product.id, size, color, qty } };
    dispatch(action);
    setIsDrawerOpen(true);
    trackAddedToCart(action.payload, cartReducer(stateRef.current, action).items);
  }, []);

  const setQty = useCallback((lineId, qty) => {
    dispatch({ type: 'SET_QTY', payload: { lineId, qty } });
  }, []);

  const removeItem = useCallback((lineId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { lineId } });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  /**
   * @param {string} code
   * @returns {{ok: boolean, message: string}} result for inline feedback
   */
  const applyPromo = useCallback((code) => {
    const promo = resolvePromo(code);
    if (!promo) return { ok: false, message: 'That code is not recognised.' };
    dispatch({ type: 'APPLY_PROMO', payload: { code: promo.code } });
    return { ok: true, message: `${promo.label} applied.` };
  }, []);

  const removePromo = useCallback(() => dispatch({ type: 'REMOVE_PROMO' }), []);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  // itemCount is derived here rather than stored, and memoised because the
  // header badge re-reads it on every render of every page.
  const itemCount = useMemo(() => state.items.reduce((n, item) => n + item.qty, 0), [state.items]);

  // Memoised so consumers do not re-render when an unrelated parent re-renders.
  const value = useMemo(
    () => ({
      items: state.items,
      promoCode: state.promoCode,
      itemCount,
      isDrawerOpen,
      addItem,
      setQty,
      removeItem,
      clearCart,
      applyPromo,
      removePromo,
      openDrawer,
      closeDrawer,
    }),
    [
      state.items,
      state.promoCode,
      itemCount,
      isDrawerOpen,
      addItem,
      setQty,
      removeItem,
      clearCart,
      applyPromo,
      removePromo,
      openDrawer,
      closeDrawer,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
