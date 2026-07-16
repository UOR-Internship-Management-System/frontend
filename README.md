# CV Management Frontend

React, TypeScript, and Vite frontend for the CV Management and Deterministic Internship Candidate Filtering System.

## Sprint 4 Status

The frontend implements the approved Student workflows delivered through Sprint 4: authentication and onboarding, Dashboard metrics, Student-owned Profile editing, declared-skill management from the developer-managed taxonomy, and Student-owned project portfolio management.

Sprint 4 uses the OpenAPI v1.3.0 contract for strict request/response validation, pagination, optimistic concurrency, safe errors, and Dashboard metric refresh after successful mutations. Features assigned to later sprints remain unregistered.

### Active protected Student routes

- `/student/dashboard`
- `/student/profile`
- `/student/skills`
- `/student/projects`

## Setup

```bash
npm ci
npm run dev
```

Environment variables are documented in `.env.example`.

The application calls `VITE_API_BASE_URL` (default `/api/v1`) by default. For local demonstrations while corresponding backend endpoints are pending, set `VITE_ENABLE_API_MOCKS=true` in a non-production environment to enable the deterministic MSW handlers. Production mode never starts the mock worker.

## Quality Commands

```bash
npm run validate-env
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run openapi:check
npm run verify:scope
npm run e2e
```

## Architecture

The app uses `src/app` for bootstrap, providers, routing, layouts, and runtime config; `src/shared` for reusable UI, API, security, validation, and pagination infrastructure; and `src/features` for approved feature/domain modules.

Sprint 4 acceptance evidence is recorded in `docs/implementation/sprint-4-frontend-completion-notes.md`.
