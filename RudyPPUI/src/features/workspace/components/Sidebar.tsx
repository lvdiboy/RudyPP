import {
  HardDrive,
  House,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  X,
} from 'lucide-react';
import { useId } from 'react';
import { Link, NavLink } from 'react-router';
import { useI18n } from '../../../i18n/useI18n.ts';
import { MODULE_GROUPS, WORKSPACE_MODULES } from '../modules.ts';
import styles from './Sidebar.module.css';

type SidebarProps = {
  /** Desktop icon-only mode; labels stay available to screen readers and as tooltips. */
  collapsed: boolean;
  onToggleCollapse?: () => void;
  /** Set when shown in the phone drawer: renders a close button instead of the collapse one. */
  onClose?: () => void;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.link} ${styles.active}` : styles.link;

/** Workspace navigation, built from the module list in modules.ts. */
export default function Sidebar({ collapsed, onToggleCollapse, onClose }: SidebarProps) {
  const { t } = useI18n();
  const w = t.workspace;
  const groupIdPrefix = useId();

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.brandRow}>
        <Link to="/dashboard" className={styles.brand} aria-label={`Rudy · ${w.overviewNav}`}>
          <span aria-hidden>{collapsed ? 'R' : 'Rudy'}</span>
          <span className={styles.brandSub} aria-hidden>
            {w.brandSub}
          </span>
        </Link>
        {onClose ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label={w.closeMenu}
          >
            <X size={20} aria-hidden />
          </button>
        ) : (
          onToggleCollapse && (
            <button
              type="button"
              className={styles.iconButton}
              onClick={onToggleCollapse}
              aria-label={collapsed ? w.expand : w.collapse}
              aria-expanded={!collapsed}
              title={collapsed ? w.expand : w.collapse}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} aria-hidden />
              ) : (
                <PanelLeftClose size={18} aria-hidden />
              )}
            </button>
          )
        )}
      </div>

      <nav aria-label={w.navLabel} className={styles.nav}>
        <ul className={styles.list}>
          <li>
            <NavLink
              to="/dashboard"
              end
              className={linkClass}
              title={collapsed ? w.overviewNav : undefined}
            >
              <LayoutDashboard size={18} aria-hidden />
              <span className={styles.label}>{w.overviewNav}</span>
            </NavLink>
          </li>
        </ul>

        {MODULE_GROUPS.map((group) => {
          const labelId = `${groupIdPrefix}-${group}`;
          return (
            <div key={group} className={styles.group}>
              <p id={labelId} className={styles.groupLabel}>
                {w.groups[group]}
              </p>
              <ul className={styles.list} aria-labelledby={labelId}>
                {WORKSPACE_MODULES.filter((module) => module.group === group).map((module) => {
                  const Icon = module.icon;
                  const title = w.modules[module.id].title;
                  return (
                    <li key={module.id}>
                      {module.status === 'active' ? (
                        <NavLink
                          to={module.path}
                          className={linkClass}
                          title={collapsed ? title : undefined}
                        >
                          <Icon size={18} aria-hidden />
                          <span className={styles.label}>{title}</span>
                        </NavLink>
                      ) : (
                        // Planned modules are information, not links
                        <span className={styles.planned} title={`${title} · ${w.planned}`}>
                          <Icon size={18} aria-hidden />
                          <span className={styles.label}>{title}</span>
                          <span className={styles.badge}>{w.planned}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link to="/" className={styles.link} title={collapsed ? w.backHome : undefined}>
          <House size={18} aria-hidden />
          <span className={styles.label}>{w.backHome}</span>
        </Link>
        <Link to="/account" className={styles.link} title={collapsed ? w.account : undefined}>
          <UserRound size={18} aria-hidden />
          <span className={styles.label}>{w.account}</span>
        </Link>
        <p className={styles.localNote} title={collapsed ? w.localOnly : undefined}>
          <HardDrive size={14} aria-hidden />
          <span className={styles.label}>{w.localOnly}</span>
        </p>
      </div>
    </div>
  );
}
