import type { ReactNode } from 'react';
import styles from './WorkspacePage.module.css';
import theme from './theme.module.css';

type WorkspacePageProps = {
  /** Document title, from the dictionaries. */
  documentTitle: string;
  heading: ReactNode;
  intro?: ReactNode;
  /** Main actions next to the heading, e.g. "New note". */
  actions?: ReactNode;
  children: ReactNode;
};

/** Page frame for workspace tools: one h1, an optional intro and actions, then the content. */
export default function WorkspacePage({
  documentTitle,
  heading,
  intro,
  actions,
  children,
}: WorkspacePageProps) {
  return (
    <div className={`${theme.theme} ${styles.page}`}>
      <title>{documentTitle}</title>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>{heading}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}
