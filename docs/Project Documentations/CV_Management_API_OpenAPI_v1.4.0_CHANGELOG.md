# OpenAPI v1.4.0 CV Contract Changelog

## Approved single-active-CV replacement — 2026-07-18

The approved replacement contract supersedes the earlier pre-release Sprint 5 CV-version draft. No CV history schema or production migration had shipped, so the canonical v1.4.0 contract is corrected in place.

### Student API

- Kept `GET /me/cv/source-freshness` and `POST /me/cv/preview`.
- Added `GET /me/cv`, conditional `PUT /me/cv`, and `GET /me/cv/download`.
- Removed `/me/cv/versions`, version-detail, version-download, and latest-download operations.
- First save requires `If-None-Match: *`; replacement requires a current quoted revision in `If-Match`.
- Missing preconditions return 428; stale revisions return 412.

### Preview and configuration

- Removed client-controlled section ordering.
- Added strict inclusion flags for experience, projects, certificates, awards, and activities.
- The backend owns the fixed structural order.
- Project IDs must be unique, owner-scoped, and empty when Projects is disabled.
- Removed public `latexSource`; LaTeX remains an internal PDF-generation concern.

### Persistence and administration

- Replaced immutable version-history terminology with one active `CvResponse` per Student.
- `revision` is an optimistic-concurrency token, not a history number.
- Freshness fields are now `cvId` and `savedAt`.
- Existing Admin latest-CV routes remain read-only and resolve the Student's active row.

### Removed schemas

- `CvSectionType`
- `CvVersionCreateRequest`
- `CvVersionResponse`
- `PagedCvVersionResponse`

### Added schemas

- `CvOptionalSections`
- `CvSaveRequest`
- `CvResponse`
