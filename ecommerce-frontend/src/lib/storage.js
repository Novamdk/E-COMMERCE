/**
 * localStorage access that never throws. Reads return the fallback in private
 * windows, with site data blocked, or when stored JSON is corrupt — so a bad
 * cache can never white-screen the app.
 */

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean} whether the write landed
 */
export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** @param {string} key */
export function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing useful to do if storage is unavailable */
  }
}
