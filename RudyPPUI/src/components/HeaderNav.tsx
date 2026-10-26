import { NavLink } from 'react-router';
import styles from './HeaderNav.module.css';

export type HeaderNavItem = {
  label: string;
  /** A route ("/dashboard") or an in-page anchor ("#journal"). */
  href: string;
};

type HeaderNavProps = {
  /** Names the <nav> landmark for screen readers. */
  label: string;
  items: HeaderNavItem[];
};

export default function HeaderNav({ label, items }: HeaderNavProps) {
  return (
    <nav aria-label={label}>
      <ul className={styles.links}>
        {items.map((item) => (
          <li key={item.href}>
            {item.href.startsWith('#') ? (
              // In-page anchors are plain links; the router only handles page changes
              <a className={styles.link} href={item.href}>
                {item.label}
              </a>
            ) : (
              <NavLink
                to={item.href}
                end
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
