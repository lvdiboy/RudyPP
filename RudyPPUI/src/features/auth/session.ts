import type { Session } from './types.ts';

/*
 * Session persistence. Only the token string is stored; everything else is read from its claims.
 * "Remember me" uses localStorage (survives closing the browser), otherwise sessionStorage (this tab only).
 *
 * Decoding the JWT here is for display only. The browser cannot check the signature;
 * the backend verifies every request.
 */

const STORAGE_KEY = 'rudypp.token';

type Claims = { sub?: unknown; exp?: unknown; rol?: unknown; jti?: unknown };

export function sessionFromToken(token: string, remembered: boolean): Session | null {
  const claims = decodeClaims(token);
  if (!claims || typeof claims.sub !== 'string' || typeof claims.exp !== 'number') {
    return null;
  }
  const roles =
    typeof claims.rol === 'string' && claims.rol.length > 0
      ? claims.rol.split(',').map((role) => role.replace(/^ROLE_/, ''))
      : [];
  const userId = typeof claims.jti === 'string' && claims.jti.length > 0 ? claims.jti : null;
  return {
    token,
    username: claims.sub,
    userId,
    roles,
    expiresAt: claims.exp * 1000,
    remembered,
  };
}

export function isExpired(session: Session, now = Date.now()): boolean {
  return session.expiresAt <= now;
}

export function saveSession(session: Session): void {
  clearSession();
  try {
    (session.remembered ? localStorage : sessionStorage).setItem(STORAGE_KEY, session.token);
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the session then lasts until reload
  }
}

export function loadSession(): Session | null {
  for (const [storage, remembered] of [
    [localStorage, true],
    [sessionStorage, false],
  ] as const) {
    try {
      const token = storage.getItem(STORAGE_KEY);
      if (!token) continue;
      const session = sessionFromToken(token, remembered);
      if (session && !isExpired(session)) return session;
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore unreadable storage and treat the user as signed out
    }
  }
  return null;
}

export function clearSession(): void {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear
    }
  }
}

function decodeClaims(token: string): Claims | null {
  const payload = token.replace(/^Bearer\s+/, '').split('.')[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Claims;
  } catch {
    return null;
  }
}
