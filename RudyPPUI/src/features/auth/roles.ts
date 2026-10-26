import type { Messages } from '../../i18n/locales/en.ts';

/** A role name for display in the current language. Unknown roles fall back to "Temp user" style. */
export function formatRole(role: string, t: Messages): string {
  return t.roles[role] ?? role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, ' ');
}
