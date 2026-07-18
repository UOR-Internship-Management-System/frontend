# Frontend Test Plan

The regression suite covers public and protected routing, role guards, session restoration, shared UI behavior, all approved Student workflows, and the Sprint 6 Admin workspace.

Sprint 6 unit and component coverage includes dashboard parsing and recovery, registered-Student URL state and roster states, ledger upload validation, response headers, polling, staged-row controls, validation gates, explicit transactional commit, conflict recovery, read-only inspection, accessible modal behavior, and query invalidation.

MSW fixtures and handlers model the OpenAPI v1.5.0 Admin responses. Playwright includes critical Admin authentication, upload/review/commit, responsive inspection, keyboard, overflow, and dark-mode smoke paths. Browser tests use deterministic contract mocks; backend conformance must be executed separately in the release environment.

The required closure sequence is `npm ci`, environment validation, OpenAPI generation/check, removed-scope scan, formatting, lint, strict type checking, full Vitest, coverage, production build, Playwright discovery, and critical Chromium execution. Exact Sprint 6 results are in `docs/implementation/sprint-6-validation-report.md`.
