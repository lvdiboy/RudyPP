import { Link } from 'react-router';
import tool from '../../features/workspace/components/tool.module.css';
import WorkspacePage from '../../features/workspace/components/WorkspacePage.tsx';
import { useI18n } from '../../i18n/useI18n.ts';

/** /dashboard/<anything unknown>: says so instead of quietly showing the overview. */
export default function WorkspaceNotFoundPage() {
  const { t } = useI18n();
  const nf = t.workspace.notFound;
  return (
    <WorkspacePage documentTitle={nf.title} heading={nf.heading} intro={nf.text}>
      <p>
        <Link to="/dashboard" className={tool.smallButton}>
          {nf.cta}
        </Link>
      </p>
    </WorkspacePage>
  );
}
