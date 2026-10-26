import { createContext } from 'react';
import type { LoginRequest, Session } from './types.ts';

/** Why a session ended without the user logging out. The login form shows it in the current language. */
export type SessionEndReason = 'expired' | 'revoked';

export type AuthContextValue = {
  session: Session | null;
  /** Why the last session ended without the user logging out, if it did. */
  notice: SessionEndReason | null;
  /** Throws ApiError when the backend rejects the credentials. */
  login: (credentials: LoginRequest) => Promise<void>;
  /** True after the user chose Log out (until the next login). Guards send them home, not to /login. */
  loggedOut: boolean;
  /** Revokes the token on the server, then clears the session here. */
  logout: () => Promise<void>;
  /** For when the backend rejects the stored token (expired or revoked elsewhere). */
  endSession: (reason: SessionEndReason) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
