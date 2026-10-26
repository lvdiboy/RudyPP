import { CircleAlert, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertProps = {
  tone?: 'error' | 'info';
  children: ReactNode;
};

/** A message box. Errors use role="alert", so screen readers announce them immediately. */
export default function Alert({ tone = 'error', children }: AlertProps) {
  const Icon = tone === 'error' ? CircleAlert : Info;
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className={styles.icon} size={20} aria-hidden />
      <div>{children}</div>
    </div>
  );
}
