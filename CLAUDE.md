# MERN TypeScript Template with Auth0

## Commands

### Root scripts (run from project root)

| Command | Description |
|---------|-------------|
| `npm run boot` | First-time setup: prompts for Docker names/ports, copies .env files, installs deps |
| `npm run dev` | Start dev environment with `docker compose watch` (live sync) |
| `npm run dev:detached` | Start dev environment in background |
| `npm run stop` | Stop all containers |
| `npm run logs` | Tail logs from all containers |
| `npm run reset` | Stop containers and delete all volumes |
| `npm run build` | Build Server and Client in parallel |
| `npm run install:all` | Install deps in Server/ and Client/ |
| `npm run test` | Run Vitest in Server and Client |
| `npm run lint` | Run ESLint in Server and Client |
| `npm run docker:ps` | Show running container status |
| `npm run docker:stats` | Show container CPU/memory usage |
| `npm run docker:rebuild` | Clean rebuild: stop, remove volumes, rebuild, start |
| `npm run docker:shell:server` | Open shell in server container |
| `npm run docker:shell:client` | Open shell in client container |
| `npm run docker:logs:server` | Tail server logs only |
| `npm run docker:logs:client` | Tail client logs only |

### Server scripts (run from `Server/`)
- `npm run dev` — `tsx --watch src/server.ts`
- `npm run build` — `tsc -b && tsc-alias`
- `npm start` — `node dist/server.js`
- `npm run test` — `vitest run`
- `npm run test:watch` — `vitest`
- `npm run lint` — `eslint .`

### Client scripts (run from `Client/`)
- `npm run dev` — `vite`
- `npm run build` — `tsc -b && vite build`
- `npm run preview` — `vite preview`
- `npm run lint` — `eslint .`
- `npm run test` — `vitest run`
- `npm run test:watch` — `vitest`

---

## Architecture

### Server (Express 5 + TypeScript)

**Entry point:** `Server/src/server.ts`

**Middleware order:** cors → rateLimit (10,000 req/15min) → morgan → connectDB → json → urlencoded → routes → errorHandler

**Routes:**
- `GET /health` — health check (no auth)
- `POST /api/users` — create user (no auth)
- `GET /api/users` — list users (no auth)
- `GET /api/users/:id` — get user by MongoDB ID (no auth)
- `PATCH /api/users/:id` — update user (no auth)
- `DELETE /api/users/:id` — delete user (no auth)
- `GET /api/auth/me` — get current user by Auth0 sub (auth required)
- `GET /api/auth/validate` — validate JWT token (auth required)
- `GET /danger/db-health` — database connection status (dev only)

**Server source layout:**
```
Server/src/
├── server.ts               # Express app, middleware chain, route registration
├── config/
│   └── db.ts               # mongoose.connect() + error handling
├── controllers/
│   ├── usersControllers.ts # Class: createUser, getUsers, getUserById, updateUser, deleteUser
│   └── authControllers.ts  # Class: getCurrentUser, validateToken
├── middleware/
│   └── auth0Mdw.ts         # Wraps checkJwt for Express 5 compatibility
├── models/
│   └── userModel.ts        # Mongoose User schema + static findByAuth0Id()
├── routes/
│   ├── userRoutes.ts       # /api/users — instantiates UsersController
│   ├── authRoutes.ts       # /api/auth — instantiates AuthController
│   └── dangerRoutes.ts     # /danger — dev-only debugging endpoints
├── types/
│   ├── index.ts            # Re-exports usersTypes + expressTypes
│   ├── usersTypes.ts       # IUser (plain), IUserDoc (Mongoose), IUserModel (static methods)
│   └── expressTypes.ts     # Express module augmentations (reserved for future use)
├── utils/
│   ├── errorHandler.ts     # AppError class, asyncHandler, global error middleware
│   └── auth0.ts            # checkJwt from express-oauth2-jwt-bearer
└── zod/
    └── usersZod.ts         # createUserSchema, updateUserSchema
```

**Controllers pattern** (class-based):
```typescript
class UsersController {
  async createUser(req: Request, res: Response) { /* Zod validate → save → respond */ }
  // ...
}
// In route file:
const controller = new UsersController();
router.post("/", asyncHandler(controller.createUser.bind(controller)));
```

**Auth:** `express-oauth2-jwt-bearer` validates Auth0 JWTs. Middleware in `Server/src/middleware/auth0Mdw.ts`. Token payload available on `req.auth.payload`. The Auth0 sub (`req.auth.payload.sub`) identifies the user.

**Error handling:** `AppError(message, statusCode, errors?)` for controlled errors. `asyncHandler(fn)` wraps every async route — no try/catch needed in controllers. Global error middleware in `errorHandler.ts` auto-transforms: Mongoose duplicate key (E11000) → 409, Mongoose ValidationError → 400, Mongoose CastError → 404, Zod errors → 400 with field-level messages. Stack traces only included in `NODE_ENV=development`.

**User model** (`Server/src/models/userModel.ts`):
- Fields: `firstName`, `lastName`, `phone?`, `profilePicture?`, `auth0Id` (unique), `email` (unique), `role` (enum: `admin` | `user`, default `user`), timestamps
- Static method: `UserModel.findByAuth0Id(auth0Id: string)`

**Type conventions:**
- `IUser` — plain object interface (no Mongoose methods)
- `IUserDoc` — extends `IUser & Document` (Mongoose document)
- `IUserModel` — extends `Model<IUserDoc>` with static methods

**Validation (Zod):**
- `createUserSchema`: `firstName`, `lastName`, `email`, `auth0Id` required; `phone`, `profilePicture` optional
- `updateUserSchema`: all fields optional (partial)
- Errors thrown as `AppError(400)` with array of `{ field, message }` objects

**Path aliases:** `@/*` → `src/*` (TypeScript: `tsconfig.json`; resolved at build time by `tsc-alias`)

---

### Client (React 19 + Vite + TypeScript)

**Entry point:** `Client/src/main.tsx`

**Provider stack (outer → inner):**
Redux Provider → Auth0Provider → QueryClientProvider → AppInitializer → RouterProvider

React Query DevTools rendered in dev mode. Toast notifications via `react-hot-toast`.

**Auth flow** (`Client/src/components/AppInitializer.tsx`):
1. Auth0 loads → `getAccessTokenSilently()` fetches JWT
2. Sets `Authorization: Bearer {token}` on axios defaults globally
3. Dispatches `fetchUser` Redux thunk → `GET /api/auth/me`
4. If 404 → auto-creates user via `POST /api/users` → re-fetches
5. Shows loading spinner during initialization; error state with retry on failure

**Client source layout:**
```
Client/src/
├── main.tsx                    # Provider stack, router, toaster
├── routes.tsx                  # Converts routesConfig to RouterProvider
├── index.css                   # Tailwind CSS v4 directives + CSS custom properties
├── config/
│   └── routesConfig.tsx        # All route definitions (path, component, icon, auth, role)
├── components/
│   ├── AppInitializer.tsx      # Auth → token → axios → fetchUser
│   ├── ProtectedRoute.tsx      # Checks isAuthenticated + role
│   ├── Atoms/                  # Badge, Card, Heading, Icon, Link, LoadingSpinner, Text
│   ├── Molecules/              # BenefitItem, FeatureCard, Hero, MenuItem, Section, TechBadge
│   ├── Organisms/              # Footer, Sidebar
│   └── ui/                     # shadcn/ui: avatar, badge, button, checkbox, dropdown-menu, input, table
├── pages/
│   ├── Layout.tsx              # Root layout: Sidebar + main content + Footer
│   ├── HomePage.tsx            # Landing: features, tech stack, benefits, CTA
│   ├── ProfilePage.tsx
│   ├── ProfileSettingsPage.tsx
│   ├── ProfilePreferencesPage.tsx
│   ├── DashboardPage.tsx
│   ├── DashboardAnalyticsPage.tsx
│   ├── DashboardReportsPage.tsx
│   ├── GeneralSettingsPage.tsx
│   ├── SecuritySettingsPage.tsx
│   └── NotificationsSettingsPage.tsx
├── redux/
│   ├── store.ts                # Redux store config
│   ├── hooks.ts                # useAppDispatch, useAppSelector
│   └── slices/
│       └── userSlice.ts        # user state + fetchUser thunk (auto-register on 404)
├── services/
│   ├── api.ts                  # Shared axios instance (proxy-aware base URL)
│   ├── users.ts                # getUsers, getCurrentUser, createUser
│   └── auth.ts                 # validateToken
├── types/
│   ├── index.ts                # Re-exports
│   ├── usersTypes.ts           # IUser interface (mirrors server type)
│   └── auth0Types.ts           # Auth0User, Auth0Payload
├── lib/
│   └── utils.ts                # cn() = clsx + tailwind-merge
└── test/
    └── setup.ts                # @testing-library/jest-dom/vitest setup
```

**Routing** (`routesConfig.tsx`):
- Each route object: `{ path, name, Component, icon?, showInSidebar?, requireAuth?, requiredRole? }`
- `convertToRouterRoutes()` — transforms config to React Router v7 route objects, wraps in `<ProtectedRoute>` when `requireAuth: true`
- `getSidebarMenuItems()` — filters routes with `showInSidebar: true`, respects auth/role state

**API layer:**
- Shared axios instance in `services/api.ts`
- Dev: relative URLs, Vite proxy routes `/api`, `/danger`, `/health` → `VITE_PROXY_TARGET` (default `http://localhost:3000`)
- Docker dev: proxy target is `http://server:3000` (Docker DNS)
- Production: `VITE_API_URL` environment variable

**State management:**
- Redux Toolkit for global app state (currently: user slice)
- TanStack Query v5 for server data caching (available for feature data, not used for user auth state)

**Component conventions:**
- Atoms/Molecules/Organisms accept `className?: string`; always merge with `cn()`
- Variants use `class-variance-authority` (CVA) — see `ui/button-variants.ts`
- Icons from `lucide-react` only
- Animations via `framer-motion`
- shadcn/ui components in `ui/` (Radix-based, new-york style, neutral palette)

**Styling:**
- Tailwind CSS v4 (no config file — CSS-first config via `index.css`)
- `cn(clsx(...), tailwind-merge(...))` for all conditional class merging
- CSS custom properties for theme tokens

**Path aliases:** `@/*` → `./src/*` (via `vite.config.ts` + `tsconfig.app.json`)

---

## Docker

Root `docker-compose.yml` uses `include:` to merge `Server/compose.yml` and `Client/compose.yml`.

**Both services use `docker compose watch`:**
- `sync` — instant file sync for `src/` changes (no rebuild)
- `rebuild` — full rebuild on `package.json` / `package-lock.json` changes

**Named volumes** for `node_modules` (not bind-mounted from host). **Shared** `mern-network` bridge network. Client Vite dev server proxies API calls to server via Docker DNS.

**Dockerfiles** are multi-stage:
- `development` stage: `tsx --watch` (Server) / `vite` (Client) with live reload
- `build` stage: `tsc + tsc-alias` (Server) / `tsc + vite build` (Client)
- `production` stage: `node dist/server.js` (Server, non-root user `nodejs:1001`) / NGINX alpine (Client)

**NGINX** (`Client/nginx.conf`):
- SPA routing: all paths → `index.html`
- Gzip compression enabled
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`
- Static asset caching: 1 year + `immutable` for `.js`, `.css`, images
- `/health` endpoint returns 200

**MongoDB is external** (Atlas or any remote) — not in Docker.

`npm run boot` customizes container names, image names, ports, and network name.

---

## Environment Variables

### `Server/.env`
```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
CLIENT_URL=http://localhost:5173
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
```

### `Client/.env`
```
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_PROXY_TARGET=http://localhost:3000   # optional; defaults to http://localhost:3000 in dev
VITE_API_URL=http://localhost:3000        # used in production builds
```

### MCP / Claude Code shell environment
These must be in your **shell profile** (`~/.bashrc`, `~/.zshrc`), not `.env` files — Claude Code reads them from the OS environment:
- `MONGO_URI` — same value as `Server/.env`
- `GITHUB_TOKEN` — GitHub Personal Access Token with `repo` scope

---

## Testing

- **Framework:** Vitest in both Server and Client
- **Server:** `Server/vitest.config.ts` — node environment, `@/` alias, pattern `src/**/*.test.ts`
- **Client:** `Client/vitest.config.ts` — jsdom environment, React Testing Library, pattern `src/**/*.test.{ts,tsx}`
- **Client test setup:** `Client/src/test/setup.ts` imports `@testing-library/jest-dom/vitest`
- Tests auto-run via Claude Code hook when editing `*.test.*` files

---

## MCP Servers

Configured in `.mcp.json` at project root. Available automatically in Claude Code.

| Server | Package | Purpose |
|--------|---------|---------|
| `playwright` | `@playwright/mcp` | Browser automation and UI testing |
| `context7` | `@upstash/context7-mcp` | Fetches up-to-date library docs by version |
| `mongodb` | `mongodb-mcp-server` | Direct MongoDB queries, schema inspection, aggregations |
| `github` | `@modelcontextprotocol/server-github` | Repo management, PRs, issues, code search |
| `auth0` | `@auth0/auth0-mcp-server` | Auth0 tenant management, users, apps, logs |
| `eslint` | `@eslint/mcp` | Lint JS/TS through Claude Code |

---

## Claude Code Hooks

Configured in `.claude/settings.json`. Run automatically after every `Write` or `Edit` tool use.

| Trigger | Script | What runs |
|---------|--------|-----------|
| Any `Write`/`Edit` | `scripts/hooks/lint.js` | ESLint on the changed file (auto-detects Client/ vs Server/) |
| `Write`/`Edit` on `*.test.*` | `scripts/hooks/test.js` | Vitest in the relevant workspace |

---

## Claude Code Agents

Autonomous agents in `.claude/agents/`. Unlike slash commands (interactive), agents work across multiple tools and MCP servers autonomously.

| Agent | File | Purpose | MCP Servers |
|-------|------|---------|-------------|
| Backend Engineer | `backend-engineer.md` | Implement, debug, refactor server code | mongodb, context7, eslint |
| Frontend Engineer | `frontend-engineer.md` | Implement, debug, refactor client code | playwright, context7, eslint |
| Feature Architect | `feature-architect.md` | Design full-stack plans (no code) | context7, mongodb, auth0 |
| E2E Test Writer | `e2e-test-writer.md` | Create & validate Playwright tests | playwright |
| PR Review | `pr-review.md` | Review PRs, post structured feedback | github, eslint |
| Issue to Code | `issue-to-code.md` | GitHub issue → implementation → PR | github, context7, eslint |
| DB Migration | `db-migrate.md` | Compare models vs live DB, migrate | mongodb |
| Auth0 Setup | `auth0-setup.md` | Configure Auth0 tenant (apps, APIs, roles) | auth0 |
| API Health Audit | `api-health-audit.md` | Audit API, DB, auth config consistency | mongodb, auth0 |

---

## Adding New Features

### New API endpoint
1. Add Zod schema to `Server/src/zod/` (create + update variants)
2. Create controller class in `Server/src/controllers/`
3. Add types to `Server/src/types/` (`IFeature`, `IFeatureDoc`, `IFeatureModel`)
4. Create route file in `Server/src/routes/` (instantiate controller, bind methods, wrap with `asyncHandler`, add `auth0Middleware` if protected)
5. Register in `Server/src/server.ts`: `app.use("/api/feature", featureRoutes)`

### New Mongoose model
1. Create `Server/src/models/featureModel.ts` with schema + static methods
2. Add types in `Server/src/types/featureTypes.ts` (IFeature / IFeatureDoc / IFeatureModel)
3. Export from `Server/src/types/index.ts`

### New frontend page
1. Create page component in `Client/src/pages/`
2. Add route entry to `routeConfig` array in `Client/src/config/routesConfig.tsx` (set `requireAuth`, `requiredRole`, `showInSidebar` as needed)
3. Add API service in `Client/src/services/` if the page needs data

### New UI component
- **Atom** (single element): `Client/src/components/Atoms/ComponentName/ComponentName.tsx` + export from `Atoms/index.ts`
- **Molecule** (composed from Atoms): `Client/src/components/Molecules/ComponentName/`
- **Organism** (complex, may have state): `Client/src/components/Organisms/ComponentName/`
- All components: accept `className?: string`, use `cn()` for class merging

### New API service with TanStack Query
1. Add service function in `Client/src/services/featureName.ts` (uses shared axios instance)
2. Create React Query hooks using `useQuery` / `useMutation` from `@tanstack/react-query`

### Auth-protected endpoint (server)
```typescript
router.get("/protected", auth0Middleware, asyncHandler(controller.method.bind(controller)));
// Access token payload: req.auth.payload.sub
```

### Role-based route (client)
```typescript
// In routesConfig.tsx:
{ path: "/admin", name: "Admin", Component: AdminPage, requireAuth: true, requiredRole: "admin" }
// ProtectedRoute checks useAppSelector for user.role
```

---

## Key Conventions

### Backend
- **Controllers**: class-based, async methods, no try/catch (use `asyncHandler`), throw `AppError` for business errors
- **Routes**: instantiate controller in route file, always `.bind(controller)` when passing methods
- **Imports**: always use `@/` path aliases (e.g., `import { AppError } from "@/utils/errorHandler"`)
- **Types**: three-level type system — plain interface → Document interface → Model interface
- **Validation**: Zod at controller entry, errors surface as `AppError(400)` with field detail

### Frontend
- **No try/catch** in components — handle errors in Redux thunks or React Query hooks
- **Imports**: always use `@/` path aliases
- **Icons**: `lucide-react` only
- **Styling**: Tailwind classes via `cn()`, never raw class string concatenation
- **State**: Redux for auth/user global state; TanStack Query for feature/server data
- **No inline styles** — Tailwind only
