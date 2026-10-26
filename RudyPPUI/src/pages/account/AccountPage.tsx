import { BookOpen, FlaskConical, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Alert from '../../components/ui/Alert/Alert.tsx';
import Button from '../../components/ui/Button/Button.tsx';
import Card from '../../components/ui/Card/Card.tsx';
import Spinner from '../../components/ui/Spinner/Spinner.tsx';
import { formatRole } from '../../features/auth/roles.ts';
import { useAuth } from '../../features/auth/useAuth.ts';
import { fetchUsers, USER_LIST_ROLES } from '../../features/users/api.ts';
import type { Page, UserSummary } from '../../features/users/types.ts';
import { errorMessage } from '../../i18n/errorMessage.ts';
import { useI18n } from '../../i18n/useI18n.ts';
import { ApiError } from '../../lib/api-error.ts';
import styles from './AccountPage.module.css';

const PREVIEW_SIZE = 5;

// The error itself is kept, not its text, so the message follows a language switch
type MembersState =
  | { status: 'loading' }
  | { status: 'ready'; page: Page<UserSummary> }
  | { status: 'error'; error: unknown };

/** Opened from the user menu: session details and the member list. */
export default function AccountPage() {
  const { session, endSession } = useAuth();
  const { t, locale } = useI18n();
  const a = t.account;
  const canListMembers = session?.roles.some((role) => USER_LIST_ROLES.includes(role)) ?? false;
  const [members, setMembers] = useState<MembersState>({ status: 'loading' });
  // Bumping this re-runs the effect below (the Retry button)
  const [reloadKey, setReloadKey] = useState(0);
  const token = session?.token;

  useEffect(() => {
    if (!token || !canListMembers) return;
    // Cancel the request if the page unmounts or the effect re-runs before it finishes
    const controller = new AbortController();
    fetchUsers(token, 0, PREVIEW_SIZE, controller.signal)
      .then((page) => setMembers({ status: 'ready', page }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          // The token was revoked or expired on the server (e.g. a login elsewhere)
          endSession('revoked');
          return;
        }
        setMembers({ status: 'error', error });
      });
    return () => controller.abort();
  }, [token, canListMembers, reloadKey, endSession]);

  if (!session) return null;

  const timeFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className={styles.page}>
      <title>{a.title}</title>
      <section className={styles.welcome} aria-labelledby="account-title">
        <h1 id="account-title" className={styles.title}>
          {a.heading(session.username)}
        </h1>
        <p className={styles.subtitle}>{a.subtitle}</p>
      </section>

      <div className={styles.grid}>
        <Card as="article" accent="highlight">
          <h2 className={styles.cardTitle}>{a.sessionHeading}</h2>
          <dl className={styles.facts}>
            <div>
              <dt>{a.userName}</dt>
              <dd>{session.username}</dd>
            </div>
            <div>
              <dt>{a.roles}</dt>
              <dd>
                <ul className={styles.chips}>
                  {session.roles.map((role) => (
                    <li key={role}>{formatRole(role, t)}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>{a.ends}</dt>
              <dd>
                <time dateTime={new Date(session.expiresAt).toISOString()}>
                  {timeFormat.format(session.expiresAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt>{a.onThisDevice}</dt>
              <dd>{session.remembered ? a.remembered : a.untilBrowserCloses}</dd>
            </div>
          </dl>
        </Card>

        <Card as="article" accent="teal">
          <h2 className={styles.cardTitle}>{a.membersHeading}</h2>
          {!canListMembers ? (
            <p className={styles.muted}>{a.membersNotAllowed}</p>
          ) : members.status === 'loading' ? (
            <p className={styles.loading}>
              <Spinner size="sm" /> {a.membersLoading}
            </p>
          ) : members.status === 'error' ? (
            <div className={styles.errorBlock}>
              <Alert>{errorMessage(members.error, t)}</Alert>
              <Button
                variant="secondary"
                onClick={() => {
                  setMembers({ status: 'loading' });
                  setReloadKey((key) => key + 1);
                }}
              >
                <RefreshCw size={16} aria-hidden /> {t.common.tryAgain}
              </Button>
            </div>
          ) : (
            <>
              <p className={styles.count}>
                <strong>{members.page.totalElements.toLocaleString(locale)}</strong>{' '}
                {a.membersCount(members.page.totalElements)}
              </p>
              {members.page.content.length > 0 && (
                <ul className={styles.members}>
                  {members.page.content.map((member) => (
                    <li key={member.userName}>
                      <span className={styles.memberAvatar} aria-hidden>
                        {member.userName.slice(0, 2).toUpperCase()}
                      </span>
                      <span>
                        <span className={styles.memberName}>{member.fullName}</span>
                        <span className={styles.muted}> @{member.userName}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {members.page.totalElements > members.page.content.length && (
                <p className={styles.muted}>{a.membersShowingFirst(members.page.content.length)}</p>
              )}
            </>
          )}
        </Card>

        <Card as="article" accent="pink">
          <h2 className={styles.cardTitle}>{a.keepLearningHeading}</h2>
          <ul className={styles.shortcuts}>
            <li>
              <Link to="/dashboard#journal" className={styles.shortcut}>
                <BookOpen size={20} aria-hidden />
                <span>
                  <strong>{a.journalShortcut}</strong>
                  <span className={styles.muted}>{a.journalShortcutText}</span>
                </span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard#playground" className={styles.shortcut}>
                <FlaskConical size={20} aria-hidden />
                <span>
                  <strong>{a.playgroundShortcut}</strong>
                  <span className={styles.muted}>{a.playgroundShortcutText}</span>
                </span>
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
