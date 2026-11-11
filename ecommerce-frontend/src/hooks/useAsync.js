import { use, useCallback, useEffect, useId, useRef, useState } from 'react';
import { IS_SERVER, serverRequest, takeHydrationData } from '@/lib/ssr';

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

  // On the server (build-time rendering) the request runs during render and
  // the page waits for it, so the HTML has the real content. In the browser,
  // the first render of a server-rendered page starts from that same data.
  const id = useId();
  const serverResult = IS_SERVER && immediate ? use(serverRequest(id, asyncFn)) : null;
  const [prefilled] = useState(() => (immediate ? takeHydrationData(id) : undefined));
  const skipFirstFetchRef = useRef(Boolean(prefilled));

  // Initial state already carries the right loading flag, so the mount fetch
  // never has to flip it synchronously.
  const [state, setState] = useState(() => {
    if (serverResult) {
      return serverResult.error
        ? { data: null, loading: false, error: serverResult.error }
        : { data: serverResult.data, loading: false, error: null };
    }
    if (prefilled) return { data: prefilled.data, loading: false, error: null };
    return { data: null, loading: immediate, error: null };
  });

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
    if (!immediate) return;
    // Already holding the server's data for this first render.
    if (skipFirstFetchRef.current) {
      skipFirstFetchRef.current = false;
      return;
    }
    resolve();
  }, [immediate, resolve]);

  /** Re-runs the request, showing the loading state while it is in flight. */
  const refetch = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    resolve();
  }, [resolve]);

  return { ...state, refetch };
}
