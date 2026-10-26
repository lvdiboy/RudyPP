import { Languages } from 'lucide-react';
import type { Language } from '../i18n/LanguageContext.ts';
import { useI18n } from '../i18n/useI18n.ts';
import styles from './LanguageToggle.module.css';

/*
 * Each button names the language it switches TO, in that language, so a reader of either language
 * can find it. This is the one place where text is intentionally not in the current language.
 */
const TARGETS: Record<Language, { next: Language; text: string; label: string; lang: string }> = {
  zh: { next: 'en', text: 'EN', label: 'Switch to English', lang: 'en' },
  en: { next: 'zh', text: '中文', label: '切换到中文', lang: 'zh-CN' },
};

/** The language switch in every page header's top-right corner. */
export default function LanguageToggle() {
  const { language, setLanguage } = useI18n();
  const target = TARGETS[language];
  return (
    <button
      type="button"
      className={styles.toggle}
      lang={target.lang}
      aria-label={target.label}
      title={target.label}
      onClick={() => setLanguage(target.next)}
    >
      <Languages className={styles.icon} size={16} aria-hidden />
      <span>{target.text}</span>
    </button>
  );
}
