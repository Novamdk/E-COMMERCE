import { useContext } from 'react';
import { CartContext } from './CartContext';

/**
 * @returns {{
 *   items: object[], promoCode: string|null, itemCount: number, isDrawerOpen: boolean,
 *   addItem: (product: object, options?: object) => void,
 *   setQty: (lineId: string, qty: number) => void,
 *   removeItem: (lineId: string) => void,
 *   clearCart: () => void,
 *   applyPromo: (code: string) => {ok: boolean, message: string},
 *   removePromo: () => void,
 *   openDrawer: () => void, closeDrawer: () => void,
 * }}
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside <CartProvider>. Check app/providers.jsx.');
  }
  return context;
}
