import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true after. Use it for anything
 * that depends on the browser (its language, stored settings), so the first
 * render matches the server HTML and the browser value follows straight after.
 *
 * @returns {boolean}
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
