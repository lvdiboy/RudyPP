import type { ReactNode } from 'react';
import { Outlet } from 'react-router';
import SiteFooter from '../components/SiteFooter.tsx';
import SiteHeader from '../components/SiteHeader.tsx';
import { useI18n } from '../i18n/useI18n.ts';
import styles from './PageFrame.module.css';

type PageFrameProps = {
  nav?: ReactNode;
  actions?: ReactNode;
};

/** The frame the layouts share: skip link, header, <main> with the route's page, footer. */
export default function PageFrame({ nav, actions }: PageFrameProps) {
  const { t } = useI18n();
  return (
    <div className={styles.frame}>
      <a className={styles.skipLink} href="#main">
        {t.common.skipToContent}
      </a>
      <SiteHeader nav={nav} actions={actions} />
      {/* tabIndex lets the skip link move keyboard focus here, not only scroll */}
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
