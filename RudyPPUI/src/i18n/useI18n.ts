import { useContext } from 'react';
import { LanguageContext, type LanguageContextValue } from './LanguageContext.ts';

/** `const { t, locale } = useI18n()`: the current language's messages and locale tag. */
export function useI18n(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useI18n must be used inside <LanguageProvider>');
  return value;
}
