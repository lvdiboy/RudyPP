import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { LanguageContext, type Language, type LanguageContextValue } from './LanguageContext.ts';
import { en, type Messages } from './locales/en.ts';
import { zh } from './locales/zh.ts';

const STORAGE_KEY = 'rudypp.language';
const MESSAGES: Record<Language, Messages> = { zh, en };
const LOCALES: Record<Language, string> = { zh: 'zh-CN', en: 'en' };

/** The visitor's last choice, else Chinese for Chinese-language browsers, else English. */
function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {
    // Storage can be unavailable; fall back to the browser language
  }
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

/** Holds the current language. Switching it re-renders every component that reads `t`. */
export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  // Keep <html lang> (screen readers, fonts, hyphenation) and the saved choice in sync
  useEffect(() => {
    document.documentElement.lang = LOCALES[language];
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Not saved; the choice still applies until the page reloads
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: MESSAGES[language], locale: LOCALES[language] }),
    [language],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}
