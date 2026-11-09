import { en } from './messages/en';
import { es } from './messages/es';
import { fr } from './messages/fr';
import { it } from './messages/it';

/** Every dictionary mirrors the shape of `en`, which is the source of truth. */
export const MESSAGES = { en, fr, es, it };

/**
 * @param {object} dictionary
 * @param {string} key dotted path, e.g. "header.wishlist"
 * @returns {string|undefined}
 */
function lookup(dictionary, key) {
  let node = dictionary;
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/**
 * Builds the `t()` function for one language. A key missing from that
 * language falls back to English, then to the key itself, so a gap shows up
 * as readable English rather than a blank.
 *
 * Placeholders are written `{name}` and filled from `values`.
 *
 * @param {string} language
 * @returns {(key: string, values?: Record<string, string|number>) => string}
 */
export function createTranslator(language) {
  const dictionary = MESSAGES[language] ?? en;
  return (key, values) => {
    const template = lookup(dictionary, key) ?? lookup(en, key) ?? key;
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (match, name) =>
      name in values ? String(values[name]) : match,
    );
  };
}
