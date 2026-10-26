import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth.ts';

/** Read back by LoginPage through safeReturnPath (returnPath.ts). */
export type LoginRedirectState = { from?: string };

/**
 * Route guard for signed-in pages. Visitors go to /login, which returns them here afterwards;
 * someone who just logged out goes to the welcome page instead.
 * This is a convenience only; the backend enforces access.
 */
export default function RequireAuth() {
  const { session, loggedOut } = useAuth();
  const location = useLocation();

  if (!session) {
    if (loggedOut) return <Navigate to="/" replace />;
    // Remember the full place, including ?filter=… and #section, to come back to after login
    const state: LoginRedirectState = {
      from: location.pathname + location.search + location.hash,
    };
    return <Navigate to="/login" replace state={state} />;
  }
  return <Outlet />;
}
