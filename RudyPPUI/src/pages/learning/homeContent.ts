import type { CardAccent } from '../../components/ui/Card/Card.tsx';
import type { Messages } from '../../i18n/locales/en.ts';

/*
 * Structure only (ids, colors, dates). The text for each item lives in the i18n dictionaries
 * under learning.topics / learning.entries, keyed by these ids.
 */

export type TopicId = keyof Messages['learning']['topics'];
export type EntryId = keyof Messages['learning']['entries'];

// The topics this site is built to practice (from the frontend roadmap).
export const learningTopics: { id: TopicId; accent: CardAccent }[] = [
  { id: 'react', accent: 'highlight' },
  { id: 'typescript', accent: 'pink' },
  { id: 'css', accent: 'teal' },
];

/*
 * SAMPLE CONTENT: placeholder journal entries.
 * No journal API exists yet. Replace these when real entries arrive (milestone 6).
 */
export const sampleJournalEntries: { id: EntryId; date: string }[] = [
  { id: 'firstComponent', date: '2026-10-20' },
  { id: 'cssModules', date: '2026-10-23' },
  { id: 'springPage', date: '2026-10-25' },
];
