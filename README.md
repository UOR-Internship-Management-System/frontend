# CV Management Frontend

React, TypeScript, and Vite frontend for the CV Management and Deterministic Internship Candidate Filtering System.

## Sprint 5 Status

The frontend implements the approved Student workflows delivered through Sprint 5: authentication and onboarding, Dashboard metrics, Student-owned Profile editing, declared-skill management, Student-owned projects, the CV Builder, and read-only Academic Records with the official Computer Science GPA.

Sprint 5 adopts OpenAPI v1.4.0. The CV Builder supports server-confirmed previews, immutable saved versions, freshness states, preview-expiration recovery, and authenticated PDF downloads. Academic Records supports the official `AVAILABLE` and `NOT_AVAILABLE` GPA states plus contract-authorized search, sorting, and pagination over committed read-only records.

All non-browser release checks pass. The 38 Playwright scenarios are implemented and discoverable, but execution is currently blocked because the configured Chromium executable is not installed in the validation environment. Run `npx playwright install chromium` in an approved environment and then `npm run e2e` before release acceptance.

### Active protected Student routes

- `/student/dashboard`
- `/student/profile`
- `/student/skills`
- `/student/projects`
- `/student/cv-builder`
- `/student/academic-records`

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

Sprint 5 implementation and validation evidence is recorded in `docs/implementation/sprint-5-frontend-completion-notes.md`.
