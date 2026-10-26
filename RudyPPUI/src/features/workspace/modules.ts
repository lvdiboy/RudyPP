import {
  BookMarked,
  Bookmark,
  CodeXml,
  Images,
  ListTodo,
  NotebookPen,
  type LucideIcon,
} from 'lucide-react';
import type { Messages } from '../../i18n/locales/en.ts';

/*
 * Workspace module metadata, shared by the sidebar, the overview cards and page headings.
 * Data and routes are NOT registered here: each module owns its data layer, and the routes are
 * composed explicitly in app/router.tsx. To add a module, see docs/frontend/workspace-modules.md.
 */

/** Ids double as keys of the `workspace.modules` text in both dictionaries. */
export type ModuleId = keyof Messages['workspace']['modules'];

type ModuleBase = {
  id: ModuleId;
  icon: LucideIcon;
};

/** Built and navigable: must have a path under /dashboard. */
export type ActiveModule = ModuleBase & {
  status: 'active';
  group: 'daily' | 'create';
  path: `/dashboard/${string}`;
  /** Light background tint for its overview card and icon. */
  tint: 'sea' | 'sand' | 'green';
};

/** Announced but not built: shown as information only, never as a link. */
export type PlannedModule = ModuleBase & {
  status: 'planned';
  group: 'future';
};

export type WorkspaceModule = ActiveModule | PlannedModule;

export const WORKSPACE_MODULES: WorkspaceModule[] = [
  {
    id: 'notes',
    status: 'active',
    group: 'daily',
    path: '/dashboard/notes',
    icon: NotebookPen,
    tint: 'sand',
  },
  {
    id: 'bookmarks',
    status: 'active',
    group: 'daily',
    path: '/dashboard/bookmarks',
    icon: Bookmark,
    tint: 'sea',
  },
  {
    id: 'tasks',
    status: 'active',
    group: 'daily',
    path: '/dashboard/tasks',
    icon: ListTodo,
    tint: 'green',
  },
  {
    id: 'learning',
    status: 'active',
    group: 'create',
    path: '/dashboard/learning',
    icon: CodeXml,
    tint: 'sea',
  },
  { id: 'knowledge', status: 'planned', group: 'future', icon: BookMarked },
  { id: 'gallery', status: 'planned', group: 'future', icon: Images },
];

export const MODULE_GROUPS = ['daily', 'create', 'future'] as const;

export function activeModule(id: ModuleId): ActiveModule {
  const found = WORKSPACE_MODULES.find((module) => module.id === id);
  if (!found || found.status !== 'active') throw new Error(`Module ${id} is not active`);
  return found;
}
