import { ApiError, networkError } from './apiError.ts';

// Relative on purpose: Vite proxies /api in development, Spring Boot serves it in production.
const API_BASE = '/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Sent as a JSON body. */
  json?: unknown;
  /** Full Authorization header value, already starting with "Bearer ". */
  token?: string;
  signal?: AbortSignal;
};

/**
 * Sends a request to the backend and returns the raw Response when the status is 2xx.
 * Throws ApiError otherwise. Several endpoints succeed with an empty body, so parsing JSON
 * is left to requestJson or the caller.
 */
export async function request(path: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', json, token, signal } = options;
  const headers = new Headers({ Accept: 'application/json' });
  if (json !== undefined) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', token);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: json === undefined ? undefined : JSON.stringify(json),
      signal,
    });
  } catch (error) {
    // Let callers ignore requests they cancelled themselves
    if (signal?.aborted) throw error;
    throw networkError();
  }

  if (!response.ok) throw await ApiError.fromResponse(response);
  return response;
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await request(path, options);
  return (await response.json()) as T;
}
