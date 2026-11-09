import { MOCK_LATENCY_MS } from '@/lib/constants';
import { readStorage, writeStorage } from '@/lib/storage';
import { ServiceError } from './productService';

/**
 * ============================ NOT REAL AUTH ============================
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
export async function signUp({ name, email, password }) {
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
export async function signIn({ email, password }) {
  const normalised = normaliseEmail(email);
  const account = readAccounts().find((candidate) => candidate.email === normalised);

  if (!account || account.password !== password) {
    throw new ServiceError('That email and password combination is not recognised.', 401);
  }

  return request({ id: account.id, name: account.name, email: account.email });
}
