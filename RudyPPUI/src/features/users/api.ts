import { requestJson } from '../../lib/http.ts';
import type { Page, UserSummary } from './types.ts';

/** Roles the backend allows to call GET /api/users. */
export const USER_LIST_ROLES = ['USER', 'MANAGER', 'ADMIN'];

/** GET /api/users?pageNum&pageSize. pageNum is zero-based. */
export function fetchUsers(
  token: string,
  pageNum: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<Page<UserSummary>> {
  const query = new URLSearchParams({ pageNum: String(pageNum), pageSize: String(pageSize) });
  return requestJson<Page<UserSummary>>(`/users?${query}`, { token, signal });
}
