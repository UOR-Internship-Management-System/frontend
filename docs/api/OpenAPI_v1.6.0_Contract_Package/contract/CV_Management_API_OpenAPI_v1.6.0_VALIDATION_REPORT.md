# OpenAPI v1.6.0 Validation Report

Validated: 2026-07-19

Canonical LF SHA-256: `ebc5adb4b95380b3f66b38b06437a183a136149297916a90d19aaee0a85d8350`

## Structural and contract checks

| Check                                                                      | Result |
| -------------------------------------------------------------------------- | ------ |
| OpenAPI version and info version                                           | PASS   |
| Canonical checksum                                                         | PASS   |
| Internal component `$ref` resolution                                       | PASS   |
| Duplicate operationIds                                                     | PASS   |
| Existing Sprint 1-6 path/method/operationId preservation                   | PASS   |
| Required Sprint 7-8 paths                                                  | PASS   |
| Path parameter declarations                                                | PASS   |
| Strict Sprint 7-8 fixed DTOs                                               | PASS   |
| Admin Student read-only guard                                              | PASS   |
| Latest saved CV PDF-only and no-store guard                                | PASS   |
| No company authentication or COMPANY role                                  | PASS   |
| No Admin taxonomy mutation                                                 | PASS   |
| No GPA fields in internship request schemas                                | PASS   |
| Runtime GPA confined to filtering and academic data                        | PASS   |
| No candidate score/rank/probability/recommendation/match percentage fields | PASS   |
| Manual shortlist mutation contract                                         | PASS   |
| Non-blocking guidance acknowledgement contract                             | PASS   |
| Optimistic concurrency for mutable Admin resources                         | PASS   |
| CSV-only shortlist summary export                                          | PASS   |
| ZIP-only bulk latest-saved CV export                                       | PASS   |
| Explicit missing-CV reporting                                              | PASS   |
| Generated Sprint 1-8 metadata synchronization                              | PASS   |

## Repository integration results

This table is finalized after executing the repository gates.

| Command                            | Result                       |
| ---------------------------------- | ---------------------------- |
| `npm ci`                           | PENDING                      |
| `npm run openapi:generate`         | PENDING                      |
| `npm run openapi:check`            | PENDING                      |
| `npm run validate-env`             | PENDING                      |
| `npm run verify:scope`             | PENDING                      |
| `npm run format:check`             | PENDING                      |
| `npm run lint`                     | PENDING                      |
| `npm run typecheck`                | PENDING                      |
| Focused Sprint 7-8 contract Vitest | PASS - 1 test file, 5 tests. |
| `npm run build`                    | PENDING                      |
| Full `npm run test`                | PENDING                      |

## Validation boundary

- YAML parsing and structural/contract checks validate the machine-readable contract, generated frontend metadata, and repository synchronization.
- This report does not claim Spring Boot runtime implementation, database migration completion, generated-file storage conformance, or deployed endpoint behavior.
- Runtime schemas, feature API wrappers, MSW handlers, and Sprint 7-8 React pages remain the next implementation phase.
