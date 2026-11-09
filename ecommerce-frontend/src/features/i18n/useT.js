import { useContext } from 'react';
import { I18nContext } from './I18nContext';

/**
 * The current language and its `t()` function.
 * @returns {import('./I18nContext').I18nValue}
 */
export function useT() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useT must be used inside <I18nProvider>');
  return context;
}
