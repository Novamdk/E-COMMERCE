import { useContext } from 'react';
import { WishlistContext } from './WishlistContext';

/**
 * @returns {{
 *   productIds: string[], count: number,
 *   isWishlisted: (productId: string) => boolean,
 *   toggle: (productId: string) => void,
 *   remove: (productId: string) => void,
 *   clear: () => void,
 * }}
 */
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside <WishlistProvider>. Check app/providers.jsx.');
  }
  return context;
}
