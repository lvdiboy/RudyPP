import { createContext } from 'react';
import type { Messages } from './locales/en.ts';

export type Language = 'zh' | 'en';

export type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  /** The messages for the current language. */
  t: Messages;
  /** BCP 47 tag for <html lang> and Intl formatters: "zh-CN" or "en". */
  locale: string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);
