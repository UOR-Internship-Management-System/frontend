# CV Builder Record-Level Inclusion Acceptance Evidence

Date: 2026-07-18

Frontend branch: `codex/cv-builder-record-level-inclusion-fix`

Backend branch: `codex/cv-builder-record-level-inclusion-fix`

## Audited sources

- Original CV Builder wireframe: `09-latex-cv-builder-final.html`.
- LaTeX CV Builder audit and implementation plan.
- Approved single-active-CV replacement contract.
- Approved record-level inclusion correction plan.
- Reduced-scope, SRS, UI, API, backend, database, ERD, workflow, and use-case authorities cited by the plan.
- Canonical OpenAPI contract: `CV_Management_API_OpenAPI_v1.4.1.yaml`.

## Accepted behavior

- Work Experience, Projects, Certificates, Awards and Honors, and Extracurricular Activities each render one checkbox per accessible Student-owned record.
- Group headings are not master checkboxes and cannot hide or select a whole section.
- The request and saved configuration use five bounded, unique UUID arrays.
- Empty groups are omitted from generated output; selected records render in the approved fixed order.
- Preview HTML and PDF are generated from the same owner-validated source snapshot.
- Saving replaces the Student's one active CV under optimistic locking; it does not create a visible version history.
- Admin access remains limited to reading metadata and downloading the latest saved PDF.
- Profile, Projects, and Academic source fingerprints are evaluated independently for freshness without changing the saved PDF.
- No order controls, LaTeX source output, saved-version history, CV evaluation, approval, rejection, or correction workflow is present.

## Contract evidence

- Contract version: `1.4.1`.
- Deterministic SHA-256: `4e8f7d0b864430b6d61c0a5e64d43574059b6a50be059a6b240b64133caece9e`.
- `npm.cmd run openapi:check`: passed; canonical, documentation, generated types, and metadata synchronized.
- The contract checker rejects `optionalSections`, `CvOptionalSections`, section ordering, LaTeX output, and CV history paths.

## Frontend verification

| Check                                       | Result                          |
| ------------------------------------------- | ------------------------------- |
| `npm.cmd run typecheck`                     | Passed                          |
| `npm.cmd run lint`                          | Passed                          |
| `npm.cmd run build`                         | Passed; 551 modules transformed |
| `npm.cmd run test`                          | Passed; 34 files, 190 tests     |
| `npm.cmd run e2e -- e2e/cv-builder.spec.ts` | Passed; 3 Chromium flows        |

The browser flows cover the Student route guard, generate/update/save/download, exact five-array request bodies, item-level deselection, preview expiry, and configuration preservation.

## Backend verification

| Check                                         | Result                                             |
| --------------------------------------------- | -------------------------------------------------- |
| `mvnw.cmd -DskipTests compile`                | Passed; 377 sources compiled                       |
| Focused CV tests                              | Passed; 12 tests                                   |
| `mvnw.cmd test`                               | Passed; 41 tests, 0 failures, 0 errors, 0 skipped  |
| PostgreSQL 16 Flyway Testcontainers migration | Passed; 12 migrations applied from an empty schema |

The first live migration run identified `current_role` as a PostgreSQL keyword conflict. The unreleased V010 source migration and repository mapping were corrected to `is_current_role`; the full migration chain then passed twice, including in the final full backend suite.

Security coverage includes duplicate-ID rejection, owner-scoped set loading, generic 422 responses that do not disclose foreign or missing IDs, composite owner/source foreign keys, HTML/PDF escaping, restricted preview rendering, Student/Admin role boundaries, and the removed-scope architecture guardrail.

## Deployment and rollback notes

- Deploy source schemas/services, backend contract and migrations, then the frontend; do not deploy the frontend alone.
- Apply V010, V011, and V012 through Flyway. V009 remains unchanged.
- Boolean compatibility columns and existing saved PDF assets remain available during the rollback window.
- Legacy saved rows without per-area hashes use the aggregate fingerprint fallback; every new preview and active-CV write stores all area hashes.
- Roll back frontend and backend together. Do not delete selection rows or saved PDF assets during rollback.
- Monitor preview/save/download status rates, 409/412/422 responses, generation duration, PDF size, and Admin download failures.

## Worktree isolation

The pre-existing `e2e/student-skills.spec.ts` frontend modification and backend v1.2/v1.3 documentation changes were not staged, edited, or committed by this correction.
