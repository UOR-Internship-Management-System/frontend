# OpenAPI v1.4.1 CV Contract Changelog

## Record-level inclusion correction — 2026-07-18

Version 1.4.1 corrects the pre-release v1.4.0 master-section-toggle interpretation after revalidation against the original CV Builder wireframe. The single-active-CV resource and removed-scope decisions are unchanged.

### Preview and configuration

- Removed `CvOptionalSections` and all five section booleans.
- Added five required, bounded, unique record-ID arrays for Experience, Projects, Certificates, Awards, and Activities.
- Empty arrays omit their section; there are no master section toggles.
- The backend validates every selected record against the authenticated Student without disclosing foreign record existence.
- Request array order cannot change the server-controlled section or record order.

### Preserved workflow

- Kept `GET /me/cv/source-freshness` and `POST /me/cv/preview`.
- Kept `GET /me/cv`, conditional `PUT /me/cv`, and `GET /me/cv/download`.
- Kept one active CV per Student, optimistic concurrency, preview expiry, and PDF-only download.
- Kept Admin latest-CV routes read-only and resolving the active CV.
- Kept LaTeX output, CV history, ordering controls, and Admin review lifecycle absent.

### Added schema

- `CvSelectedRecordIds`

### Removed schema

- `CvOptionalSections`
