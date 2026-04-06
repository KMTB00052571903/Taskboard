# Task Board — Real-time Collaborative Task Board

## Stack

- **Client**: Preact + Vite + Tailwind CSS v4 + Axios
- **Server**: Express v5 + TypeScript + PGlite (in-memory PostgreSQL) + Supabase Realtime + JWT Auth (bcryptjs)
- **Monorepo**: root `package.json` with `concurrently`

## Commands

```bash
npm run dev          # runs server (port 3000) + client (port 3001) in parallel
npm run test         # runs vitest + supertest tests in server/
npm run install:all  # installs deps for server and client
```

## Environment Variables

### Server (`server/.env`)
```
PORT=3000
JWT_SECRET=dev_secret
SUPABASE_URL=
SUPABASE_KEY=
```

### Client (`client/.env`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
```

## Architecture

### Server

```
server/src/
  start.ts                          # entry point: initDb() + app.listen()
  app.ts                            # Express app, routes, middleware
  config/
    index.ts                        # env vars: PORT, JWT_SECRET, SUPABASE_URL, SUPABASE_KEY
    database.ts                     # PGlite instance (memory:// for tests, file-based for dev)
    supabase.ts                     # Supabase client (server-side)
    initDb.ts                       # DROP/CREATE tables + seed 3 users (alice, bob, charlie) + sample board/tasks
  middlewares/
    authMiddleware.ts               # JWT verification, sets req.user with { id, email, user_name }
    errorsMiddleware.ts             # @hapi/boom error handling
  features/
    auth/
      auth.router.ts               # POST /api/auth/login (login only, no register)
      auth.controller.ts
      auth.service.ts               # bcrypt compare + jwt.sign({ id, email, user_name })
      auth.types.ts                 # User, UserWithPassword, UserWithToken, AuthenticateUserDTO
    boards/
      board.router.ts              # GET /api/boards, POST /api/boards, GET /api/boards/:id
                                   # POST /api/boards/:boardId/tasks, DELETE /api/boards/:boardId/tasks/:taskId
                                   # PATCH /api/boards/:boardId/tasks/:taskId
      board.controller.ts          # validates input, delegates to service, uses `req.params as string`
      board.service.ts             # CRUD boards/tasks + broadcast helpers (fire-and-forget)
      board.types.ts               # Board, BoardWithCreator, Task, TaskWithCreator, BoardWithTasks
  tests/
    requirements.test.ts           # 3 tests: task-created, task-deleted, task-updated broadcasts
```

**Pattern**: each feature has router → controller → service → types. Controllers validate input, services hold business logic and SQL queries.

**Database**: PGlite. `memory://` in tests, file-based (`server/db/`) in dev. Tables: `users`, `boards`, `tasks`. All IDs are `gen_random_uuid()::TEXT`. `initDb()` drops and recreates tables on every server start.

**Auth**: Login only (no register). 3 pre-seeded users:
- alice@email.com / 123456
- bob@email.com / 123456
- charlie@email.com / 123456

JWT contains `{ id, email, user_name }`. Token sent as `Bearer <token>` in Authorization header.

**Supabase Realtime (server → client, fire-and-forget)**:
- Channel `board:{boardId}`: events `task-created`, `task-deleted`, `task-updated`
- Broadcast pattern: `supabase.channel(name)` → `channel.httpSend(event, payload)` → `supabase.removeChannel(channel)`
- Broadcasts are NOT awaited at the call site (fire-and-forget)

**SQL**: uses `json_build_object` for JOINs returning nested `created_by` objects. Always uses `WITH inserted/updated AS (... RETURNING ...) SELECT ... JOIN users` pattern.

### Client

```
client/src/
  main.tsx                         # render
  app.tsx                          # UserProvider > AxiosProvider > ToastProvider > AppRoutes
                                   # AppRoutes: no user → LoginPage, selected board → BoardProvider > BoardDetailPage, else → BoardsPage
  types.ts                         # User, UserWithToken, Creator, Board, Task, BoardWithTasks
  hooks/
    useSupabase.tsx                # singleton Supabase client (client-side)
  utils/
    storage.ts                    # sessionStorage helpers with key 'task-board-user'
  providers/
    UserProvider.tsx               # auth state (login/logout), reads/writes sessionStorage
    AxiosProvider.tsx              # axios instance, auto Bearer token via request interceptor, error interceptor extracts message
    ToastProvider.tsx              # toast notifications with auto-dismiss
    BoardProvider.tsx              # board state: fetch board, subscribe to task-created/task-deleted/task-updated, CRUD tasks
  pages/
    LoginPage.tsx                  # login form (email + password)
    BoardsPage.tsx                 # board list + create board form, subscribe to board-created broadcast
    BoardDetailPage.tsx            # board detail with task columns (TODO/IN_PROGRESS/COMPLETED), drag-like status update
```

**Navigation**: uses `useState<string | null>` for `selectedBoardId` (no react-router-dom). When `selectedBoardId` is set, renders `BoardProvider` wrapping `BoardDetailPage`.

**Provider pattern**: each provider encapsulates state + fetch + Supabase subscription. Pages consume hooks (`useBoard`) and render JSX.

**Client dedup**: uses `setState(prev => prev.some(...)` to avoid duplicates from broadcast + API response.

**Supabase subscriptions (client-side)**:
- `BoardProvider`: subscribes to `board:{boardId}` for `task-created`, `task-deleted`, `task-updated`
- `BoardsPage`: subscribes to `boards` for `board-created`

## Conventions

- Use `export const X = () =>` for all components, providers, and hooks
- One component per file
- Preact: use `preact/hooks`, `preact/compat` for React-compatible libraries
- CSS: Tailwind CSS v4 with CSS variables for design tokens (accent: indigo #6366f1)
- HTTP errors: `@hapi/boom` on the server
- SQL: `json_build_object` for JOINs, `gen_random_uuid()::TEXT` for IDs
- `req.params` values cast with `as string` (Express 5 types them as `string | string[]`)

## Tests

Tests use Vitest + Supertest. Supabase is mocked with a factory pattern inside `vi.mock`:

```typescript
vi.mock('../config/supabase', () => {
  const mockHttpSend = vi.fn().mockResolvedValue(undefined);
  const mockChannel = vi.fn().mockReturnValue({ httpSend: mockHttpSend });
  const mockRemoveChannel = vi.fn();
  return {
    supabase: {
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
      __mockHttpSend: mockHttpSend,
      __mockChannel: mockChannel,
    },
  };
});
```

Access mocks after import via: `(supabase as any).__mockChannel`.

## Git Branches

- `develop`: full working solution (answer key) — all broadcasts + subscriptions
- `main`: stripped version (exam starting point) — broadcasts removed from services, subscriptions removed from providers
