# OpenAPI v1.4.0 Validation Report

Validated: 2026-07-18

| Check | Result |
| --- | --- |
| OpenAPI version and metadata | PASS |
| Deterministic LF checksum | PASS |
| Fixed-order preview request uses five strict toggles | PASS |
| Public preview excludes LaTeX source | PASS |
| Single active Student CV endpoints present | PASS |
| Immutable history endpoints and schemas absent | PASS |
| First-create and replacement preconditions documented | PASS |
| PDF download is `application/pdf` with safe attachment metadata | PASS |
| Admin latest-CV metadata route resolves `CvResponse` | PASS |
| Owner scope and Admin read-only boundaries documented | PASS |
| Removed review, approval, and submission workflow leakage | PASS |

Automated verification is performed by `npm run openapi:check`, which validates the canonical checksum, required paths and schemas, removed contract fragments, preview/save shapes, and generated TypeScript metadata.
