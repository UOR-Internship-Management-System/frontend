# Generated API Metadata Notes

The canonical frontend contract is OpenAPI 3.1.1 version 1.4.0 at `docs/api/CV_Management_API_OpenAPI_v1.4.0.yaml`. Its finalized canonical LF SHA-256 checksum is `e96b7cb2efbe84295753ff03924b747f90196ada4726d7eebd39fd64a3e83282`.

`npm run openapi:generate` should produce deterministic contract metadata and selected transport types for the completed Sprint 1–4 contract plus the Sprint 5 CV Builder and Academic Records contract. It does not generate a complete endpoint SDK. Feature-owned API modules remain responsible for JSON HTTP orchestration, and feature-owned strict runtime schemas remain responsible for validating backend responses while backend implementation is pending.

Sprint 5 generation must include strict equivalents of the following transport contracts:

- `AcademicRecordResponse`
- `PagedAcademicRecordResponse`
- `AcademicRecordSourceResponse`
- `GpaAvailabilityStatus`
- `GpaSummaryResponse`
- `CvFreshnessStatus`
- `CvSourceArea`
- `CvSectionType`
- `CvFreshnessResponse`
- `CvPreviewRequest`
- `CvPreviewResponse`
- `CvPreviewConfigurationResponse`
- `CvVersionCreateRequest`
- `GeneratedFileMetadataResponse`
- `CvVersionResponse`
- `PagedCvVersionResponse`

PDF download operations are binary responses rather than JSON responses. The frontend therefore requires a separate authenticated PDF-download client that reads `response.blob()`, handles `application/problem+json` errors, extracts and sanitizes the `Content-Disposition` filename, and revokes created object URLs. The established JSON client must not be changed to parse PDF success responses as JSON.

OpenAPI v1.4.0 is the canonical transport authority. Feature wrappers, runtime schemas, MSW handlers, tests, and UI state models must not invent fields, endpoints, statuses, media types, filenames, or error behavior outside this contract.

Do not mix OpenAPI v1.3.0 Sprint 5 placeholder types with v1.4.0 types. Regenerate or manually replace all Sprint 5 generated metadata and types when adopting v1.4.0.
