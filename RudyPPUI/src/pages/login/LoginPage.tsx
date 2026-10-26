import { Navigate, useLocation, useNavigate } from 'react-router';
import type { LoginRedirectState } from '../../features/auth/RequireAuth.tsx';
import { safeReturnPath } from '../../features/auth/returnPath.ts';
import LoginForm from '../../features/auth/components/LoginForm.tsx';
import { useAuth } from '../../features/auth/useAuth.ts';
import { useI18n } from '../../i18n/useI18n.ts';
import styles from './LoginPage.module.css';

/** Full-page login, used when a signed-in page sends a visitor here (or for a direct link). */
export default function LoginPage() {
  const { session } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const from = safeReturnPath((location.state as LoginRedirectState | null)?.from);

  // Already signed in: nothing to do here
  if (session) return <Navigate to={from} replace />;

  return (
    <div className={styles.page}>
      <title>{t.loginPage.title}</title>
      <section className={styles.brand} aria-labelledby="login-pitch">
        <h1 id="login-pitch" className={styles.pitch}>
          {t.loginPage.pitch}
        </h1>
        <p className={styles.pitchText}>{t.loginPage.pitchText}</p>
        <span className={styles.stamp} aria-hidden>
          JWT
        </span>
      </section>

      <section className={styles.card} aria-labelledby="login-title">
        <h2 id="login-title" className={styles.cardTitle}>
          {t.loginPage.heading}
        </h2>
        <p className={styles.cardIntro}>{t.loginPage.intro}</p>
        <LoginForm autoFocus onSuccess={() => navigate(from, { replace: true })} />
      </section>
    </div>
  );
}
