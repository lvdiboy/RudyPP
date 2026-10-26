import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import LanguageToggle from '../components/LanguageToggle.tsx';
import UserMenu from '../features/auth/components/UserMenu.tsx';
import Sidebar from '../features/workspace/components/Sidebar.tsx';
import theme from '../features/workspace/components/theme.module.css';
import { WORKSPACE_MODULES } from '../features/workspace/modules.ts';
import { workspaceKey } from '../features/workspace/storage.ts';
import { useWorkspaceNamespace } from '../features/workspace/useWorkspaceNamespace.ts';
import { useI18n } from '../i18n/useI18n.ts';
import { readJson, writeJson } from '../lib/browserStorage.ts';
import styles from './DashboardLayout.module.css';

// Matches the CSS breakpoint where the sidebar turns into a drawer
const DESKTOP_QUERY = '(min-width: 60rem)';

/**
 * The personal workspace frame for /dashboard/*: sidebar (drawer on phones), one top bar with
 * the language switch and user menu, and the module page. Keyed by account, so switching
 * accounts starts from a clean state (no previous account's data or edits in memory).
 */
export default function DashboardLayout() {
  const namespace = useWorkspaceNamespace();
  return <WorkspaceShell key={namespace} namespace={namespace} />;
}

function WorkspaceShell({ namespace }: { namespace: string }) {
  const { t } = useI18n();
  const w = t.workspace;
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useSidebarPreference(namespace);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => drawerRef.current?.close();

  // Following a link in the drawer closes it
  useEffect(() => {
    drawerRef.current?.close();
  }, [pathname]);

  // Growing to desktop width closes the drawer, so no backdrop or scroll lock is left behind
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (desktop.matches) drawerRef.current?.close();
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // The modal drawer keeps focus inside; this stops the page behind it from scrolling
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const section = currentSection(pathname);
  const sectionTitle =
    section === 'overview' ? w.overviewNav : section ? w.modules[section].title : null;

  return (
    <div className={`${theme.vars} ${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      <a className={styles.skipLink} href="#main">
        {t.common.skipToContent}
      </a>

      <aside className={`${theme.theme} ${styles.sidebarSlot}`}>
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      </aside>

      <dialog
        ref={drawerRef}
        className={`${theme.theme} ${styles.drawer}`}
        aria-label={w.navLabel}
        onClose={() => setDrawerOpen(false)}
        // A click on the dialog element itself (not its content) is a click on the backdrop
        onClick={(event) => event.target === event.currentTarget && closeDrawer()}
      >
        <Sidebar collapsed={false} onClose={closeDrawer} />
      </dialog>

      <div className={styles.content}>
        <header className={`${theme.theme} ${styles.topbar}`}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={w.openMenu}
            aria-haspopup="dialog"
            onClick={() => {
              drawerRef.current?.showModal();
              setDrawerOpen(true);
            }}
          >
            <Menu size={20} aria-hidden />
          </button>
          <p className={styles.crumbs}>
            <span className={styles.crumbRoot}>{w.root}</span>
            {sectionTitle && section !== 'overview' && (
              <>
                <span aria-hidden> / </span>
                <span className={styles.crumbCurrent}>{sectionTitle}</span>
              </>
            )}
          </p>
          <div className={styles.actions}>
            <LanguageToggle />
            <UserMenu />
          </div>
        </header>

        <main id="main" tabIndex={-1} className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Which module the URL is in: 'overview' for /dashboard, a module id, or null if unknown. */
function currentSection(pathname: string) {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/dashboard') return 'overview' as const;
  const module = WORKSPACE_MODULES.find(
    (candidate) => candidate.status === 'active' && candidate.path === path,
  );
  return module ? module.id : null;
}

/** Desktop collapse choice, remembered per account in this browser. The phone drawer is separate. */
function useSidebarPreference(namespace: string): [boolean, (collapsed: boolean) => void] {
  const key = workspaceKey(namespace, 'sidebar');
  const [collapsed, setCollapsed] = useState(() => {
    const saved = readJson(key);
    return saved.kind === 'ok' && (saved.value as { collapsed?: unknown }).collapsed === true;
  });
  const update = (next: boolean) => {
    setCollapsed(next);
    writeJson(key, { collapsed: next });
  };
  return [collapsed, update];
}
