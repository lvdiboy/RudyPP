import { ChevronDown, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import Spinner from '../../../components/ui/Spinner/Spinner.tsx';
import { useI18n } from '../../../i18n/useI18n.ts';
import { formatRole } from '../roles.ts';
import { useAuth } from '../useAuth.ts';
import styles from './UserMenu.module.css';

/**
 * Top-right account control: who is signed in, their roles, when the session ends, and Log out.
 * A disclosure (button + panel) rather than an ARIA menu: simpler, and the panel holds
 * information as well as actions.
 */
export default function UserMenu() {
  const { session, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { pathname } = useLocation();
  const { t, locale } = useI18n();
  const timeFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });

  // Close on Escape (returning focus to the button) or on a click outside
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  if (!session) return null;

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    // On a public page, stay put. On a signed-in page, RequireAuth sends the user home.
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.avatar} aria-hidden>
          {initials(session.username)}
        </span>
        <span className={styles.name}>
          <span className="visually-hidden">{t.userMenu.accountPrefix}</span>
          {session.username}
        </span>
        <ChevronDown size={16} aria-hidden className={open ? styles.chevronOpen : undefined} />
      </button>

      <div id={panelId} className={styles.panel} hidden={!open}>
        <div className={styles.identity}>
          <span className={`${styles.avatar} ${styles.avatarLarge}`} aria-hidden>
            {initials(session.username)}
          </span>
          <div>
            <p className={styles.panelName}>{session.username}</p>
            <p className={styles.muted}>{t.userMenu.signedIn}</p>
          </div>
        </div>

        <dl className={styles.details}>
          <div>
            <dt>{t.userMenu.roles}</dt>
            <dd>
              <ul className={styles.roles}>
                {session.roles.length > 0 ? (
                  session.roles.map((role) => <li key={role}>{formatRole(role, t)}</li>)
                ) : (
                  <li>{t.userMenu.noRoles}</li>
                )}
              </ul>
            </dd>
          </div>
          <div>
            <dt>{t.userMenu.sessionEnds}</dt>
            <dd>
              <time dateTime={new Date(session.expiresAt).toISOString()}>
                {timeFormat.format(session.expiresAt)}
              </time>
              {session.remembered && <span className={styles.muted}>{t.userMenu.remembered}</span>}
            </dd>
          </div>
        </dl>

        <div className={styles.actions}>
          {pathname !== '/account' && (
            <Link to="/account" className={styles.action} onClick={() => setOpen(false)}>
              <UserRound size={18} aria-hidden />
              {t.nav.account}
            </Link>
          )}
          {pathname !== '/dashboard' && (
            <Link to="/dashboard" className={styles.action} onClick={() => setOpen(false)}>
              <LayoutDashboard size={18} aria-hidden />
              {t.nav.dashboard}
            </Link>
          )}
          <button
            type="button"
            className={styles.action}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? <Spinner size="sm" /> : <LogOut size={18} aria-hidden />}
            {loggingOut ? t.auth.loggingOut : t.auth.logOut}
          </button>
        </div>
      </div>
    </div>
  );
}

function initials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}
