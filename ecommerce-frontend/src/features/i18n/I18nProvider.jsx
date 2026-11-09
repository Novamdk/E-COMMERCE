import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/lib/constants';
import { I18nContext } from './I18nContext';
import { DEFAULT_LANGUAGE, detectLanguage, isSupportedLanguage } from './languages';
import { createTranslator } from './translate';

/**
 * Holds the shopper's language. The first visit follows the browser's
 * language when we support it; after that the picker's choice is remembered.
 */
export function I18nProvider({ children }) {
  const [stored, setStored] = useLocalStorage(STORAGE_KEYS.LANGUAGE, null);
  const language = isSupportedLanguage(stored) ? stored : detectLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(
    (next) => setStored(isSupportedLanguage(next) ? next : DEFAULT_LANGUAGE),
    [setStored],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t: createTranslator(language) }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
