import storesData from '@/data/stores.json';
import { MOCK_LATENCY_MS } from '@/lib/constants';

/**
 * The only place the stockist list is read. Each store carries its address,
 * phone, region and map position. Entries flagged `isSample` are layout
 * placeholders until the real list of retail partners arrives.
 *
 * To move to a real API, replace the body of `request` with fetch() and keep
 * the signature.
 */

/**
 * @template T
 * @param {T} payload
 * @returns {Promise<T>}
 */
function request(payload) {
  const { min, max } = MOCK_LATENCY_MS;
  const delay = min + Math.random() * (max - min);
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(payload)), delay);
  });
}

/**
 * @typedef {object} Store
 * @property {string} id
 * @property {string} name
 * @property {'market'|'pharmacy'|'herbs'|'beauty'|'shop'} type
 * @property {'oc'|'sd'|'la'} region
 * @property {string} address street line
 * @property {string} city
 * @property {string} state
 * @property {string} zip
 * @property {string} [phone]
 * @property {string|null} [website]
 * @property {number} lat
 * @property {number} lng
 * @property {boolean} [isSample]
 */

/** @returns {Promise<Store[]>} every stockist */
export function getStores() {
  return request(storesData);
}
