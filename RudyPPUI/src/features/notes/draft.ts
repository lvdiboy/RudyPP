import { readJson, removeKey, writeJson } from '../../lib/browserStorage.ts';
import { workspaceKey } from '../workspace/storage.ts';

/*
 * The note being edited, saved on every keystroke so nothing typed is lost when the user
 * navigates away inside the app, reloads or closes the tab. (Declarative React Router can't
 * block in-app navigation, so a reliable draft replaces a "leave page?" prompt.)
 * Cleared when the note is saved or the user discards it.
 */
export type NoteDraft = {
  /** null for a new note. */
  noteId: string | null;
  title: string;
  body: string;
};

function isDraft(value: unknown): value is NoteDraft {
  const draft = value as NoteDraft;
  return (
    typeof value === 'object' &&
    value !== null &&
    (draft.noteId === null || typeof draft.noteId === 'string') &&
    typeof draft.title === 'string' &&
    typeof draft.body === 'string'
  );
}

export function noteDraftStore(namespace: string) {
  const key = workspaceKey(namespace, 'notes-draft');
  return {
    read(): NoteDraft | null {
      const result = readJson(key);
      return result.kind === 'ok' && isDraft(result.value) ? result.value : null;
    },
    /** Best effort: a draft that can't be stored doesn't block editing. */
    write(draft: NoteDraft): void {
      writeJson(key, draft);
    },
    clear(): void {
      removeKey(key);
    },
  };
}
