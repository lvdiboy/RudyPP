import HeaderNav from './HeaderNav.tsx';
import UserMenu from '../features/auth/components/UserMenu.tsx';
import { useI18n } from '../i18n/useI18n.ts';
import PageFrame from './PageFrame.tsx';

/** The account page. RequireAuth guarantees a session before this renders. */
export default function AccountLayout() {
  const { t } = useI18n();
  const items = [
    { href: '/dashboard', label: t.nav.dashboard },
    { href: '/', label: t.nav.home },
  ];
  return (
    <PageFrame
      nav={<HeaderNav label={t.nav.accountLabel} items={items} />}
      actions={<UserMenu />}
    />
  );
}
