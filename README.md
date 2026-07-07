# CV Management Frontend

React, TypeScript, and Vite frontend for the CV Management and Deterministic Internship Candidate Filtering System.

## Sprint 1 Scope

This repository currently contains foundation-only frontend work: app bootstrap, provider stack, React Router route shells, shared UI primitives, API infrastructure stubs, OpenAPI contract placement, smoke tests, CI workflows, and removed-scope guardrails.

Feature workflows are intentionally deferred to later sprints. Current pages are route-safe shells only and do not perform CRUD, mutations, or backend workflow calls.

## Setup

```bash
npm ci
npm run dev
```

Environment variables are documented in `.env.example`.

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

The app uses `src/app` for bootstrap, providers, routing, layouts, and runtime config; `src/shared` for reusable UI/API/security utilities; and `src/features` for approved feature route shells.
