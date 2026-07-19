# Frontend Implementation

The frontend is a Vite, React, and strict TypeScript application using React Router, TanStack Query, Zod contract parsing, MSW, Vitest, Testing Library, and Playwright.

Sprint 6 adds a protected Admin workspace with three navigation destinations: Dashboard, Academic Ledger, and Registered Students. Admin data modules own their API adapters, schemas, mappers, query keys, hooks, components, pages, and tests.

The Academic Ledger workflow accepts CSV files up to 5 MiB, tracks asynchronous processing with terminal-aware polling, exposes staged validation details, and requires an explicit `{ "confirm": true }` transaction before official records are committed. Student academic inspection is read-only.

Server-affecting roster and ledger review controls are represented in URL state. Runtime response schemas fail safely, correlation identifiers are retained when useful, and valid sessions are only cleared after confirmed authentication failure.

See the Sprint 6 completion, validation, known-limitations, commit-manifest, and scope-compliance reports in `docs/implementation`.
