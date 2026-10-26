import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import styles from './TextField.module.css';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  /** Shown under the field and linked to it for screen readers. */
  error?: string;
  /** Neutral help under the field, e.g. a format hint or a character counter. */
  hint?: ReactNode;
  /** Rendered inside the field on the right, e.g. a show-password button. */
  endAdornment?: ReactNode;
  ref?: Ref<HTMLInputElement>;
};

export default function TextField({
  label,
  error,
  hint,
  endAdornment,
  ref,
  ...inputProps
}: TextFieldProps) {
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
        <input
          {...inputProps}
          ref={ref}
          id={id}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {endAdornment}
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
