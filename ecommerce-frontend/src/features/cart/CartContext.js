import { createContext } from 'react';

/**
 * Lives in its own module so CartProvider.jsx exports a component and nothing
 * else — that is what keeps fast refresh working for the provider.
 * Components never read this directly; they use the useCart hook.
 */
export const CartContext = createContext(null);
