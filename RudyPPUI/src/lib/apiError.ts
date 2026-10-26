/**
 * One error type for every failed API call.
 *
 * The backend answers in two shapes: business and validation errors carry a JSON body
 * ({ code, message, status, data }), while security errors (401/403) have an empty body.
 * fromResponse handles both, so callers can rely on status and message being present.
 */
export class ApiError extends Error {
  /** HTTP status; 0 when the server could not be reached at all. */
  readonly status: number;
  /** Backend error code such as 1003, when the body had one. */
  readonly code: number | undefined;
  /** Per-field messages from validation errors (code 1003). */
  readonly fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    code?: number,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const body = await readJsonBody(response);
    const message =
      typeof body?.message === 'string' ? body.message : defaultMessage(response.status);
    const code = typeof body?.code === 'number' ? body.code : undefined;
    const fieldErrors = code === 1003 && isStringRecord(body?.data) ? body.data : {};
    return new ApiError(response.status, message, code, fieldErrors);
  }
}

export function networkError(): ApiError {
  return new ApiError(0, 'Could not reach the server. Check that it is running and try again.');
}

type ErrorBody = { message?: unknown; code?: unknown; data?: unknown };

async function readJsonBody(response: Response): Promise<ErrorBody | undefined> {
  if (!response.headers.get('Content-Type')?.includes('json')) {
    return undefined;
  }
  try {
    return (await response.json()) as ErrorBody;
  } catch {
    return undefined;
  }
}

function defaultMessage(status: number): string {
  if (status === 401) return 'You are not signed in, or your session has ended.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status >= 500) return 'The server had a problem. Try again in a moment.';
  return `Request failed (HTTP ${status}).`;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}
