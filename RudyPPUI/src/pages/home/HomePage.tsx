import coastPhoto from '../../assets/coast.jpeg';
import LanguageToggle from '../../components/LanguageToggle.tsx';
import AccountControl from '../../features/auth/components/AccountControl.tsx';
import { useI18n } from '../../i18n/useI18n.ts';
import OceanHome from './OceanHome.tsx';

/**
 * The public home page at /. OceanHome brings its own header, skip link, <main> and footer,
 * so this route is not wrapped in SiteLayout. Its header's top-right corner gets the same
 * controls as every other page: the language switch and Log in (or the user menu).
 */
export default function HomePage() {
  const { t } = useI18n();
  return (
    <>
      <title>{t.home.title}</title>
      <OceanHome
        photoUrl={coastPhoto}
        name="Rudy"
        headerActions={
          <>
            <LanguageToggle />
            <AccountControl />
          </>
        }
      />
    </>
  );
}
