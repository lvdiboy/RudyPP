import type { Messages } from '../../i18n/locales/en.ts';
import type { StorageFailure } from './storage.ts';

/** A message in the current language for a failed workspace operation. */
export function failureMessage(failure: StorageFailure, t: Messages): string {
  const s = t.workspace.storage;
  switch (failure) {
    case 'corrupt':
      return s.corrupt;
    case 'quota':
      return s.quota;
    case 'notFound':
      return s.notFound;
    case 'invalid':
      return t.workspace.required;
    case 'unavailable':
      return s.unavailable;
  }
}
