import styles from './Spinner.module.css';

type SpinnerProps = {
  size?: 'sm' | 'md';
  /** Announced to screen readers. Leave empty when nearby text already explains the wait. */
  label?: string;
};

export default function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]}`}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
