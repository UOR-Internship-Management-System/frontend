# OpenAPI v1.4.1 Validation Report

Validated: 2026-07-18

| Check                                                                | Result |
| -------------------------------------------------------------------- | ------ |
| OpenAPI version and metadata                                         | PASS   |
| Deterministic LF checksum                                            | PASS   |
| Preview request contains exactly five record-ID arrays               | PASS   |
| Arrays are bounded, unique, UUID-only, and required                  | PASS   |
| Master section booleans and client ordering are absent               | PASS   |
| Public preview excludes LaTeX source                                 | PASS   |
| Single active Student CV endpoints remain present                    | PASS   |
| Immutable history endpoints and schemas remain absent                | PASS   |
| First-create and replacement preconditions remain documented         | PASS   |
| PDF download remains `application/pdf` with safe attachment metadata | PASS   |
| Admin latest-CV routes remain read-only                              | PASS   |
| Removed review, approval, and submission workflow leakage            | PASS   |

Automated verification is performed by `npm run openapi:check`. It validates the canonical checksum, required paths and schemas, exact record-selection shape, removed contract fragments, download media rules, and generated TypeScript metadata.
