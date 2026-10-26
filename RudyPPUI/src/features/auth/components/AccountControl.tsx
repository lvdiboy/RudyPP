import { useAuth } from '../useAuth.ts';
import LoginPanel from './LoginPanel.tsx';
import UserMenu from './UserMenu.tsx';

/** The header's top-right corner: "Log in" for visitors, the user menu once signed in. */
export default function AccountControl() {
  const { session } = useAuth();
  return session ? <UserMenu /> : <LoginPanel />;
}
