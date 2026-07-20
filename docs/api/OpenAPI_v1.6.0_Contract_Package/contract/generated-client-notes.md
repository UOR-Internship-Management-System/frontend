# Generated API Metadata Notes

The canonical frontend contract is OpenAPI 3.1.1 version 1.6.0 at `docs/api/CV_Management_API_OpenAPI_v1.6.0.yaml`.

Canonical LF SHA-256: `ebc5adb4b95380b3f66b38b06437a183a136149297916a90d19aaee0a85d8350`.

`npm run openapi:generate` produces deterministic contract metadata and selected strict transport types for completed Sprint 1-6 behavior plus the frozen Sprint 7-8 Admin Student inspection, company/request, deterministic filtering, shortlist, and export contracts. It does not generate a complete endpoint SDK.

Feature-owned API modules remain responsible for JSON and file-transfer HTTP orchestration. Feature-owned strict runtime schemas remain responsible for validating backend responses. The next integration step is to synchronize those runtime schemas, API wrappers, MSW handlers, and focused tests before implementing the React pages.

The generated Sprint 7-8 metadata includes strict equivalents of:

- `AdminStudentDetailResponse`
- `AdminLatestCvResponse`
- Company create/update/response and page types
- Internship request create/update/response, status, work-mode, required-skill, and page types
- Candidate filtering criteria/run/candidate/page and constrained sort types
- Shortlist create/detail/candidate/mutation/finalization/page and status types
- CSV summary and ZIP bulk-CV export requests
- Export-job lifecycle, missing-CV, warning, and download-readiness types

Contract rules:

- Admin Student inspection is read-only.
- Latest saved CV access is read-only and PDF-only.
- Companies are metadata-only external stakeholders with no system identity.
- Internship requests contain no GPA criteria.
- GPA appears only as official academic data or runtime filtering criteria.
- Filtering is deterministic and contains no score, rank, probability, recommendation, or match percentage.
- Candidate selection is manual.
- Shortlist guidance is non-blocking after acknowledgement.
- Shortlist summary export is CSV; bulk latest-saved CV export is ZIP of available PDF files.
- Missing CVs are explicitly reported.

OpenAPI v1.6.0 is the canonical transport authority. Feature wrappers, runtime schemas, MSW handlers, tests, UI state models, backend DTOs, and database migrations must not invent behavior outside this contract.
