import { createContext } from 'react';

/**
 * @typedef {object} I18nValue
 * @property {string} language current language id, e.g. "fr"
 * @property {(language: string) => void} setLanguage
 * @property {(key: string, values?: Record<string, string|number>) => string} t
 */

/** @type {import('react').Context<I18nValue|null>} */
export const I18nContext = createContext(null);
