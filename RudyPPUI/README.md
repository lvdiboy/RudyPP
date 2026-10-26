# RudyPPUI

The React front end for RudyPP. It lives in the same Git repository as the Spring Boot backend.
Architecture notes are in [docs/frontend/architecture.md](../docs/frontend/architecture.md).

## Requirements

- Node.js `>=22.22.0`, as React Router 8 requires (developed with Node 24.19.0, npm 11.17.0)
- The backend running on port 9333, but only for pages that call the API. The current homepage
  makes no API calls.

## Commands

Run these from the `RudyPPUI/` folder.

| Command                | What it does                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| `npm ci`               | Install the exact versions from `package-lock.json`                |
| `npm run dev`          | Start the Vite dev server at http://localhost:5173                 |
| `npm run typecheck`    | Type-check the app and config with TypeScript (no output)          |
| `npm run lint`         | Run ESLint                                                         |
| `npm run format`       | Rewrite files with Prettier                                        |
| `npm run format:check` | Report files that Prettier would change                            |
| `npm run build`        | Type-check, then build production files into `dist/`               |
| `npm run preview`      | Serve `dist/` locally to inspect a build (not a production server) |

Use `npm install <package>` only when you add a dependency on purpose. It updates
`package-lock.json`, which must be committed with the change.

## Running with the backend

In VS Code's Run and Debug view:

- **RudyPPApplication** starts the Vite server first, then the backend. Open
  http://localhost:5173 yourself.
- **RudyPP Full Stack** does the same and also opens Chrome with the debugger attached.
- **RudyPPUI** starts the UI alone.

The Vite server keeps running in its own terminal after debugging stops. Close that terminal to
stop it.

Or start the two applications in separate terminals:

```text
Terminal 1 (repository root):  ./mvnw spring-boot:run      # needs local MySQL and Redis
Terminal 2 (RudyPPUI/):        npm run dev
```

Open http://localhost:5173. Vite serves the UI, and its proxy forwards every request that starts
with `/api` to `http://localhost:9333` **with the `/api` prefix kept**, because the backend serves
every REST endpoint under `/api`. For example, `fetch('/api/auth/login')` in the browser reaches
`http://localhost:9333/api/auth/login`.

Code should call relative `/api/...` URLs and never hard-code `http://localhost:9333`.

## Chinese and English

Every page supports Simplified Chinese and English; the 中文 / EN switch is in each header's
top-right corner. **Never hard-code user-visible text in a component**: add it to both
`src/i18n/locales/en.ts` and `zh.ts`, then read it with `const { t } = useI18n()`. A missing
Chinese entry fails the type check. The full rules are in
[docs/frontend/architecture.md](../docs/frontend/architecture.md#languages-chinese-and-english-rule-for-all-development-2026-10-26).

## Production build

You don't deploy this folder separately. Maven builds it (`./mvnw package` runs `npm ci`, lint and
build with its own downloaded Node) and copies `dist/` into the Spring Boot jar. On EC2 the jar
serves the UI at `/` and the APIs at `/api`. Details are in
[docs/frontend/architecture.md](../docs/frontend/architecture.md#production-integration-decided-2026-10-26).
