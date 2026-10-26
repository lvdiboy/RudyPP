import AccountControl from '../features/auth/components/AccountControl.tsx';
import PageFrame from './PageFrame.tsx';

/** Public pages that use the shared frame (currently the not-found page). */
export default function SiteLayout() {
  return <PageFrame actions={<AccountControl />} />;
}
