import { getSupabase, isAuthBackendEnabled } from '@/lib/backend';
import { MOCK_LATENCY_MS } from '@/lib/constants';
import { readStorage, writeStorage } from '@/lib/storage';
import { ServiceError } from './productService';

/**
 * When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set, sign-in is real:
 * Supabase Auth holds the accounts and hashes the passwords (see the "real"
 * functions at the bottom). Without them, the demo below is used.
 *
 * ============================ DEMO AUTH ============================
 * There is no server, no password hashing and no token verification. Accounts
 * live in localStorage in plain text and anyone can read or edit them from
 * devtools. This exists purely so protected routes and an orders history have
 * something to hang off.
 *
 * Replacing it with real auth means rewriting this file to call an identity
 * provider and return a session; the rest of the app only consumes AuthContext.
 * =======================================================================
 */

const ACCOUNTS_KEY = 'skenvision.accounts.v1';

/** @param {string} email @returns {string} */
const normaliseEmail = (email) => String(email).trim().toLowerCase();

/** @template T @param {T} payload @returns {Promise<T>} */
function request(payload) {
  const { min, max } = MOCK_LATENCY_MS;
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(payload), min + Math.random() * (max - min));
  });
}

/** @returns {{id:string,name:string,email:string,password:string}[]} */
const readAccounts = () => readStorage(ACCOUNTS_KEY, []);

/**
 * @param {{name: string, email: string, password: string}} input
 * @returns {Promise<{id:string,name:string,email:string}>}
 * @throws {ServiceError} 409 when the email is already registered
 */
async function demoSignUp({ name, email, password }) {
  const accounts = readAccounts();
  const normalised = normaliseEmail(email);

  if (accounts.some((account) => account.email === normalised)) {
    throw new ServiceError('An account with that email already exists.', 409);
  }

  const account = {
    id: `u_${Date.now().toString(36)}`,
    name: String(name).trim(),
    email: normalised,
    password,
  };
  writeStorage(ACCOUNTS_KEY, [...accounts, account]);

  return request({ id: account.id, name: account.name, email: account.email });
}

/**
 * @param {{email: string, password: string}} input
 * @returns {Promise<{id:string,name:string,email:string}>}
 * @throws {ServiceError} 401 when the credentials do not match
 */
async function demoSignIn({ email, password }) {
  const normalised = normaliseEmail(email);
  const account = readAccounts().find((candidate) => candidate.email === normalised);

  if (!account || account.password !== password) {
    throw new ServiceError('That email and password combination is not recognised.', 401);
  }

  return request({ id: account.id, name: account.name, email: account.email });
}

/* ------------------------------ real auth ------------------------------ */

/** @param {import('@supabase/supabase-js').User} user */
const toUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.user_metadata?.full_name ?? user.email,
});

/** Supabase's messages, in the site's voice. */
function authError(error) {
  const message = error?.message ?? '';
  if (/invalid login credentials/i.test(message)) {
    return new ServiceError('That email and password combination is not recognised.', 401);
  }
  if (/already registered|already exists/i.test(message)) {
    return new ServiceError('An account with that email already exists.', 409);
  }
  if (/email not confirmed/i.test(message)) {
    return new ServiceError('Please confirm your email first. Check your inbox for our link.', 403);
  }
  return new ServiceError(
    message || 'Something went wrong. Please try again.',
    error?.status ?? 500,
  );
}

/**
 * @param {{name: string, email: string, password: string}} input
 * @returns {Promise<{id:string,name:string,email:string}>}
 * @throws {ServiceError} 202 when Supabase asks the shopper to confirm their email first
 */
export async function signUp(input) {
  if (!isAuthBackendEnabled) return demoSignUp(input);
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: String(input.email).trim().toLowerCase(),
    password: input.password,
    options: {
      data: { full_name: String(input.name).trim() },
      emailRedirectTo: `${window.location.origin}/sign-in`,
    },
  });
  if (error) throw authError(error);
  if (!data.session) {
    throw new ServiceError(
      'Almost there: we sent you an email. Click the link in it, then sign in.',
      202,
    );
  }
  return toUser(data.user);
}

/**
 * @param {{email: string, password: string}} input
 * @returns {Promise<{id:string,name:string,email:string}>}
 */
export async function signIn(input) {
  if (!isAuthBackendEnabled) return demoSignIn(input);
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(input.email).trim().toLowerCase(),
    password: input.password,
  });
  if (error) throw authError(error);
  return toUser(data.user);
}

/** Ends the Supabase session (the demo keeps nothing server side). */
export async function signOut() {
  const supabase = await getSupabase();
  if (supabase) await supabase.auth.signOut();
}

/**
 * The current session's user, or null. Only meaningful with the real backend.
 * @returns {Promise<{id:string,name:string,email:string}|null>}
 */
export async function getCurrentUser() {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ? toUser(data.session.user) : null;
}

/**
 * Calls back whenever Supabase signs the shopper in or out (another tab, an
 * expired session). Returns an unsubscribe function.
 * @param {(user: {id:string,name:string,email:string}|null) => void} callback
 */
export async function onAuthChange(callback) {
  const supabase = await getSupabase();
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toUser(session.user) : null);
  });
  return () => data.subscription.unsubscribe();
}
