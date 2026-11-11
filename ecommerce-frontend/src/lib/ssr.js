/**
 * Build-time rendering and hydration.
 *
 * At build, scripts/prerender.mjs renders every public page to full HTML on
 * the server, so search engines and AI assistants read the real page. The
 * data each page fetched through useAsync is written into the page as
 * window.__SSR_DATA__, so the browser can take over the server HTML
 * (hydrate) without refetching or flashing a loading state.
 */

export const IS_SERVER = typeof window === 'undefined';

/* ---------------------------- in the browser ---------------------------- */

let hydrating = false;

/** True only during the first render of a server-rendered page. */
export const isHydrating = () => hydrating;

export function beginHydration() {
  hydrating = true;
}

/** Called once the first render has committed; later renders fetch normally. */
export function endHydration() {
  hydrating = false;
  if (!IS_SERVER) delete window.__SSR_DATA__;
}

/**
 * The server's result for one useAsync call, if this is the hydration render
 * and the server had it. Each entry is used once.
 *
 * @param {string} id the caller's useId(), which matches the server's
 * @returns {{data: unknown} | undefined}
 */
export function takeHydrationData(id) {
  if (!hydrating || IS_SERVER) return undefined;
  const store = window.__SSR_DATA__;
  if (!store || !Object.hasOwn(store, id)) return undefined;
  const data = store[id];
  delete store[id];
  return { data };
}

/* ------------------------------ on the server ----------------------------- */

/** @type {Map<string, {promise: Promise<{data?: unknown, error?: unknown}>, data?: unknown}> | null} */
let serverStore = null;

/** Starts collecting data for one page render. */
export function startServerData() {
  serverStore = new Map();
}

/** Ends the page render and returns what to embed in the HTML. */
export function collectServerData() {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [id, entry] of serverStore ?? []) {
    if (Object.hasOwn(entry, 'data')) out[id] = entry.data;
  }
  serverStore = null;
  return out;
}

/**
 * One promise per useAsync call during a server render, settled to a plain
 * result so a failed request renders the page's error state instead of
 * aborting the build.
 *
 * @param {string} id
 * @param {() => Promise<unknown>} asyncFn
 */
export function serverRequest(id, asyncFn) {
  if (!serverStore) throw new Error('serverRequest called outside a server render');
  let entry = serverStore.get(id);
  if (!entry) {
    entry = /** @type {any} */ ({});
    entry.promise = asyncFn().then(
      (data) => {
        entry.data = data;
        return { data };
      },
      (error) => ({ error }),
    );
    serverStore.set(id, entry);
  }
  return entry.promise;
}
