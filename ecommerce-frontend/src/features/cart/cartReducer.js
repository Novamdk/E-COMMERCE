import { getLineId } from '@/lib/cartLine';

/**
 * Cart state is deliberately minimal: what the shopper chose, nothing more.
 * Prices, line totals and order totals are derived at render by
 * lib/calculateTotals, so a price change in the catalog can never leave a
 * stale number sitting in localStorage.
 *
 * @typedef {{productId: string, size: string|null, color: string|null, qty: number}} CartItem
 * @typedef {{items: CartItem[], promoCode: string|null}} CartState
 */

/** @type {CartState} */
export const initialCartState = { items: [], promoCode: null };

const MAX_QTY_PER_LINE = 99;

/** @param {CartItem} item @returns {CartItem} */
const normalise = (item) => ({
  productId: String(item.productId),
  size: item.size ?? null,
  color: item.color ?? null,
  qty: Math.max(1, Math.min(MAX_QTY_PER_LINE, Number(item.qty) || 1)),
});

/**
 * @param {CartState} state
 * @param {{type: string, payload?: any}} action
 * @returns {CartState}
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const items = Array.isArray(action.payload?.items) ? action.payload.items.map(normalise) : [];
      return { items, promoCode: action.payload?.promoCode ?? null };
    }

    case 'ADD_ITEM': {
      const incoming = normalise(action.payload);
      const id = getLineId(incoming);
      const existing = state.items.find((item) => getLineId(item) === id);

      if (!existing) return { ...state, items: [...state.items, incoming] };

      return {
        ...state,
        items: state.items.map((item) =>
          getLineId(item) === id
            ? { ...item, qty: Math.min(MAX_QTY_PER_LINE, item.qty + incoming.qty) }
            : item,
        ),
      };
    }

    case 'SET_QTY': {
      const { lineId, qty } = action.payload;
      if (qty <= 0) {
        return { ...state, items: state.items.filter((item) => getLineId(item) !== lineId) };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          getLineId(item) === lineId ? { ...item, qty: Math.min(MAX_QTY_PER_LINE, qty) } : item,
        ),
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => getLineId(item) !== action.payload.lineId),
      };

    case 'APPLY_PROMO':
      return { ...state, promoCode: action.payload.code };

    case 'REMOVE_PROMO':
      return { ...state, promoCode: null };

    case 'CLEAR':
      return initialCartState;

    default:
      throw new Error(`cartReducer: unhandled action "${action.type}"`);
  }
}
