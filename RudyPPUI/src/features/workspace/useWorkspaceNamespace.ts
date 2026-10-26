import { useAuth } from '../auth/useAuth.ts';
import { workspaceNamespace } from './storage.ts';

/** The signed-in account's storage namespace. Only used under RequireAuth, so a session exists. */
export function useWorkspaceNamespace(): string {
  const { session } = useAuth();
  if (!session) throw new Error('useWorkspaceNamespace needs a signed-in user');
  return workspaceNamespace(session);
}
