import type { ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './Button.module.css';

type ButtonLinkProps = {
  /** A route ("/dashboard") or an in-page anchor ("#journal"). */
  href: string;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
};

// A link that looks like a button. Use it for navigation; a real <button> is for actions.
export default function ButtonLink({ href, variant = 'primary', children }: ButtonLinkProps) {
  const className = `${styles.button} ${styles[variant]}`;
  // Routes go through the router (no page reload); anchors stay plain links
  return href.startsWith('/') ? (
    <Link className={className} to={href}>
      {children}
    </Link>
  ) : (
    <a className={className} href={href}>
      {children}
    </a>
  );
}
