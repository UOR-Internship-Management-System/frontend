# Generated API Metadata Notes

The canonical frontend contract is OpenAPI 3.1.1 version 1.5.0 at `docs/api/CV_Management_API_OpenAPI_v1.5.0.yaml`.

Canonical LF SHA-256: `7b67a7c071e57e6619ba655501b8f6053a81454af1d80a50bf610ff3838f6521`.

`npm run openapi:generate` produces deterministic contract metadata and selected transport types for completed Sprint 1–5 behavior plus the finalized Sprint 6 Admin Dashboard, Academic Ledger, committed academic inspection, and Registered Students contract. It does not generate a complete endpoint SDK.

Feature-owned API modules remain responsible for JSON/multipart HTTP orchestration. Feature-owned strict runtime schemas remain responsible for validating backend responses while Sprint 6 backend implementation is pending.

The generated Sprint 6 transport metadata includes strict equivalents of:

- `AdminDashboardMetricsResponse`
- `AcademicLedgerUploadRequest`
- `AcademicLedgerUploadStatus`
- `AcademicLedgerValidationStatus`
- `AcademicLedgerUploadSummaryResponse`
- `AcademicLedgerUploadDetailResponse`
- `PagedAcademicLedgerUploadResponse`
- `AcademicLedgerStagedRowResponse`
- `PagedAcademicLedgerStagedRowResponse`
- `AcademicLedgerValidationErrorResponse`
- `AcademicLedgerValidationResultResponse`
- `AcademicLedgerCommitRequest`
- `AcademicLedgerCommitResponse`
- `StudentSummaryResponse`
- `PagedStudentSummaryResponse`
- `AcademicRecordResponse`
- `PagedAcademicRecordResponse`
- Sprint 6 endpoint-specific sort/filter enums

The academic ledger upload is exactly one UTF-8 CSV file (`text/csv`, `.csv`) no larger than 5 MiB. Do not add JSON/XLSX support, row editing, cancellation, rollback, or committed-record mutation without an approved contract revision.

OpenAPI v1.5.0 is the canonical transport authority. Feature wrappers, runtime schemas, MSW handlers, tests, and UI state models must not invent fields, endpoints, lifecycle statuses, media types, filenames, or error behavior outside this contract.
