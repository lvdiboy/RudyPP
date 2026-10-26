import { ApiError } from '../lib/api-error.ts';
import type { Messages } from './locales/en.ts';

/**
 * A user-facing message for a failed request, in the current language. The backend's own
 * messages are English only, so known error codes and statuses are mapped to our messages.
 */
export function errorMessage(error: unknown, t: Messages): string {
  if (!(error instanceof ApiError)) return t.errors.server;
  switch (error.code) {
    case 1001:
      return t.errors.userNameTaken;
    case 1002:
      return t.errors.roleNotFound;
    case 1003:
      return t.errors.invalidInput;
    case 1004:
      return t.errors.userNotFound;
    case 1006:
      return t.errors.badCredentials;
  }
  if (error.status === 0) return t.errors.network;
  if (error.status === 401) return t.errors.unauthorized;
  if (error.status === 403) return t.errors.forbidden;
  if (error.status >= 500) return t.errors.server;
  return t.errors.requestFailed(error.status);
}
