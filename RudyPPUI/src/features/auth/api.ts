import { ApiError } from '../../lib/apiError.ts';
import { request } from '../../lib/http.ts';
import type { LoginRequest } from './types.ts';

/**
 * POST /api/auth/login. Returns the Authorization header value ("Bearer ...").
 * The JSON body only holds a legacy redirect hint, which the app ignores.
 */
export async function login(credentials: LoginRequest): Promise<string> {
  const response = await request('/auth/login', { method: 'POST', json: credentials });
  const token = response.headers.get('Authorization');
  if (!token) {
    throw new ApiError(response.status, 'Login succeeded but no token came back. Try again.');
  }
  return token;
}

/** POST /api/auth/logout. Revokes the token on the server; the response has no body. */
export async function logout(token: string): Promise<void> {
  await request('/auth/logout', { method: 'POST', token });
}
