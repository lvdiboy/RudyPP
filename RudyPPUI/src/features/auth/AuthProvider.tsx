import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from './api.ts';
import { AuthContext, type AuthContextValue, type SessionEndReason } from './AuthContext.ts';
import { clearSession, loadSession, saveSession, sessionFromToken } from './session.ts';
import type { LoginRequest, Session } from './types.ts';

// setTimeout overflows above ~24.8 days; tokens last at most 7, so this only guards bad clocks
const MAX_TIMER_MS = 2_147_483_647;

/** Owns the authentication lifecycle: restore on load, log in, log out, expire. */
export default function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initial state: read storage once, on the first render
  const [session, setSession] = useState<Session | null>(loadSession);
  const [notice, setNotice] = useState<SessionEndReason | null>(null);
  const [loggedOut, setLoggedOut] = useState(false);

  const endSession = useCallback((reason: SessionEndReason) => {
    clearSession();
    setSession(null);
    setLoggedOut(false);
    setNotice(reason);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const token = await authApi.login(credentials);
    const next = sessionFromToken(token, credentials.rememberMe);
    if (!next) throw new Error('The server returned a token this app cannot read.');
    saveSession(next);
    setNotice(null);
    setLoggedOut(false);
    setSession(next);
  }, []);

  const logout = useCallback(async () => {
    if (session) {
      // Revoke on the server first. If that fails (already revoked, offline), sign out locally anyway.
      await authApi.logout(session.token).catch(() => undefined);
    }
    clearSession();
    setSession(null);
    setNotice(null);
    setLoggedOut(true);
  }, [session]);

  // Sign out locally the moment the token expires, instead of waiting for a 401
  useEffect(() => {
    if (!session) return;
    const delay = Math.min(session.expiresAt - Date.now(), MAX_TIMER_MS);
    const timer = window.setTimeout(() => endSession('expired'), Math.max(delay, 0));
    return () => window.clearTimeout(timer);
  }, [session, endSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, notice, loggedOut, login, logout, endSession }),
    [session, notice, loggedOut, login, logout, endSession],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
