# Frontend architecture

RudyPPUI is a React + TypeScript single-page application in `RudyPPUI/`, alongside the Spring
Boot backend in the same repository. This document records the current state and the rules for
growing it. The full roadmap and tool decisions come from the frontend handoff.

## Stack (versions installed in milestone 1)

| Purpose               | Tool                                   | Version         |
| --------------------- | -------------------------------------- | --------------- |
| UI                    | React, React DOM                       | 19.3.1          |
| Language              | TypeScript (strict)                    | 6.0.3           |
| Dev server and build  | Vite, @vitejs/plugin-react             | 8.3.5, 6.1.2    |
| Lint                  | ESLint, typescript-eslint              | 10.13.0, 8.72.0 |
| Lint (React)          | eslint-plugin-react-hooks, -refresh    | 7.1.1, 0.5.7    |
| Format                | Prettier, eslint-config-prettier       | 3.9.10, 10.1.8  |
| Styling               | CSS Modules + CSS custom properties    | built into Vite |
| Runtime / packages    | Node.js, npm                           | 24.19.0, 11.17.0 |
| Routing (added with login) | React Router, declarative mode    | 8.5.0           |
| Icons (added with login)   | Lucide React                      | 1.61.0          |

React Router 8 requires Node `>=22.22.0`, which is now the `engines` value in `package.json`.

The current Vite template ships oxlint as its linter. It was replaced with ESLint because ESLint
is the agreed tool. Later tools (TanStack Query, React Hook Form, Zod, Vitest, and so on) are
added only when their milestone arrives. The login form is a plain controlled form on purpose.

Fonts: Bricolage Grotesque (headings) and Atkinson Hyperlegible Next (body) are loaded from
Google Fonts in `index.html`. System fonts are the fallback. Self-hosting them is an option for
the production-integration milestone.

## Source layout

```text
RudyPPUI/src/
├── app/
│   ├── App.tsx              BrowserRouter + ScrollManager + LanguageProvider + AuthProvider + routes
│   ├── ScrollManager.tsx    Top of page on navigation, or the #section the link names
│   └── router.tsx           URL map (keep in sync with the backend's UiRouteController)
├── layouts/
│   ├── PageFrame.tsx        Skip link, header (nav + top-right slot), <main>, footer
│   ├── SiteLayout.tsx       Not-found page: Log in button / user menu
│   ├── AuthLayout.tsx       /login: header with a way home, no login button
│   ├── AccountLayout.tsx    /account: account nav, user menu
│   └── DashboardLayout.tsx  /dashboard/*: workspace sidebar / drawer, top bar, module page
├── assets/coast.jpeg        Home page photo (imported, so the build hashes it)
├── pages/
│   ├── home/                HomePage + OceanHome (own header/footer)
│   ├── dashboard/           Workspace overview (/dashboard) and the workspace not-found page
│   ├── learning/            Front-end learning module (was the first dashboard): topics, sample
│   │                        journal, project, TokenPlayground; keeps its lab look
│   ├── notes/, bookmarks/, tasks/  Workspace tools (browser-local data)
│   ├── account/             User menu → Account: session details and members
│   ├── login/               Full-page login
│   └── not-found/
├── features/
│   ├── auth/                api.ts, session.ts (storage + JWT claims), AuthProvider, useAuth,
│   │                        RequireAuth, roles.ts, components/ (LoginForm, LoginPanel,
│   │                        UserMenu, AccountControl)
│   ├── users/               api.ts (GET /api/users), types.ts (UserSummary, Page<T>)
│   ├── workspace/           modules.ts, repository.ts, storage.ts, useCollection.ts, theme and
│   │                        shared workspace components (Sidebar, WorkspacePage, ModuleCard…)
│   └── notes/, bookmarks/, tasks/  Each: record type, limits, validation, local repository, hook
├── i18n/
│   ├── locales/en.ts        English text; defines the shape of every message
│   ├── locales/zh.ts        Chinese text; must match en.ts key for key (TypeScript enforces it)
│   ├── LanguageProvider.tsx Current language, <html lang>, saved choice
│   ├── useI18n.ts           const { t, locale } = useI18n()
│   └── errorMessage.ts      ApiError → message in the current language
├── components/
│   ├── SiteHeader.tsx, HeaderNav.tsx, SiteFooter.tsx
│   ├── LanguageToggle.tsx   中文 / EN switch, in every header's top-right corner
│   └── ui/                  Alert, Button (+ ButtonLink), Card, Checkbox, Spinner, TextField
├── lib/
│   ├── http.ts              fetch wrapper: /api base, JSON, token header, errors
│   └── api-error.ts         ApiError: JSON error bodies and empty security responses
├── styles/                  tokens.css, global.css
└── main.tsx
```

Folders are created when they get their first file. `e2e/` does not exist yet.

### Layer rules

1. **app**: wires providers and routing. No business logic.
2. **layouts**: shared screen frames.
3. **pages**: assemble one screen. Page-only components may live beside the page
   (`TokenPlayground`).
4. **features**: business behavior, API contracts and domain types (from milestone 3).
5. **components/ui**: props in, markup out. They know nothing about endpoints or tokens.
6. **lib**: transport and error mechanics (`http.ts`, `api-error.ts`), independent of React.
7. **styles**: the shared visual language. Components read tokens and never hard-code values.

Data flow once APIs are used: `Page → feature → features/x/api.ts → lib/http.ts → /api/...`.

## Languages: Chinese and English (rule for all development, 2026-10-26)

Every page is available in Simplified Chinese and English. The 中文 / EN switch sits in the
top-right corner of every header, and switching re-renders the visible page in place.

**Rules for every new or changed component:**

1. **No user-visible text in components.** This covers headings, body text, button and link
   text, `aria-label`, `alt`, `title`, placeholders, `<title>`, error and empty-state messages,
   and sample content. Add each string to `src/i18n/locales/en.ts` *and* `zh.ts`, then read it
   with `const { t } = useI18n()`.
2. **One key, both languages, same commit.** `zh.ts` is typed as `Messages` (the shape of
   `en.ts`), so a missing Chinese entry fails `npm run typecheck` and the Maven build.
3. **Values go through functions, not string concatenation**, because word order differs
   between the languages: `heading: (name: string) => \`${name} 的账户\``. Plurals are handled
   inside the English function.
4. **Dates and numbers** use `Intl` with the current `locale` from `useI18n()`, never a fixed
   locale.
5. **Errors**: show `errorMessage(error, t)`. The backend's messages are English only. Store
   the error (or a reason code) in state, not its text, so a language switch also translates
   messages already on screen.
6. **Data vs text**: lists keep their structure (ids, colors, dates) in code, with their text in
   the dictionaries under matching ids (see `pages/learning/homeContent.ts`).
7. **Left untranslated on purpose**: the product name RudyPP, code identifiers, and the language
   switch's own labels (each names the target language in that language).
8. **Default language**: the visitor's saved choice (`localStorage` key `rudypp.language`),
   otherwise Chinese for Chinese-language browsers, otherwise English.
9. **Layout**: check new pages at 360px in *both* languages. English strings are usually longer,
   and headers must still fit on one row. Chinese headings in the shared frame use no negative
   letter-spacing and prefer line breaks at punctuation (`PageFrame.module.css`).

No i18n library is used: the dictionaries plus React Context cover the current needs without a
new dependency. Revisit if the site needs more languages or ICU plural rules.

## Routes and authentication

| URL          | Layout          | Access                                                      |
| ------------ | --------------- | ----------------------------------------------------------- |
| `/`          | none (own frame) | Public ocean home page. Log in panel / user menu top-right |
| `/login`     | AuthLayout      | Public. Signed-in users are sent to `/dashboard`            |
| `/dashboard` | DashboardLayout | `RequireAuth`. Workspace overview, first page after login     |
| `/dashboard/learning` | DashboardLayout | Front-end learning module (old `/dashboard#topics…` links redirect here) |
| `/dashboard/notes`, `/bookmarks`, `/tasks` | DashboardLayout | Workspace tools, data in this browser only |
| `/dashboard/*` (unknown) | DashboardLayout | Workspace not-found page                                    |
| `/account`   | AccountLayout   | `RequireAuth`. Opened from the user menu: session, members  |
| anything else | SiteLayout     | Not-found page (client-side navigation only)                |

**Home page (`OceanHome`)**: delivered as a standalone component (ChatGPT design, 2026-10-26).
It has its own header, skip link, `<main>` and footer, so `/` is deliberately outside the shared
layouts.
- **Header**: an `headerActions` slot holds the shared `AccountControl`.
- **Styles**: the CSS module undoes the global heading font and line-height for this page only.
- **Photo, never cropped**: the hero takes the photo's own ratio (2448 × 1682) at full page width,
  so the whole photo shows. Above 1000px the copy sits over the sky on the left. At 1000px and
  below, the copy is stacked above the photo so it never covers the person, and below 680px the
  photo caption is hidden. The pointer parallax zooms in 1.2% only while it moves the photo; at
  rest the zoom is 1.
- **Chapter cards**: they open a dialog saying the module is planned. They are not links.

- **Log in**: `LoginForm` posts `{ username, password, rememberMe }` to `/api/auth/login` and
  reads the token from the `Authorization` response header. Used in two places: the header's
  `LoginPanel` (a native `<dialog>` anchored top-right) and the `/login` page.
- **Session**: only the token string is stored, under `rudypp.token`. "Keep me signed in" uses
  `localStorage` (7-day token), otherwise `sessionStorage` (until the browser closes). User name,
  roles and expiry are read from the JWT claims for display. The browser never trusts them for
  security; the backend checks every request.
- **Ending a session**:
  - **Log out** revokes the token (`POST /api/auth/logout`), then clears it. A signed-in page
    then sends the user to `/` (the home page).
  - **Expiry**: a timer ends the session at the token's `exp`.
  - **Revoked elsewhere**: a 401 from an authenticated call (for example after a login on
    another device) also ends it.

  Both expiry and revocation send the user to `/login`, with a note explaining why.
- **No profile endpoint**: the backend has none, so the user menu shows the user name and roles
  from the token, not the full name.
- **Adding a route**: add it to `router.tsx` *and* to the backend's `UiRouteController` and
  `SecurityConstants.STATIC_WHITELIST`. Otherwise refreshing that URL on the deployed site returns
  401.

## Personal workspace (/dashboard, 2026-10-26)

After login the user lands on a personal workspace: a sidebar (collapsible on desktop, a drawer on
phones), one top bar with the language switch and user menu, an overview, and one page per
module. The modules are front-end learning (the former dashboard), quick notes, bookmarks and
to-dos; a knowledge base and a photo album are shown as planned. The layout follows shadcn/ui
Dashboard-01 as a reference only (nothing installed), in the colors of the ocean home page,
scoped through `features/workspace/components/theme.module.css` so other pages are unaffected.

Notes, bookmarks and to-dos are stored **only in this browser** (`localStorage`, one namespace
per account). There is no server copy or cross-device sync yet. Storage keys, failure handling,
the multi-tab rule and how to add a module are in
[workspace-modules.md](./workspace-modules.md).

## Design system

- **Concept**: a lab notebook. Graph paper in the hero, indigo "ink" for text and borders,
  pastel accent fills (highlighter yellow, sticker pink, lab teal) with ink text on top.
- **Signature details**: 2px ink borders and a hard offset "sticker" shadow
  (`--shadow-sticker`). Use the shadow sparingly: buttons, the hero note and the playground
  preview.
- **Accents are fills, not text colors**. The pastels are too light for text. Use
  `--color-pink-strong` if accent-colored text is ever needed.
- **Radius follows hierarchy**: `--radius-sm` for controls, `--radius-md` for cards,
  `--radius-lg` for the large project panel.
- **Motion**: the hero note settling, the pinboard stickers bobbing, the login panel dropping in,
  and transitions in the playground. All of it sits behind `prefers-reduced-motion: no-preference`.
- **Focus**: one global `:focus-visible` outline (`--color-focus`).

## Content status

- Learning topics and the featured project (RudyPP itself) describe real work.
- Journal entries are **sample content**, labeled `Sample` in the UI. Their ids and dates are in
  `src/pages/learning/homeContent.ts` and their text in `learning.entries` of both dictionaries.
  No journal API exists.
- The home page's headline and introduction are draft design copy, not confirmed biography. The
  English version of that copy is a translation written during integration; review both. Its
  photo (`src/assets/coast.jpeg`, 1.4 MB, unedited) still carries its original EXIF metadata.
  Strip that, and consider a smaller export, before a public launch.
- No link points to an unbuilt page; there is no sign-up link until the sign-up page exists.
- The account page's member list is real data from `GET /api/users`.

## Development integration

```text
Browser http://localhost:5173
  ├── UI assets and navigation → Vite
  └── /api/** → Vite proxy → http://localhost:9333/api/**   (prefix preserved)
```

Configured in `RudyPPUI/vite.config.ts`. See `RudyPPUI/README.md` for commands.

## Production integration (decided 2026-10-26)

One Spring Boot jar serves both the UI and the APIs on port 9333:

```text
http://<host>:9333/                     React UI (static/index.html)
http://<host>:9333/assets/**            Hashed JS/CSS from the Vite build
http://<host>:9333/api/**               REST APIs (same URLs as before)
http://<host>:9333/api/actuator/health  Deploy health check (same URL as before)
```

- **Routing**: the servlet context path `/api` was removed. `WebConfig` adds the `/api` prefix to
  every `@RestController`, and `management.endpoints.web.base-path` keeps actuator at
  `/api/actuator`. Security whitelists use the full `/api/...` paths.
- **Static access**: `/`, `/index.html`, `/assets/**`, `/favicon.svg` and the client routes
  `/login` and `/dashboard` are public. Anything else outside the whitelist still needs a token.
  `UiAccessTest` covers this.
- **Build**: `frontend-maven-plugin` downloads Node `v24.19.0` (cached in `~/.m2`, unpacked to
  `target/node`), then runs `npm ci`, `npm run lint` and `npm run build` in `generate-resources`.
  `maven-resources-plugin` copies `RudyPPUI/dist` to `target/classes/static` in
  `process-resources`. Nothing generated is committed to `src/main/resources`.
- **Skip the UI build**: `-Dskip.installnodenpm -Dskip.npm`. Jenkins uses this in Test and
  Package to reuse the dist from Build, and Package then verifies the jar contains
  `static/index.html`.
- **Legacy pages removed**: `index.html`, `home.html`, `css/` and `js/` are gone. The login
  response's `redirect` is now `/`. React ignores it and goes to `/dashboard`.
- **CodeDeploy**: the UI ships inside `rudypp.jar`, so `appspec.yml` and the systemd service are
  unchanged. `deploy/validate.sh` checks the health endpoint and also that `/` and `/dashboard`
  return the React app shell, so a jar without the UI fails the deployment.
- **Jenkins jar check**: the Package stage verifies `index.html` and every asset it references are
  in the jar.
- **Line endings**: `.gitattributes` keeps front-end text files LF in every checkout (Prettier
  expects LF; this machine uses `core.autocrlf=true`) and marks images and fonts binary.
- **History fallback**: `UiRouteController` forwards the known client routes (`/login`, `/account`, the workspace routes `/dashboard/learning|notes|bookmarks|tasks`,
  `/dashboard`) to `index.html`, so opening or refreshing them works. Only listed routes are
  forwarded: `/api/**`, missing assets and unknown paths still get real 401/404 responses, never
  HTML. On the deployed site, an unknown URL therefore gives a 401, not the React not-found page.

## Backend facts verified for this milestone (2026-10-26)

Read from source. The backend was not started.

- Spring Boot 3.5.0, Java 25, port 9333. At the time, the servlet context path was `/api`. It has
  since been replaced by an `/api` controller prefix, with the same API URLs (see Production
  integration).
- `POST /api/auth/login` takes `{ username, password, rememberMe }` and returns the token in the
  `Authorization` header, already prefixed with `Bearer `. The body is `{ redirect }` pointing
  at the legacy `/api/home.html`; React should ignore it and navigate on its own.
- `POST /api/users/sign-up` takes `{ userName, fullName, password }` and returns an empty 200.
  New users get the USER and MANAGER roles.
- `GET /api/users?pageNum&pageSize` returns a Spring `Page<{ userName, fullName }>`, readable by
  USER, MANAGER and ADMIN. `PUT /api/users` and `DELETE /api/users?username=` are ADMIN only.
  Both return an empty 200.
- JWT claims: `sub` = username, `exp`, `rol` = comma-separated roles. Lifetime is 1 h, or 7 days
  with `rememberMe`.
- Public paths at the time: the GET static whitelist (legacy pages), GET `/actuator/health/**`,
  and POST `/auth/login` and `/users/sign-up`, all relative to `/api`.

## Open decisions

- **Audience of `/admin/users`** (before milestone 4/5): the list is readable by any signed-in
  role, but editing is ADMIN only.
- The root `.gitignore` ignores `.env.*`. When `RudyPPUI/.env.example` is introduced, add a
  `!RudyPPUI/.env.example` exception.

## Roadmap

| #   | Deliverable                                  | Status   |
| --- | -------------------------------------------- | -------- |
| 0   | Verify backend, document architecture        | Done     |
| 1   | Scaffold and responsive public homepage      | Done     |
| 2   | Shared UI and multiple routes (React Router) | Done     |
| 3   | Registration and login                       | Login done; registration next |
| 4   | Dashboard, user pagination, logout           | Workspace, account page and logout done; paginated user table pending |
| 5   | Admin editing/deletion                       |          |
| 6   | Journal/project browsing with sample content |          |
| 7   | Article reading (react-markdown)             |          |
| 8   | Learning dashboard and experiments           | Personal workspace v1 (2026-10-26): overview, notes, bookmarks, to-dos, browser-local |
| 9   | Theme switching and restrained motion        |          |
| 10  | Quality and production integration          | Packaging and deployment done early (2026-10-26); quality work pending |
