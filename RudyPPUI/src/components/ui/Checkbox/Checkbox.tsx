import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
};

export default function Checkbox({ label, ...inputProps }: CheckboxProps) {
  return (
    <label className={styles.checkbox}>
      <input {...inputProps} type="checkbox" className={styles.input} />
      {label}
    </label>
  );
}
