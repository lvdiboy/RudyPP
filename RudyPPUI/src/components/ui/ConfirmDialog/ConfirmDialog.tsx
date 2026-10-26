import { useEffect, useId, useRef } from 'react';
import Button from '../Button/Button.tsx';
import styles from './ConfirmDialog.module.css';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  /** Called for Cancel, Esc and a click on the backdrop. */
  onCancel: () => void;
  /** "danger" marks destructive actions such as delete. */
  tone?: 'default' | 'danger';
};

/**
 * A modal yes/no question on the native <dialog>: focus stays inside, Esc cancels, and focus
 * returns to whatever opened it. Focus starts on Cancel, the safe choice.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  tone = 'default',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      dialog.querySelector<HTMLButtonElement>('[data-cancel]')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      // Esc: let the parent decide (it closes us by setting open=false)
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => event.target === event.currentTarget && onCancel()}
    >
      <div className={styles.panel}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p id={messageId} className={styles.message}>
          {message}
        </p>
        <div className={styles.actions}>
          <Button variant="secondary" data-cancel onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button className={tone === 'danger' ? styles.danger : undefined} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
