import { createClient } from '@supabase/supabase-js';
import { requireEnv } from './http.js';

let admin = null;

/**
 * Supabase client with the service role key: bypasses row level security, so
 * it only ever runs here on the server. SUPABASE_SERVICE_ROLE_KEY must never
 * be given a VITE_ prefix.
 */
export function db() {
  if (!admin) {
    admin = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

/**
 * The signed-in shopper behind a request's access token, or null for a guest
 * or an invalid token.
 * @param {string|null} accessToken
 * @returns {Promise<{id: string, email: string}|null>}
 */
export async function userFromToken(accessToken) {
  if (!accessToken) return null;
  const { data, error } = await db().auth.getUser(accessToken);
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email };
}

/** Throws on a Supabase error so route() turns it into a 500. */
export function check({ data, error }) {
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data;
}
