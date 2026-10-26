import type { ReactNode } from 'react';
import { Link } from 'react-router';
import LanguageToggle from './LanguageToggle.tsx';
import styles from './SiteHeader.module.css';

type SiteHeaderProps = {
  /** Navigation for the current area of the site. */
  nav?: ReactNode;
  /** Top-right corner, after the language switch: the login button or the user menu. */
  actions?: ReactNode;
};

// Layout only: the layouts decide what goes into the nav and the top-right corner.
// The language switch is always there, so every page that uses this header gets it.
export default function SiteHeader({ nav, actions }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.wordmark} to="/">
          RudyPP
        </Link>
        {nav && <div className={styles.nav}>{nav}</div>}
        <div className={styles.actions}>
          <LanguageToggle />
          {actions}
        </div>
      </div>
    </header>
  );
}
