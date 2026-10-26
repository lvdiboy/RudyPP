# Frontend learning log

One entry per milestone: what was built, the concepts it introduced, and where to see them in the
code.

## Milestone 1: scaffold and homepage (2026-10-26)

**Built**: the Vite + React + TypeScript project, ESLint and Prettier, the dev proxy to Spring
Boot, design tokens, a site layout and a responsive homepage.

### Concepts and where to find them

**Components are functions.** `SiteFooter` in `src/layouts/SiteFooter.tsx` is a function that
returns markup (TSX). React calls it and puts the result on the page. Compare it with a Thymeleaf
fragment, except that it is plain TypeScript.

**Props are the function's parameters.** `Card` (`src/components/ui/Card/Card.tsx`) declares its
props with a TypeScript type:

```tsx
type CardProps = { accent?: CardAccent; as?: 'div' | 'article' | 'li'; children: ReactNode };
```

The `?` marks a prop as optional, and default values sit in the destructuring
(`accent = 'highlight'`). `children` is whatever you nest between `<Card>` and `</Card>`.

**Lists render with `map` and need a `key`.** `HomePage.tsx` turns the `learningTopics` array
into cards with `learningTopics.map(...)`. The `key` lets React match items between renders,
much like an entity ID.

**CSS Modules scope class names.** `import styles from './Card.module.css'` gives an object.
`styles.card` becomes a unique class such as `_card_x7f2a`, so two files can both have `.card`
without colliding.

**Design tokens are CSS custom properties.** `src/styles/tokens.css` defines values such as
`--color-highlight` once, and every module reads them with `var(...)`. `Card.module.css` shows
the variant pattern: each accent class sets only `--card-accent`, and the base rule reads it.

**State drives the UI.** `TokenPlayground.tsx` keeps the selected accent in
`useState`. Choosing a radio calls `setAccentId`, React runs the function again, and the new
value flows into a CSS custom property through the `style` attribute. Nothing is changed in the
DOM by hand. The radio is *controlled*: its `checked` comes from state.

**Semantics and accessibility.** The page uses `header`, `nav`, `main`, `aside` and `footer`
landmarks and one `h1` with `h2` sections and `h3` items. Every section is linked to its heading
by `aria-labelledby`. The skip link moves focus to `<main>` (`tabIndex={-1}` makes that
possible). Radios sit in a `fieldset` with a `legend`. One global `:focus-visible` style shows
keyboard focus.

**Responsive without many breakpoints.** The topic grid uses
`repeat(auto-fit, minmax(min(100%, 13rem), 1fr))`, which picks the number of columns from the
available width. The hero switches to two columns at `52rem`. Font sizes use `clamp()`.

**Tooling roles.** TypeScript checks types, ESLint catches bug-prone code (including the Rules
of Hooks), and Prettier owns formatting. `eslint-config-prettier` stops the two from
disagreeing.

### Exercise

1. In `src/styles/tokens.css`, change `--color-highlight` to another light color, such as
   `#b8f0a0`. Run `npm run dev` and note every place that changes: the first topic card's band,
   the primary button, the hero note, the nav hover and the playground swatch. Why do they all
   change?
2. In `src/pages/dashboard/learning/learningContent.ts`, add a fourth entry to `learningTopics` with
   `accent: 'pink'`. Without touching `LearningPage.tsx`, a new card appears. Explain the path:
   array item → `map` → `<Card accent="pink">` → `styles.pink` → `--card-accent` → border color.
3. Try `accent: 'blue'`. TypeScript rejects it. Read the error and find where `CardAccent` is
   defined.

### Open questions to revisit

- When should a page-only component (like `TokenPlayground`) move into `components/ui`?
  Answer: when a second page needs it.

## Milestones 2–3: routing, JWT login, dashboard (2026-10-26)

**Built**:
- **Pages:** routing (React Router 8), a welcome page with a Log in panel top-right, a `/login`
  page, and a protected `/dashboard`. The dashboard has a user menu with Log out.
- **Shared pieces:** an HTTP layer and shared form components.
- **Backend:** a small controller so `/login` and `/dashboard` survive a page refresh.

### Concepts and where to find them

**Routes are components.** `src/app/router.tsx` nests `<Route>` elements. A route without a
`path` (`<Route element={<SiteLayout />}>`) is a *layout route*: it renders shared chrome and an
`<Outlet />` where the child page appears (`layouts/PageFrame.tsx`).

**Guards are just components that decide what to render.** `RequireAuth` renders `<Outlet />`
when there is a session, and `<Navigate to="/login" />` when there isn't. It is like a servlet
filter, but on the client and only for convenience; Spring Security is still the real gate.

**Context shares state without passing props down.** `AuthProvider` owns the session in
`useState`. Any component calls `useAuth()` to read it or to call `login`/`logout`. Compare it
with a Spring singleton bean that components "inject".

**Controlled forms.** `LoginForm` keeps each input's value in state, and `onChange` updates
it. On submit, `event.preventDefault()` stops the browser's page reload, then the form validates
and calls the API. Notice the states it handles: empty fields, wrong password, server unreachable,
and loading (the button shows a spinner and is disabled).

**Effects synchronize with the outside world.** `DashboardPage` fetches members in `useEffect`
and returns a cleanup that aborts the request if the page unmounts. `AuthProvider` uses another
effect to set a timer for the token's expiry.

**One transport layer.** `lib/http.ts` is the only place that calls `fetch`. It adds `/api`,
JSON headers and the token, and turns failures into `ApiError`. That one class understands both
the backend's JSON errors and its empty 401 bodies.

**Native elements first.** The login panel is a `<dialog>` opened with `showModal()`. The browser
supplies the focus trap, Esc to close and the inert background. The user menu is a simple
disclosure (`aria-expanded` + panel) with Esc and click-outside handling.

### Lessons from testing it in a real browser

- **React Router 8 runs navigations as low-priority transitions.** Navigating *after* clearing
  the session let the dashboard's guard redirect to `/login` first. The fix was to put the
  intent in state (`loggedOut`) and let the guard decide, instead of racing two updates.
- **A dialog's `close` event fires a moment after it closes.** Resetting the form there could
  lose a race with an instant reopen. Resetting on open with `flushSync` is deterministic.

### Exercise

1. Add an "About" page at `/about`. Add the route in `router.tsx` and a link in `SiteLayout`.
   Then refresh `/about` on the jar build (`http://localhost:9333/about`) and see the 401. Fix it
   in `UiRouteController` and `SecurityConstants`, and explain why the dev server never had this
   problem.
2. In `LoginForm`, show the backend's own message for a disabled account instead of the generic
   "don't match" text. Hint: look at `error.code` and `docs/api.md`.
