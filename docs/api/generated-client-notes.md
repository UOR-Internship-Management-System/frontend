# Generated API Metadata Notes

The canonical frontend contract is OpenAPI 3.1.1 version 1.4.1 at `docs/api/CV_Management_API_OpenAPI_v1.4.1.yaml`. Its canonical LF SHA-256 checksum is `4e8f7d0b864430b6d61c0a5e64d43574059b6a50be059a6b240b64133caece9e`.

`npm run openapi:generate` produces deterministic metadata and selected transport types. Feature API modules perform HTTP orchestration and strict Zod schemas validate responses.

The CV transport includes `CvFreshnessResponse`, `CvSelectedRecordIds`, `CvPreviewRequest`, `CvPreviewResponse`, `CvPreviewConfigurationResponse`, `CvSaveRequest`, `GeneratedFileMetadataResponse`, and `CvResponse`.

PDF download remains a binary authenticated request. The download client accepts only `application/pdf`, handles Problem Details errors, sanitizes `Content-Disposition`, and revokes object URLs.

The contract intentionally contains no master section toggles, client-controlled section order, public LaTeX source, CV version history, or Admin-governed lifecycle.
