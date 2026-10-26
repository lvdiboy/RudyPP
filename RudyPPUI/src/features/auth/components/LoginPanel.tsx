import { LogIn, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';
import { useI18n } from '../../../i18n/useI18n.ts';
import LoginForm from './LoginForm.tsx';
import styles from './LoginPanel.module.css';

/**
 * The "Log in" button for the site header. It opens the login form in a native <dialog>
 * anchored to the top-right corner. showModal() gives us focus trapping, Esc to close and
 * an inert page behind it without extra code.
 */
export default function LoginPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Changing the key remounts the form, so every opening starts empty
  const [formKey, setFormKey] = useState(0);
  const navigate = useNavigate();
  const titleId = useId();
  const { t } = useI18n();

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Remount a fresh form now, synchronously, so it exists before we move focus into it
    flushSync(() => setFormKey((key) => key + 1));
    dialog.showModal();
    // showModal focuses the first focusable element (the close button); start in the user name field
    dialog.querySelector<HTMLInputElement>('input[name="username"]')?.focus();
  };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className={styles.trigger} onClick={open} aria-haspopup="dialog">
        <LogIn size={18} aria-hidden />
        {t.auth.logIn}
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        // A click on the dialog element itself (not its content) is a click on the backdrop
        onClick={(event) => event.target === event.currentTarget && close()}
      >
        <div className={styles.panel}>
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {t.auth.panelTitle}
            </h2>
            <button
              type="button"
              className={styles.close}
              onClick={close}
              aria-label={t.common.close}
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          <p className={styles.intro}>{t.auth.panelIntro}</p>
          <LoginForm
            key={formKey}
            onSuccess={() => {
              close();
              navigate('/dashboard');
            }}
          />
        </div>
      </dialog>
    </>
  );
}
