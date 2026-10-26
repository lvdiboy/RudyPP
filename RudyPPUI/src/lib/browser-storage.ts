/*
 * Safe localStorage access. Every call reports what happened instead of throwing, because storage
 * can be missing (private mode, blocked site data), full, or hold text that isn't valid JSON.
 * Business rules (what a valid record looks like) belong to the caller, not here.
 */

export type ReadResult =
  | { kind: 'empty' }
  | { kind: 'ok'; value: unknown }
  | { kind: 'invalid' }
  | { kind: 'unavailable' };

export type WriteFailure = 'quota' | 'unavailable';
export type WriteResult = { ok: true } | { ok: false; reason: WriteFailure };

export function readJson(key: string): ReadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return { kind: 'unavailable' };
  }
  if (raw === null) return { kind: 'empty' };
  try {
    return { kind: 'ok', value: JSON.parse(raw) as unknown };
  } catch {
    return { kind: 'invalid' };
  }
}

export function writeJson(key: string, value: unknown): WriteResult {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: isQuotaError(error) ? 'quota' : 'unavailable' };
  }
}

export function removeKey(key: string): WriteResult {
  try {
    localStorage.removeItem(key);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}
