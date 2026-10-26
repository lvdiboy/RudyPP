import styles from './StatusMessage.module.css';

/**
 * Result of the last action ("Note saved.", "Updated from another tab.") in a polite live region,
 * so screen readers announce it without moving focus. Always rendered, so announcements work.
 */
export default function StatusMessage({ message }: { message: string | null }) {
  return (
    <p className={message ? styles.status : styles.empty} role="status">
      {message}
    </p>
  );
}
