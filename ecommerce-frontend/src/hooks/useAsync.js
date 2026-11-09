import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The single entry point for async data in the app. Every consumer gets
 * data/loading/error and is expected to render all three, which is what keeps
 * silent failures out of the UI.
 *
 * @template T
 * @param {() => Promise<T>} asyncFn must be stable (wrap in useCallback)
 * @param {{ immediate?: boolean }} [options]
 * @returns {{data: T|null, loading: boolean, error: Error|null, refetch: () => void}}
 */
export function useAsync(asyncFn, options = {}) {
  const { immediate = true } = options;

  // Initial state already carries the right loading flag, so the mount fetch
  // never has to flip it synchronously.
  const [state, setState] = useState({ data: null, loading: immediate, error: null });

  // Guards against applying a response that a newer call has superseded, or
  // that lands after unmount.
  const runIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Runs the async function and applies the outcome. State is only ever set
   * from the promise callbacks, so this is safe to call from an effect body.
   * @returns {Promise<void>}
   */
  const resolve = useCallback(() => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    const isCurrent = () => mountedRef.current && runIdRef.current === runId;

    return asyncFn().then(
      (data) => {
        if (isCurrent()) setState({ data, loading: false, error: null });
      },
      (error) => {
        if (isCurrent()) setState({ data: null, loading: false, error });
      },
    );
  }, [asyncFn]);

  useEffect(() => {
    if (immediate) resolve();
  }, [immediate, resolve]);

  /** Re-runs the request, showing the loading state while it is in flight. */
  const refetch = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    resolve();
  }, [resolve]);

  return { ...state, refetch };
}
