import { useId, type ReactNode, type Ref, type TextareaHTMLAttributes } from 'react';
import styles from './TextField.module.css';

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  ref?: Ref<HTMLTextAreaElement>;
};

/** Multi-line sibling of TextField, with the same label, error and hint wiring. */
export default function TextArea({ label, error, hint, ref, ...textareaProps }: TextAreaProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.control} ${error ? styles.invalid : ''}`}>
        <textarea
          {...textareaProps}
          ref={ref}
          id={id}
          className={`${styles.input} ${styles.textarea}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
