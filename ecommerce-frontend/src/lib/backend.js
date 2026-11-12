import { ServiceError } from '@/services/productService';

/**
 * Switches between the real backend (Supabase accounts, PayPal checkout,
 * orders in the database) and the original demo services, based on the
 * public settings baked into the build.
 *
 * Nothing changes for shoppers until these are set in Vercel, so this branch
 * can be merged before the accounts exist:
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY  real sign-in
 *   VITE_PAYPAL_CLIENT_ID (needs the two above)  real checkout and orders
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export const isAuthBackendEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const isPayPalEnabled = isAuthBackendEnabled && Boolean(PAYPAL_CLIENT_ID);

let clientPromise = null;

/**
 * The browser Supabase client, loaded on first use so its code is not in the
 * first page load. Uses the public anon key: every table has row level
 * security with no public access, so this client can only manage the
 * shopper's own sign-in. Orders are read through /api.
 */
export function getSupabase() {
  if (!isAuthBackendEnabled) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'skenvision.auth' },
      }),
    );
  }
  return clientPromise;
}

/** The signed-in shopper's access token, or null. */
export async function getAccessToken() {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Calls one of the site's /api functions with the shopper's token attached.
 * @param {string} path e.g. "/api/orders"
 * @param {{method?: string, body?: object}} [options]
 */
export async function apiFetch(path, { method = 'GET', body } = {}) {
  const token = await getAccessToken();
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ServiceError('We could not reach the store. Check your connection and try again.', 0);
  }
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ServiceError(
      json.error ?? 'Something went wrong. Please try again.',
      response.status,
    );
  }
  return json;
}
