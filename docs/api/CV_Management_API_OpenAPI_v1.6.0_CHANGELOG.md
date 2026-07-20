# OpenAPI v1.6.0 Sprint 7-8 Contract Changelog

## Contract milestone - 2026-07-19

Version 1.6.0 is a minor contract milestone. It preserves all valid Sprint 1-6 paths and operationIds from v1.5.0 and freezes the Sprint 7-8 Admin transport contracts.

### Student deep-dive and latest saved CV

- Hardened the read-only Admin Student detail response.
- Kept declared skills, projects, and committed academic records as separate paged resources.
- Added strict CV-supporting record aggregation for experience, certificates, awards, and activities.
- Added `AdminLatestCvResponse` with `AVAILABLE` and `NOT_SAVED` states.
- Kept Admin CV access read-only and PDF-only with safe Content-Disposition and `Cache-Control: no-store`.
- Added explicit no-saved-CV and file-unavailable behavior without adding any CV review lifecycle.

### Company metadata

- Added strict create/update/response DTOs and required/nullable semantics.
- Added constrained search, pagination, sorting, and active-state filtering.
- Froze Admin-only metadata fields and excluded every company account/authentication concept.
- Defined optimistic concurrency using ETag and If-Match.
- Defined DELETE as idempotent soft deactivation with linked-active-request conflict handling.

### Internship requests

- Added strict `DRAFT`, `ACTIVE`, `CLOSED`, and `CANCELLED` lifecycle states.
- Added strict role, optional location/work mode, notes, advisory guidance, required skills, timestamps, and version fields.
- Defined create/update full required-skill replacement and nested incremental add/remove semantics.
- Added taxonomy validation, duplicate-skill conflicts, constrained server-side list behavior, and stale-update handling.
- Confirmed that no GPA field exists in any internship request request/response schema.

### Deterministic candidate filtering

- Replaced arbitrary criteria maps with typed runtime GPA and declared-skill criteria.
- Added explicit AND/OR matching mode and separate request/additional runtime skill sets.
- Defined persisted sanitized run metadata while candidate rows are recomputed from latest committed data.
- Added nullable official GPA plus explicit availability behavior.
- Added factual non-blocking cross-shortlist indicators and latest-saved-CV availability.
- Added constrained candidate search, pagination, and sorting.
- Confirmed absence of score, rank, probability, recommendation, match percentage, and automatic selection.

### Shortlists

- Added strict summary/detail/paged candidate DTOs.
- Defined one Version 1 shortlist per internship request.
- Added explicit manual batch candidate addition and individual removal.
- Added ETag/If-Match protection for draft mutations and finalization.
- Added structured advisory guidance fields and acknowledgement-required conflict handling.
- Defined atomic DRAFT-to-FINALIZED transition, repeat/concurrent conflict behavior, and finalized immutability.

### Exports

- Separated final shortlist summary and bulk-CV export request schemas.
- Froze shortlist summary export to asynchronous CSV.
- Froze bulk latest-saved CV export to asynchronous ZIP containing available PDF CVs.
- Added strict export lifecycle, counters, warnings, missing-CV list, readiness, safe failure, and nullable expiry fields.
- Added CSV/ZIP-only download media types, safe attachment filenames, Admin authorization, no-store, and audit requirements.
- Defined partial completion with explicit missing-CV reporting and safe failure when no CV file is available.

### Frontend metadata and validation

- Expanded deterministic generated TypeScript metadata through Sprint 8.
- Expanded OpenAPI synchronization checks to verify `$ref` resolution, operationId preservation, strict schemas, exact export media types, optimistic concurrency, and negative-scope semantics.
- Added focused Vitest contract checks and Sprint 7-8 traceability/decision documents.
