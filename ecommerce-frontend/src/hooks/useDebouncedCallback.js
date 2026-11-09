import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable function that defers the call until it has stopped being
 * invoked for `delayMs`.
 *
 * Preferred over debouncing a value through state: the caller fires it
 * straight from an event handler, so there is no effect syncing one piece of
 * state to another and no extra render per keystroke.
 *
 * @template {(...args: any[]) => void} T
 * @param {T} callback may change between renders; the latest is always used
 * @param {number} delayMs
 * @returns {(...args: Parameters<T>) => void}
 */
export function useDebouncedCallback(callback, delayMs) {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);

  // Keep the latest callback without re-creating the debounced wrapper.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Drop a pending call if the component goes away first.
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return useCallback(
    (...args) => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  );
}
