/**
 * Languages the storefront is translated into. `id` is the BCP 47 tag that
 * goes on <html lang>; `label` is always written in the language itself so
 * a shopper can find theirs whatever the page is currently showing.
 *
 * Only the words change. Prices stay in US dollars and shipping rules stay
 * the same, so the picker offers languages rather than countries.
 */
export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
  { id: 'es', label: 'Español' },
  { id: 'it', label: 'Italiano' },
];

export const DEFAULT_LANGUAGE = 'en';

const SUPPORTED = new Set(LANGUAGES.map((language) => language.id));

/** @param {unknown} id @returns {boolean} */
export const isSupportedLanguage = (id) => typeof id === 'string' && SUPPORTED.has(id);

/**
 * First supported language in the browser's preference list, else English.
 * @returns {string}
 */
export function detectLanguage() {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const base = String(tag ?? '')
      .toLowerCase()
      .split('-')[0];
    if (SUPPORTED.has(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}
