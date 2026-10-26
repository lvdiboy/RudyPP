# Workspace modules: structure and how to add one

The personal workspace lives at `/dashboard` (signed-in only). It has a sidebar, one top bar with
the language switch and user menu, an overview page, and one page per module. This guide
explains how it fits together and how to add the next module (for example the knowledge base or
the photo album).

## Layout reference

The arrangement follows the **shadcn/ui Dashboard-01** block: a sidebar with grouped navigation,
a compact top bar, and a main area split into sections. Only the layout idea was used. No
shadcn code, Tailwind, chart, metric or sample data was copied or installed. Everything is
React, CSS Modules, CSS custom properties and Lucide icons, in the colors of the ocean home page.

## Pieces

| Piece | File | Role |
| --- | --- | --- |
| Routes | `src/app/router.tsx` | Nested under `RequireAuth` → `DashboardLayout`; index route = overview |
| Frame | `src/layouts/DashboardLayout.tsx` | Sidebar (desktop, collapsible) / drawer (phone), top bar, `<main>` |
| Module list | `src/features/workspace/modules.ts` | Metadata only: id, icon, group, status, path. Drives sidebar, cards, breadcrumb |
| Look | `src/features/workspace/components/theme.module.css` | `--workspace-*` colors; `.theme` re-points shared tokens for workspace chrome and tool pages |
| Page frame | `features/workspace/components/WorkspacePage.tsx` | `<title>`, one `h1`, intro, actions |
| Data contract | `features/workspace/repository.ts` | `list / create / update / remove` (+ optional `resetStorage`, `subscribe`) |
| Local storage plumbing | `features/workspace/storage.ts` | Keys, per-account namespace, schema check, read-modify-write, cross-tab events |
| List state | `features/workspace/useCollection.ts` | Loads, reloads after changes, follows other tabs, returns results instead of throwing |
| Shared UI | `ConfirmDialog`, `TextArea`, `TextField` `hint`, `StorageProblem`, `StatusMessage`, `Counter`, `tool.module.css` | |
| Modules | `features/notes`, `features/bookmarks`, `features/tasks` | Each owns its type, limits, validation and local repository |
| Pages | `pages/dashboard` (overview, not-found) and inside it `learning/`, `notes/`, `bookmarks/`, `tasks/` (folders mirror the URLs) | |

`modules.ts` uses a discriminated union. An **active** module must have a `/dashboard/...` path;
a **planned** module has none and is rendered as information ("Planned"), never as a link.
Routes are not generated from it: they stay explicit in `router.tsx`.

## Data: what is stored where

Version 1 keeps notes, bookmarks, to-dos and the sidebar preference **only in this browser**
(`localStorage`). There is no server copy, no sync between devices, and no backup. The UI says
so on the overview and in the sidebar.

**Keys:**

```text
rudyppui:workspace:v1:<namespace>:notes          { schemaVersion: 1, items: Note[] }
rudyppui:workspace:v1:<namespace>:notes-draft    the note being edited (until saved/discarded)
rudyppui:workspace:v1:<namespace>:bookmarks      { schemaVersion: 1, items: Bookmark[] }
rudyppui:workspace:v1:<namespace>:tasks          { schemaVersion: 1, items: Task[] }
rudyppui:workspace:v1:<namespace>:sidebar        { collapsed: boolean }
```

- **Namespace:** `id-<user id>`, where the id is the JWT `jti` claim (the database user id).
  If a token ever lacks it, the namespace falls back to `user-<user name>`. Both parts are
  URL-encoded. No token, password or session is ever stored in these keys.
- **Isolation:** the namespace keeps one account's records out of another account's screens.
  Switching account remounts the whole workspace (`key` = namespace), so nothing from the
  previous account stays in memory. This is not privacy: anyone using the same browser profile
  can read `localStorage`.
- **Logout** clears memory and the open editors. The records stay in this browser for the next
  login.
- **IDs** come from `crypto.randomUUID()`, or `getRandomValues` on plain-HTTP pages where
  `randomUUID` isn't available.
- **Failures:**
  - Storage unavailable or full: the operation returns a reason. Forms keep their input and
    show it, and nothing claims "saved".
  - Unreadable or invalid data (bad JSON, wrong `schemaVersion`, a record that fails its check,
    including a bookmark whose URL isn't http(s)): marked *corrupt*. It is never overwritten
    silently. The page offers "Reset this section", which deletes it only after confirmation.
- **Other tabs (version 1 rule):**
  - Every write re-reads the stored list first and changes one record, so edits made in another
    tab to *other* records are kept.
  - The `storage` event refreshes open lists ("Updated from another tab").
  - If the record being edited changed or was deleted in another tab, the editor says so. Saving
    then replaces that version (last save wins); typed text is never discarded silently.
- **Unsaved note edits:** declarative React Router can't block in-app navigation, so the note
  editor saves a draft on every change and offers it back next time. Cancel/Esc with changes
  asks for confirmation.

## Moving to a server later

Components only use the `Repository` contract through `useCollection`. To sync across devices:

1. Add backend endpoints for the module, as their own task.
2. Write an HTTP repository (`createHttpNotesRepository`) with the same methods, using
   `lib/http.ts`. Map HTTP errors to `WorkspaceStorageError` reasons, and drop `resetStorage`.
3. Swap it in the module's `useNotes()` hook. Lists, forms and the overview stay unchanged.
4. Migration: on first login after the switch, read the local key for that namespace and offer
   to upload it. The stable ids and ISO times can be kept. Then delete the local key.
5. TanStack Query (agreed tool) can replace `useCollection` at that point.

## Adding a module (e.g. the knowledge base)

1. **Feature:** create `src/features/knowledge/knowledge.ts` with the record type, limits,
   validation, a record check, and `createLocalKnowledgeRepository(namespace)` built on
   `createLocalCollection(namespace, 'knowledge', isEntry)`. Add a `useKnowledge()` hook that
   calls `useCollection`.
2. **Page:** create `src/pages/dashboard/knowledge/KnowledgePage.tsx` using `WorkspacePage`,
   `StorageProblem`, `StatusMessage`, `ConfirmDialog` and `tool.module.css`.
3. **Module list:** in `modules.ts`, change `knowledge` from `status: 'planned'` to
   `status: 'active'` with `path: '/dashboard/knowledge'`, a `group` and a `tint`.
4. **Route:** in `router.tsx`, add `<Route path="knowledge" element={<KnowledgePage />} />`
   inside the `dashboard` route.
5. **Text:** add every string to `src/i18n/locales/en.ts` and `zh.ts` (the type check fails if
   one is missing). This includes `workspace.modules.knowledge` and a `knowledge` namespace for
   the page.
6. **Overview (optional):** in `pages/dashboard/DashboardPage.tsx`, add a `ModuleCard` with a
   stat computed from `useKnowledge()`, and/or a "recent" panel.
7. **Deep links:** add `/dashboard/knowledge` to `UiRouteController` and
   `SecurityConstants.STATIC_WHITELIST`, and to the route list in `UiAccessTest`.
8. **Check:**
   - `npm run typecheck`, `lint`, `format:check` and `build`, then `./mvnw test`.
   - In a browser: create, edit and delete; refresh the deep link on the jar; test in Chinese
     and English at 360px; use the keyboard only; check storage-full and corrupt data.

Do not add a generic "everything" repository, a runtime plugin system or data-driven menus. Each
module keeps its own rules, and the module list stays a short, typed array.
