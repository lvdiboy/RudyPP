import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Alert from '../../../components/ui/Alert/Alert.tsx';
import Button from '../../../components/ui/Button/Button.tsx';
import Checkbox from '../../../components/ui/Checkbox/Checkbox.tsx';
import TextField from '../../../components/ui/TextField/TextField.tsx';
import { errorMessage } from '../../../i18n/errorMessage.ts';
import type { Messages } from '../../../i18n/locales/en.ts';
import { useI18n } from '../../../i18n/useI18n.ts';
import { ApiError } from '../../../lib/api-error.ts';
import { useAuth } from '../useAuth.ts';
import styles from './LoginForm.module.css';

type LoginFormProps = {
  /** Called after the session is stored; the parent decides where to go next. */
  onSuccess: () => void;
  /** Focus the user name field when the form appears (e.g. inside a dialog). */
  autoFocus?: boolean;
};

// Which problem each field has; the text comes from the current language at render time,
// so switching language also switches messages that are already on screen.
type FieldErrors = { username?: 'enterUserName'; password?: 'enterPassword' };

export default function LoginForm({ onSuccess, autoFocus = false }: LoginFormProps) {
  const { login, notice } = useAuth();
  const { t } = useI18n();
  // Controlled inputs: React state is the single source of truth for each field
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Stop the browser's full-page form submission; we send JSON with fetch instead
    event.preventDefault();
    const errors: FieldErrors = {};
    if (!username.trim()) errors.username = 'enterUserName';
    if (!password) errors.password = 'enterPassword';
    setFieldErrors(errors);
    setFormError(null);
    if (errors.username || errors.password) return;

    setSubmitting(true);
    try {
      await login({ username: username.trim(), password, rememberMe });
      onSuccess();
    } catch (error) {
      setFormError(error ?? new Error('Login failed'));
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {notice && !formError && (
        <Alert tone="info">
          {notice === 'expired' ? t.auth.sessionExpired : t.auth.sessionRevoked}
        </Alert>
      )}
      {formError !== null && <Alert>{describeLoginError(formError, t)}</Alert>}

      <TextField
        label={t.auth.userName}
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus={autoFocus}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        error={fieldErrors.username && t.auth[fieldErrors.username]}
      />
      <TextField
        label={t.auth.password}
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password && t.auth[fieldErrors.password]}
        endAdornment={
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        }
      />
      <Checkbox
        label={t.auth.rememberMe}
        checked={rememberMe}
        onChange={(event) => setRememberMe(event.target.checked)}
      />
      <Button type="submit" block loading={submitting}>
        {!submitting && <LogIn size={18} aria-hidden />}
        {submitting ? t.auth.loggingIn : t.auth.logIn}
      </Button>
    </form>
  );
}

function describeLoginError(error: unknown, t: Messages): string {
  if (error instanceof ApiError) {
    // A 401 on login always means wrong credentials (or a disabled account)
    if (error.status === 401) return t.auth.wrongCredentials;
    return errorMessage(error, t);
  }
  return t.auth.loginFailed;
}
