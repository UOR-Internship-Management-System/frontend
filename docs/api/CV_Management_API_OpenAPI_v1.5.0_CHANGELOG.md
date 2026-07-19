# OpenAPI v1.5.0 CV Contract Changelog

## Sprint 6 Admin contract freeze — 2026-07-19

Version 1.5.0 is a **minor contract milestone** because it adds the missing Sprint 6 staged-row endpoint, freezes a file format, adds new public schemas and constrained query enums, and tightens guaranteed response optionality. It preserves existing paths and operation IDs but is not classified as a patch-only correction.

### Admin Dashboard

- Finalized `GET /admin/dashboard/metrics` with a strict required response.
- Counts remain live persisted/computed values; wireframe figures are examples only.
- Narrowed responses to method-appropriate authentication, authorization, throttling, server, and availability outcomes.

### Academic Ledger

- Froze one UTF-8 CSV format (`text/csv`, `.csv`) with an exact header contract and 5 MiB maximum.
- Changed upload acceptance to asynchronous `202 Accepted` with `Location` and `Retry-After` polling hints.
- Added separate upload and validation lifecycle enums with documented state transitions.
- Added strict upload summary/detail page schemas.
- Added `GET /admin/academic-ledger/uploads/{uploadId}/staged-rows` with typed pagination, search, sort, and validation filtering.
- Replaced generic validation error objects with `AcademicLedgerValidationErrorResponse`.
- Finalized atomic commit semantics, row/state locking, repeated/concurrent commit conflicts, rollback-on-failure, and GPA recalculation counts.
- Added 409, 413, 415, 422, and 500 ledger-specific Problem Details examples.
- Kept staged rows read-only; no inline override, cancel, delete, rollback, or committed-data reversal endpoint was added.

### Registered Students and academic inspection

- Added explicit Level 3/4 filtering and wireframe-constrained sorting.
- Documented search across name, index number, university email, and academic batch.
- Added required `degreeProgram` and `academicBatch`; made `officialGpa` required-but-nullable.
- Finalized per-Student committed academic-record search, course-code filter, sorting, pagination, and typed empty states.
- Preserved the Sprint 7 deep-dive route without expanding its implementation scope.

### Preserved behavior

- Admin Login remains unchanged.
- All existing Sprint 1–5 paths and operation IDs remain present.
- The one-active-CV, five record-ID arrays, PDF-only download, no history, no LaTeX-source, and no CV-review rules remain unchanged.
