# Copilot Instructions – englishWeb Frontend

## Mission Context
- Student-facing Vite + React SPA using Tailwind v4, TanStack Query, i18n, and custom Axios client.
- Interacts with NestJS API (`english-learning/apps/client-api`) via REST + Socket.IO.

## Core Workflows
- Required env: create `.env` with `VITE_API_URL=http://localhost:3000/api` (or match backend port).
- Install & run: `npm install`, `npm run dev` (default port 5173).
- Quality gates: `npm run lint`, `npm run build`, `npm run preview` before shipping.
- i18n resources in `src/locales/`; load via `src/i18n.ts`.

## Architecture Patterns
- Entry files: `src/main.tsx` (bootstrap), `src/App.tsx` (providers/layout).
- Routing lives in `src/routes/` (React Router `createBrowserRouter`).
- API modules grouped by domain under `src/services/` (e.g., `podcast`, `classroom`). Use Axios instance from `src/lib/api.ts`.
- Global state via Context + hooks in `src/context/` and `src/hooks/` (TanStack Query for data fetching).
- UI components in `src/components/` organized by feature (e.g., `learn/`, `podcast-comment/`). Tailwind classes colocated with components.

## Auth & Networking
- `src/lib/api.ts` configures Axios with `withCredentials` and interceptors:
  - Attaches cookies, logs 401 (non-`/auth/*`) then redirects to `/login?next=currentPath`.
  - Maintain this flow when modifying auth; share token/session logic with backend.
- Socket.IO clients (where present) use `userId` query to join `user:{id}` rooms; keep in sync with backend gateway.

## Data Fetching
- Prefer TanStack Query hooks (`useQuery`, `useMutation`) defined per domain. Invalidate caches using exported query keys to refresh lists after mutations.
- When API contracts change, update corresponding types in `src/types/` or `src/services/*/types.ts`.

## Styling & UX
- Tailwind v4 + CSS Modules: global resets in `src/index.css`, component styles inline via utility classes.
- Reusable UI patterns (buttons, modals) in `src/components/ui/`; follow existing props/
 patterns to ensure consistent theming.

## Testing & Validation
- No full test suite; if adding tests use Vitest + Testing Library. Co-locate as `*.test.tsx`.
- Run `npm run lint` to respect ESLint config (`eslint.config.js`) and TypeScript rules.

## Productivity Tips
- Check `AGENTS.md` for pending TODOs (e.g., `CreatePodcastPageBeautiful` polling, podcast comment toasts, `ClassroomDetail` submissions).
- Use Axios error shapes from backend `ResponseMessage` envelope; unwrap `data.data` accordingly.
- When integrating new endpoints ensure RBAC/guards match backend expectations (check swagger docs at `/api/docs`).
