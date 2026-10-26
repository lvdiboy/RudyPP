import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from '../Spinner/Spinner.tsx';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** solid: dark fill for the main action on calm pages such as the workspace. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'solid';
  /** Stretch to the full width of the container. */
  block?: boolean;
  /** Shows a spinner and blocks clicks while an action runs. */
  loading?: boolean;
  children: ReactNode;
};

// A real <button> for actions. For navigation, use ButtonLink.
export default function Button({
  variant = 'primary',
  block = false,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], block && styles.block, className]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
