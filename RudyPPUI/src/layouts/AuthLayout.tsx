import HeaderNav from './HeaderNav.tsx';
import { useI18n } from '../i18n/useI18n.ts';
import PageFrame from './PageFrame.tsx';

/** Login (and later registration): no login button in the corner, just a way back home. */
export default function AuthLayout() {
  const { t } = useI18n();
  return (
    <PageFrame
      nav={<HeaderNav label={t.nav.siteLabel} items={[{ href: '/', label: t.nav.home }]} />}
    />
  );
}
