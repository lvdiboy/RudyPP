/** Body of POST /api/auth/login. Note: "username" here, "userName" everywhere else. */
export type LoginRequest = {
  username: string;
  password: string;
  rememberMe: boolean;
};

/** The signed-in user, as far as the browser knows it (read from the JWT). */
export type Session = {
  /** Full Authorization header value, e.g. "Bearer eyJ...". */
  token: string;
  username: string;
  /** Database user id from the token's "jti" claim; null if a token ever lacks it. */
  userId: string | null;
  /** Role names without the ROLE_ prefix, e.g. ["USER", "MANAGER"]. */
  roles: string[];
  /** Expiry as epoch milliseconds. */
  expiresAt: number;
  /** Kept after the browser closes (Remember me). */
  remembered: boolean;
};
