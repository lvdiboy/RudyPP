/**
 * Where to go after login. Only same-site paths are accepted ("/dashboard/notes?x#y"), never
 * "//other.site", "/\\other.site" or a full URL, so the value can't send the user to another site.
 */
export function safeReturnPath(from: unknown): string {
  return typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    !from.includes('\\')
    ? from
    : '/dashboard';
}
