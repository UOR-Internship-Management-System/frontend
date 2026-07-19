# CV Management Frontend

React, TypeScript, and Vite frontend for the CV Management and Deterministic Internship Candidate Filtering System.

## Sprint 6 Status

The frontend implements the approved Student workflows delivered through Sprint 5 plus the Sprint 6 Admin workspace: live dashboard metrics, a server-driven registered-Student roster, academic-ledger CSV upload and processing, staged-row validation, transactional commit, and read-only official-record inspection.

Sprint 6 adopts OpenAPI v1.5.0. All Sprint 6 Admin data is contract parsed, query keys include server-affecting state, list controls persist in the URL, and session restoration preserves a known-valid identity during recoverable transport or service failures.

The clean release checks pass: 222 Vitest tests, production build, OpenAPI synchronization, removed-scope scanning, 40 discoverable Playwright scenarios, and the three critical Sprint 6 Chromium workflows. Backend conformance remains a release-environment check because browser automation uses deterministic contract mocks.

### Active protected Student routes

- `/student/dashboard`
- `/student/profile`
- `/student/skills`
- `/student/projects`
- `/student/cv-builder`
- `/student/academic-records`

### Active protected Admin routes

- `/admin/dashboard`
- `/admin/academic-ledger`
- `/admin/students`
- `/admin/students/:studentId`

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

Sprint 6 implementation and validation evidence is recorded in `docs/implementation/sprint-6-frontend-completion-report.md` and `docs/implementation/sprint-6-validation-report.md`.
