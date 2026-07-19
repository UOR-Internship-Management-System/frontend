# OpenAPI v1.5.0 Validation Report

Validated: 2026-07-19

Canonical LF SHA-256: `7b67a7c071e57e6619ba655501b8f6053a81454af1d80a50bf610ff3838f6521`

| Check | Result |
|---|---|
| OpenAPI version | PASS |
| Info version | PASS |
| Internal $ref resolution | PASS |
| Duplicate operationIds | PASS |
| Path parameter declarations | PASS |
| Required Sprint 6 schemas | PASS |
| Fixed Sprint 6 DTO additionalProperties=false | PASS |
| Guaranteed Sprint 6 fields required | PASS |
| Typed upload list items | PASS |
| Typed validation errors | PASS |
| Staged-row endpoint | PASS |
| Registered Student level filter | PASS |
| Registered Student constrained sort | PASS |
| Roster degreeProgram | PASS |
| Roster nullable officialGpa | PASS |
| Upload 413 response | PASS |
| Upload fixed CSV media type | PASS |
| Upload fixed 5 MiB maximum | PASS |
| Commit Admin-only | PASS |
| Commit audited | PASS |
| No academic/staged row edit APIs | PASS |
| Removed-scope path guard | PASS |
| Sprint 1–5 and existing path preservation | PASS |
| Existing operationId preservation | PASS |
| Sprint 5 active-CV schema preservation | PASS |
| Five record-selection arrays preserved | PASS |
| PagedAcademicLedgerUploadResponse empty 200 example | PASS |
| PagedAcademicLedgerStagedRowResponse empty 200 example | PASS |
| PagedStudentSummaryResponse empty 200 example | PASS |
| PagedAcademicRecordResponse empty 200 example | PASS |
| Critical Sprint 6 schema reachability | PASS |

## Validation boundary

- YAML parsing and custom OpenAPI structural/contract checks passed.
- Every internal local `$ref` resolves.
- Existing repository OpenAPI synchronization, TypeScript generation, type checking, tests, and build are recorded separately after repository integration.
- This report does not claim Spring Boot runtime implementation or deployed endpoint conformance.

## Frontend repository integration results

| Command | Result |
|---|---|
| `npm ci` | PASS — 398 packages installed; 0 reported vulnerabilities. |
| `npm run openapi:generate` | PASS — deterministic v1.5.0 metadata and Sprint 1–6 DTO types generated. |
| `npm run openapi:check` | PASS — checksum, required paths/schemas, CV preservation, Sprint 6 constraints, and generated metadata synchronized. |
| `npm run validate-env` | PASS. |
| `npm run verify:scope` | PASS. |
| `npm run format:check` | PASS. |
| `npm run lint` | PASS. |
| `npm run typecheck` | PASS. |
| Relevant Vitest contract/route/auth/academic tests | PASS — 7 test files, 41 tests. |
| `npm run build` | PASS — Vite production build completed; 551 modules transformed. |
| `npm run test` | NOT CONFIRMED — assertions emitted passing progress, but the process did not terminate within 180 seconds. |
| Full Vitest retry using forks and one worker | NOT CONFIRMED — process again failed to terminate within 300 seconds. |

The non-terminating full-suite process is an existing repository teardown/worker issue and is not represented as a passed gate. The focused tests covering the contract-adjacent areas completed successfully.
