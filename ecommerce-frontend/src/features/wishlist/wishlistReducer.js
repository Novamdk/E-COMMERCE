/**
 * @typedef {{productIds: string[]}} WishlistState
 */

/** @type {WishlistState} */
export const initialWishlistState = { productIds: [] };

/**
 * @param {WishlistState} state
 * @param {{type: string, payload?: any}} action
 * @returns {WishlistState}
 */
export function wishlistReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        productIds: Array.isArray(action.payload?.productIds)
          ? [...new Set(action.payload.productIds.map(String))]
          : [],
      };

    case 'TOGGLE': {
      const id = String(action.payload.productId);
      const has = state.productIds.includes(id);
      return {
        productIds: has
          ? state.productIds.filter((existing) => existing !== id)
          : [...state.productIds, id],
      };
    }

    case 'REMOVE':
      return {
        productIds: state.productIds.filter((id) => id !== String(action.payload.productId)),
      };

    case 'CLEAR':
      return initialWishlistState;

    default:
      throw new Error(`wishlistReducer: unhandled action "${action.type}"`);
  }
}
