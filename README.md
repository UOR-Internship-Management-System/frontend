# CV Management Frontend

[![Frontend CI](https://github.com/UOR-Internship-Management-System/frontend/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/UOR-Internship-Management-System/frontend/actions/workflows/frontend-ci.yml)
[![Preview Build](https://github.com/UOR-Internship-Management-System/frontend/actions/workflows/frontend-preview.yml/badge.svg)](https://github.com/UOR-Internship-Management-System/frontend/actions/workflows/frontend-preview.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

The frontend for the **CV Management and Deterministic Internship Candidate Filtering System**. It gives University of Ruhuna students a structured workspace for maintaining career information and generating CVs, while giving administrators tools for academic-data management, internship requests, deterministic candidate filtering, shortlisting, and exports.

This is a role-aware single-page application built with React, TypeScript, and Vite. It can run against the CV Management API or use deterministic Mock Service Worker (MSW) handlers for local development and browser testing.

> This repository contains only the web frontend. A compatible backend is required for live data, authentication, file processing, PDF generation, and export jobs.

## Table of contents

- [Key capabilities](#key-capabilities)
- [Technology stack](#technology-stack)
- [System architecture](#system-architecture)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Available scripts](#available-scripts)
- [Application routes](#application-routes)
- [API integration](#api-integration)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Development conventions](#development-conventions)
- [Production build and deployment](#production-build-and-deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Key capabilities

### Student workspace

- Student registration, OTP verification, login, and password recovery
- Dashboard with profile and CV-readiness information
- Personal, contact, experience, certificate, award, and activity management
- Profile-photo and certificate-evidence uploads
- Declared-skill management using the shared skill taxonomy
- Project management with repository/demo links and skill associations
- Read-only official academic records and GPA summary
- Record-level CV content selection
- Sanitized HTML CV preview, freshness tracking, saved versions, and PDF download

### Administrator workspace

- Administrator authentication and password recovery
- Operational dashboard metrics
- Academic-ledger CSV upload, processing, staged-row inspection, validation, and transactional commit
- Registered-student search, filtering, sorting, and pagination
- Read-only student deep dives and latest saved CV access
- Company and internship-request management
- Required-skill selection from the shared taxonomy
- Deterministic candidate filtering using official GPA bounds and declared skills
- Manual candidate selection without ranking, scoring, probability, or automated recommendations
- Draft and finalized shortlist workflows with guidance acknowledgement
- Shortlist summary export as CSV
- Bulk export of available latest CVs as ZIP, including explicit reporting for missing CVs

### User experience and platform features

- Role-protected and public-only routes
- Lazy-loaded feature pages with route-specific skeletons
- Responsive desktop, tablet, and mobile layouts
- Light and dark themes
- Reduced-motion support
- Accessible forms, dialogs, feedback, and keyboard interactions
- URL-backed list filters and pagination where applicable
- Centralized loading, empty, error, notification, and overlay patterns
- Strict runtime response validation with Zod
- Deterministic API mocks for local development and automated tests

## Technology stack

| Area                     | Technology                     | Purpose                                                   |
| ------------------------ | ------------------------------ | --------------------------------------------------------- |
| UI                       | React 19                       | Component-based application UI                            |
| Language                 | TypeScript 5.7                 | Strict static typing                                      |
| Build tooling            | Vite 6                         | Development server and optimized production builds        |
| Routing                  | React Router 7                 | Nested layouts, guarded routes, and fallbacks             |
| Server state             | TanStack Query 5               | Fetching, caching, invalidation, and mutation state       |
| Validation               | Zod 3                          | Runtime API and form-data validation                      |
| Security                 | DOMPurify                      | Sanitization of server-generated CV preview HTML          |
| API mocking              | MSW 2                          | Browser and test request interception                     |
| Unit/integration testing | Vitest, Testing Library, jsdom | Component, hook, schema, mapper, and API tests            |
| End-to-end testing       | Playwright                     | Browser workflows, accessibility, and visual regression   |
| Quality                  | ESLint, Prettier, TypeScript   | Static analysis and formatting                            |
| CI                       | GitHub Actions                 | Quality gates, cross-browser tests, and preview artifacts |

## System architecture

The application follows a feature-oriented architecture with a small application shell and reusable shared infrastructure.

```text
Browser
  |
  v
React Router + guarded layouts
  |
  +-- Student feature modules
  +-- Administrator feature modules
  |
  v
TanStack Query hooks + feature API modules
  |
  +-- Zod runtime validation
  +-- request/error/file-download utilities
  |
  v
CV Management API (/api/v1)
```

The primary architectural boundaries are:

- **`src/app`** — bootstrap, providers, runtime configuration, layouts, route definitions, and guards.
- **`src/features`** — domain-owned pages, components, hooks, schemas, mappers, types, API wrappers, and focused tests.
- **`src/shared`** — reusable API, authentication, UI, accessibility, validation, error, notification, overlay, skeleton, and skill-taxonomy infrastructure.
- **`src/mocks`** — MSW handlers and deterministic fixtures for local and automated environments.
- **`docs/api`** — the canonical OpenAPI contract and its validation/traceability artifacts.

Client-only state is kept close to the component or in focused providers. Remote server state is managed through TanStack Query. Feature query keys include all server-affecting inputs so caching and invalidation remain deterministic.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) **22.x** (the version used by CI)
- npm (included with Node.js)
- Git
- A running compatible backend on `http://localhost:8080` for live integration, or local API mocks enabled for standalone frontend development

### 1. Clone the repository

```bash
git clone https://github.com/UOR-Internship-Management-System/frontend.git
cd frontend
```

### 2. Install dependencies

Use `npm ci` for a clean, lockfile-reproducible installation:

```bash
npm ci
```

### 3. Create a local environment file

```bash
cp .env.example .env.local
```

On PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Choose one of the following configurations.

#### Run with the backend

```dotenv
VITE_APP_ENV=development
VITE_API_BASE_URL=/api/v1
VITE_ENABLE_API_MOCKS=false
VITE_DEV_AUTH_ROLE=
```

During development, Vite proxies `/api/*` requests to `http://localhost:8080`.

#### Run with deterministic local mocks

```dotenv
VITE_APP_ENV=development
VITE_API_BASE_URL=/api/v1
VITE_ENABLE_API_MOCKS=true
VITE_DEV_AUTH_ROLE=
```

Mock mode is intentionally disabled in production builds. The local mock accounts are:

| Role          | Email                   | Password       |
| ------------- | ----------------------- | -------------- |
| Student       | `student@dcs.ruh.ac.lk` | `Password@123` |
| Administrator | `admin@dcs.ruh.ac.lk`   | `Password@123` |

These credentials are development fixtures only and must never be used in a deployed environment.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite provides hot module replacement while files are edited.

### 5. Verify the setup

```bash
npm run validate-env
npm run typecheck
npm run test
npm run build
```

## Environment configuration

Only variables prefixed with `VITE_` are exposed to browser code. Never store secrets, database credentials, private tokens, or backend-only configuration in these variables.

| Variable                | Allowed values                                 | Default                   | Description                                                                         |
| ----------------------- | ---------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| `VITE_APP_ENV`          | `development`, `test`, `staging`, `production` | Vite mode / `development` | Logical application environment.                                                    |
| `VITE_API_BASE_URL`     | Relative path or `http(s)` URL                 | `/api/v1`                 | Base URL used by feature API modules. A trailing slash is normalized.               |
| `VITE_ENABLE_API_MOCKS` | `true`, `false`                                | `false`                   | Starts the MSW browser worker outside production. Unhandled requests pass through.  |
| `VITE_DEV_AUTH_ROLE`    | empty, `STUDENT`, `ADMIN`                      | empty                     | Optional non-production development role override. It is rejected for `production`. |

Run `npm run validate-env` after changing configuration. This checks values independently of starting the application.

### Backend connectivity

With the default relative API URL, the development server applies this proxy:

```text
http://localhost:5173/api/*  ->  http://localhost:8080/api/*
```

To use another backend without the proxy, provide its full API URL:

```dotenv
VITE_API_BASE_URL=https://api.example.edu/api/v1
```

The backend must then allow requests from the frontend origin and correctly handle authentication and content-disposition headers for downloads.

## Available scripts

### Development and builds

| Command                | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite development server on port 5173.                             |
| `npm run build`        | Run the TypeScript project build and generate the optimized `dist/` bundle. |
| `npm run preview`      | Serve the production bundle locally for final inspection.                   |
| `npm run validate-env` | Validate supported frontend environment values.                             |

### Code quality

| Command                | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| `npm run lint`         | Run ESLint across the repository.                                     |
| `npm run typecheck`    | Type-check all TypeScript projects without emitting application code. |
| `npm run format`       | Format supported files with Prettier.                                 |
| `npm run format:check` | Check formatting without modifying files.                             |

### Tests

| Command                                | Description                                                       |
| -------------------------------------- | ----------------------------------------------------------------- |
| `npm test`                             | Run the Vitest unit and integration suite.                        |
| `npm run test:coverage`                | Run Vitest with V8 coverage.                                      |
| `npm run e2e`                          | Run the complete Playwright suite.                                |
| `npm run e2e:cross-browser`            | Run functional E2E tests in Chromium, Firefox, WebKit, and Edge.  |
| `npm run e2e:visual`                   | Run responsive light/dark/reduced-motion visual regression tests. |
| `npm run e2e:motion`                   | Run motion and accessibility-focused browser tests.               |
| `npm run e2e:internships:live`         | Test internship management against a live backend.                |
| `npm run e2e:candidate-filtering:live` | Test candidate filtering against a live backend.                  |
| `npm run e2e:shortlists-live`          | Test shortlist and export flows against a live backend.           |
| `npm run e2e:cv-live`                  | Test CV generation against a live backend.                        |

### Contract and scope checks

| Command                    | Description                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run openapi:check`    | Verify the OpenAPI checksum, locked operation IDs, required artifacts, generated metadata, and scope rules. |
| `npm run openapi:generate` | Regenerate deterministic contract metadata and selected transport types.                                    |
| `npm run verify:scope`     | Scan for features and terminology excluded by the approved scope.                                           |

## Application routes

Routes are declared centrally in `src/app/config/routePaths.ts` and registered in `src/app/router/routes.tsx`.

### Public and authentication routes

| Route                            | Purpose                                     |
| -------------------------------- | ------------------------------------------- |
| `/`                              | Public gateway and role selection.          |
| `/student/sign-up`               | Student registration.                       |
| `/student/verify-otp`            | Student account verification.               |
| `/student/create-password`       | Initial student password creation.          |
| `/student/login`                 | Student sign-in.                            |
| `/student/forgot-password`       | Start student password recovery.            |
| `/student/reset/verify-otp`      | Verify a student password-reset OTP.        |
| `/student/reset/create-password` | Complete a student password reset.          |
| `/admin/login`                   | Administrator sign-in.                      |
| `/admin/forgot-password`         | Start administrator password recovery.      |
| `/admin/verify-reset-otp`        | Verify an administrator password-reset OTP. |
| `/admin/create-password`         | Complete an administrator password reset.   |

### Protected student routes

| Route                       | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| `/student/dashboard`        | Student overview.                                         |
| `/student/profile`          | Profile and CV supporting information.                    |
| `/student/skills`           | Declared skills and competency levels.                    |
| `/student/projects`         | Project portfolio management.                             |
| `/student/cv-builder`       | CV configuration, preview, save, freshness, and download. |
| `/student/academic-records` | Official records and GPA summary.                         |

### Protected administrator routes

| Route                        | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `/admin/dashboard`           | Administrative metrics.                            |
| `/admin/academic-ledger`     | Ledger upload, validation, inspection, and commit. |
| `/admin/students`            | Registered-student directory.                      |
| `/admin/students/:studentId` | Read-only student detail workspace.                |
| `/admin/internships`         | Company and internship-request management.         |
| `/admin/candidate-filtering` | Deterministic candidate filtering and selection.   |
| `/admin/shortlists`          | Shortlist management, finalization, and exports.   |

Unauthorized access resolves to `/unauthorized`; unmatched paths render the not-found fallback.

## API integration

### Canonical contract

The frontend's transport authority is the OpenAPI 3.1.1 contract:

```text
docs/api/CV_Management_API_OpenAPI_v1.6.0.yaml
```

The contract currently reports API version **1.6.0**. Its checksum and operation IDs are locked by `npm run openapi:check`.

Generated files under `src/shared/api/generated/` contain deterministic metadata and selected transport types; they are **not** a complete generated SDK. Do not edit them manually. Feature-owned API modules remain responsible for HTTP and file-transfer orchestration, while feature-owned Zod schemas validate runtime responses.

When the API contract changes:

1. Update the canonical OpenAPI document and its validation/traceability artifacts.
2. Update the checksum and operation lock only as part of an approved contract change.
3. Run `npm run openapi:generate`.
4. Synchronize feature schemas, types, API wrappers, mappers, MSW handlers, and tests.
5. Run `npm run openapi:check` and the complete quality suite.

### Authentication and request handling

- Access tokens are kept in `sessionStorage`, so they do not persist across browser sessions.
- Route guards distinguish student, administrator, public-only, verification-context, and reset-context access.
- API failures are normalized through shared error mapping and safe user-facing messages.
- Optimistic concurrency versions are sent where the contract requires them.
- Server-provided CV preview HTML is sanitized with a strict DOMPurify allowlist before rendering.
- File downloads use shared utilities and contract-defined response formats.

## Testing

### Unit and integration tests

Vitest runs in jsdom and uses Testing Library, jest-dom matchers, MSW, and shared provider-aware render helpers. Tests live beside their feature code and under `src/test` for shared foundations.

```bash
npm test
```

Use coverage when reviewing broader changes:

```bash
npm run test:coverage
```

### Browser tests

Install the Playwright browsers once after dependency installation:

```bash
npx playwright install
```

On Linux CI or a fresh Linux development environment:

```bash
npx playwright install --with-deps chromium firefox webkit
```

The default Playwright configuration starts an isolated Vite server on `127.0.0.1:5174`. It covers functional workflows plus responsive, theme, reduced-motion, and skeleton-state screenshots.

```bash
npm run e2e
```

Failure artifacts are written to `test-results/` and reports to `playwright-report/`; both are ignored by Git.

### Live-backend E2E tests

Live suites require a backend running against isolated, disposable test data. Copy the template and replace every placeholder:

```bash
cp .env.e2e-live.example .env.e2e-live.local
```

On PowerShell:

```powershell
Copy-Item .env.e2e-live.example .env.e2e-live.local
```

The local file can configure:

- `CV_E2E_BACKEND_ORIGIN`
- `CV_E2E_ADMIN_EMAIL`
- `CV_E2E_ADMIN_PASSWORD`
- `CV_E2E_FINALIZED_SHORTLIST_ID`
- `CV_E2E_FILTER_REQUEST_ID`
- `CV_E2E_FILTER_SEARCH`

The `*.local` suffix keeps real credentials and environment-specific identifiers out of version control.

## Project structure

```text
frontend/
|-- .github/workflows/       # CI and preview-build workflows
|-- docs/
|   |-- api/                 # OpenAPI contract and contract evidence
|   |-- architecture/        # Architecture and routing notes
|   |-- implementation/      # Sprint implementation and validation records
|   `-- testing/             # Acceptance-test evidence
|-- e2e/                     # Mocked functional, visual, and accessibility tests
|-- e2e-live/                # Browser tests against a running backend
|-- public/                  # Static assets, icons, PWA manifest, and MSW worker
|-- scripts/                 # Environment, contract, generation, and scope checks
|-- src/
|   |-- app/
|   |   |-- config/          # Environment, query client, flags, and route paths
|   |   |-- layouts/         # Root, auth, student, and admin layouts
|   |   |-- providers/       # Application-wide provider composition
|   |   `-- router/          # Routes, lazy imports, guards, and fallbacks
|   |-- features/            # Domain modules grouped by business capability
|   |-- mocks/               # MSW browser/server setup, handlers, and fixtures
|   |-- shared/              # Reusable platform infrastructure and UI
|   |-- styles/              # Tokens, themes, responsive rules, and print styles
|   `-- test/                # Test setup and reusable test utilities
|-- package.json
|-- playwright.config.ts
|-- vite.config.ts
`-- vitest.config.mjs
```

A typical feature module contains only the layers it needs:

```text
src/features/example/
|-- api/          # Network boundary
|-- components/   # Feature-specific UI
|-- hooks/        # Queries, mutations, and local orchestration
|-- mappers/      # API-to-view-model transformations
|-- pages/        # Route-level components
|-- schemas/      # Runtime validation
|-- tests/        # Unit and integration tests
|-- types/        # Feature types
`-- index.ts      # Public feature exports
```

## Development conventions

### Adding or changing a feature

1. Keep domain code inside the relevant `src/features/<feature>` module.
2. Put only genuinely cross-feature primitives in `src/shared`.
3. Validate external data at the API boundary with Zod.
4. Map transport data into UI-friendly types when their shapes differ.
5. Include every server-affecting input in TanStack Query keys.
6. Invalidate dependent queries after successful mutations.
7. Keep list search, filters, sorting, and pagination in the URL when the view is shareable.
8. Add loading, empty, recoverable-error, and permission states.
9. Add focused tests and update browser coverage for user-visible workflows.
10. Run the relevant quality and contract checks before opening a pull request.

### Code style

- TypeScript strict mode is enabled.
- React components and pages use `PascalCase` filenames.
- Hooks use the `use...` convention.
- Feature query-key factories live close to their hooks.
- Generated API files must be regenerated, never hand-edited.
- Run Prettier and ESLint before committing.

### Accessibility and responsive design

Changes should preserve:

- Semantic labels, validation messages, and keyboard navigation
- Focus trapping/restoration in overlays
- Visible focus states and sufficient color contrast
- Reduced-motion behavior
- Light and dark themes
- Desktop, tablet, and mobile layouts
- Stable skeleton and content geometry where visual tests cover the page

## Production build and deployment

Create an optimized bundle:

```bash
npm run build
```

The output is written to `dist/`. Inspect it locally with:

```bash
npm run preview
```

The application is a client-rendered SPA and can be hosted by any static web server or CDN. A production deployment must:

1. Build with `VITE_APP_ENV=production`.
2. Provide the production API base URL at build time.
3. Keep `VITE_ENABLE_API_MOCKS=false` and `VITE_DEV_AUTH_ROLE` empty.
4. Serve `index.html` for unknown non-asset paths so deep links work with React Router.
5. Serve assets from `dist/` with appropriate caching and compression.
6. Configure HTTPS, API CORS or a same-origin reverse proxy, and secure backend authentication.
7. Avoid long-lived caching for `index.html` so new asset manifests are discovered promptly.

Example production variables:

```dotenv
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.example.edu/api/v1
VITE_ENABLE_API_MOCKS=false
VITE_DEV_AUTH_ROLE=
```

Pull requests also run the **Frontend Preview Build** workflow, which uploads the generated `dist/` directory as a GitHub Actions artifact.

## Continuous integration

The main GitHub Actions quality workflow runs:

1. Reproducible dependency installation
2. Environment validation
3. Prettier formatting check
4. ESLint
5. TypeScript checking
6. Vitest
7. Production build
8. Playwright visual and motion baselines
9. Cross-browser E2E tests
10. OpenAPI synchronization checks
11. Removed-scope guardrails

Before pushing a substantial change, reproduce the core gates locally:

```bash
npm run validate-env
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run openapi:check
npm run verify:scope
```

## Troubleshooting

### The UI loads but API requests fail

- Confirm the backend is listening on `http://localhost:8080` when using the default proxy.
- Verify `VITE_API_BASE_URL` includes `/api/v1`.
- Restart Vite after changing an environment file.
- If using a full remote URL, check the backend's CORS configuration.
- Use `VITE_ENABLE_API_MOCKS=true` to work without a backend.

### Mock mode does not start

- Ensure `public/mockServiceWorker.js` exists.
- Use a non-production `VITE_APP_ENV`.
- Set the value exactly to `true` (lowercase).
- Check the browser console for service-worker registration errors.

### A protected route redirects to login or unauthorized

- Sign in with the role that owns the route.
- Remember that authentication is stored in `sessionStorage`; a new browser session requires a new login.
- Clear stale site data if the stored local mock session no longer matches current fixtures.

### Playwright cannot find a browser

```bash
npx playwright install
```

If Edge is part of the selected projects, it must also be installed or the Edge project must be excluded during local runs.

### Visual regression snapshots differ

Confirm the viewport, color scheme, operating system, fonts, and reduced-motion settings before accepting new baselines. Review every image difference; do not update snapshots merely to make the test pass.

### OpenAPI synchronization fails

Run `npm run openapi:generate`, inspect the contract notes under `docs/api`, and verify that the canonical YAML was not reformatted or changed without updating its approved checksum and operation lock.

## Contributing

Contributions should be made through focused branches and pull requests.

1. Create a branch from the current integration branch.
2. Keep changes scoped to one feature or concern.
3. Add or update tests with the implementation.
4. Run the full relevant quality suite.
5. Document environment, contract, route, or workflow changes.
6. Open a pull request with a concise description, verification evidence, and screenshots for visible UI changes.

Suggested commit format:

```text
type(scope): short description
```

Examples:

```text
feat(cv-builder): add record-level certificate selection
fix(shortlists): preserve page state after candidate removal
test(academic-ledger): cover invalid staged rows
docs(readme): document live backend testing
```

## Additional documentation

- [Frontend folder structure](docs/architecture/frontend-folder-structure.md)
- [Routing map](docs/architecture/routing-map.md)
- [State management notes](docs/architecture/state-management.md)
- [Generated API metadata notes](docs/api/generated-client-notes.md)
- [OpenAPI v1.6.0 validation report](docs/api/CV_Management_API_OpenAPI_v1.6.0_VALIDATION_REPORT.md)
- [Contract traceability matrix](docs/api/SPRINT_7_8_CONTRACT_TRACEABILITY_MATRIX.md)

Some historical architecture and sprint reports are retained as delivery evidence. When they conflict with implementation, use the current route definitions, package scripts, canonical OpenAPI v1.6.0 contract, and source code as the authoritative references.

## License

This repository does not currently include a license file. Unless the repository owners add an explicit license, no permission is granted to copy, modify, or redistribute the code outside the project's authorized use.

---

Developed for the University of Ruhuna internship and CV management workflow.
