import ButtonLink from '../../components/ui/Button/ButtonLink.tsx';
import { useI18n } from '../../i18n/useI18n.ts';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <title>{t.notFound.title}</title>
      <p className={styles.code} aria-hidden>
        404
      </p>
      <h1 id="not-found-title" className={styles.title}>
        {t.notFound.heading}
      </h1>
      <p className={styles.text}>{t.notFound.text}</p>
      <ButtonLink href="/">{t.notFound.cta}</ButtonLink>
    </section>
  );
}
