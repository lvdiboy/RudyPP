import { useState, type CSSProperties } from 'react';
import { useI18n } from '../../../i18n/useI18n.ts';
import styles from './TokenPlayground.module.css';

const accents = [
  { id: 'highlight', token: 'var(--color-highlight)' },
  { id: 'pink', token: 'var(--color-pink)' },
  { id: 'teal', token: 'var(--color-teal)' },
] as const;

type AccentId = (typeof accents)[number]['id'];

export default function TokenPlayground() {
  const { t } = useI18n();
  const p = t.playground;
  const [accentId, setAccentId] = useState<AccentId>('highlight');
  const accent = accents.find((option) => option.id === accentId) ?? accents[0];

  // TypeScript's CSSProperties type doesn't know custom properties, hence the cast.
  const previewStyle = { '--preview-accent': accent.token } as CSSProperties;

  return (
    <div className={styles.playground}>
      <fieldset className={styles.options}>
        <legend className={styles.legend}>{p.legend}</legend>
        {accents.map((option) => (
          <label key={option.id} className={styles.option}>
            <input
              type="radio"
              name="playground-accent"
              value={option.id}
              checked={option.id === accentId}
              onChange={() => setAccentId(option.id)}
            />
            <span className={styles.swatch} style={{ background: option.token }} aria-hidden />
            {p.accents[option.id]}
          </label>
        ))}
      </fieldset>

      <div className={styles.preview} style={previewStyle}>
        <p className={styles.previewBadge}>{p.accents[accent.id]}</p>
        <p className={styles.previewTitle}>{p.previewTitle}</p>
        <p>
          {p.previewTextBefore}
          <code>--preview-accent</code>
          {p.previewTextAfter}
        </p>
      </div>
    </div>
  );
}
