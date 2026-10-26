import { useI18n } from '../../../i18n/useI18n.ts';
import { charCount } from '../../../lib/text.ts';
import tool from './tool.module.css';

/** "12 / 100" under a field, highlighted (in bold, not only by color) once over the limit. */
export default function Counter({ text, max }: { text: string; max: number }) {
  const { t } = useI18n();
  const count = charCount(text);
  return (
    <span className={count > max ? tool.counterOver : undefined}>
      {t.workspace.counter(count, max)}
    </span>
  );
}
