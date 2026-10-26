import { useI18n } from '../i18n/useI18n.ts';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className={styles.footer}>
      <p className={styles.inner}>{t.common.footer}</p>
    </footer>
  );
}
