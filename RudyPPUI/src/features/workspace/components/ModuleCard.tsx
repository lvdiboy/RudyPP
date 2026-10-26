import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useI18n } from '../../../i18n/useI18n.ts';
import type { ActiveModule } from '../modules.ts';
import styles from './ModuleCard.module.css';

/** Overview entry for one module: name, what it is for, and one real number or fact. */
export default function ModuleCard({ module, stat }: { module: ActiveModule; stat: string }) {
  const { t } = useI18n();
  const text = t.workspace.modules[module.id];
  const Icon = module.icon;
  return (
    <Link to={module.path} className={`${styles.card} ${styles[module.tint]}`}>
      <span className={styles.icon} aria-hidden>
        <Icon size={20} />
      </span>
      <span className={styles.title}>{text.title}</span>
      <span className={styles.description}>{text.description}</span>
      <span className={styles.footer}>
        <span>{stat}</span>
        <ArrowRight size={18} aria-hidden />
      </span>
    </Link>
  );
}
