# Generated API Metadata Notes

The canonical frontend contract is OpenAPI 3.1.1 version 1.4.0 at `docs/api/CV_Management_API_OpenAPI_v1.4.0.yaml`. Its canonical LF SHA-256 checksum is `3f10985012f1cc6c69e3a69d221cc1e104cb877472461992943f6252452e1da6`.

`npm run openapi:generate` produces deterministic metadata and selected transport types. Feature API modules perform HTTP orchestration and strict Zod schemas validate responses.

The CV transport includes `CvFreshnessResponse`, `CvOptionalSections`, `CvPreviewRequest`, `CvPreviewResponse`, `CvPreviewConfigurationResponse`, `CvSaveRequest`, `GeneratedFileMetadataResponse`, and `CvResponse`.

PDF download remains a binary authenticated request. The download client accepts only `application/pdf`, handles Problem Details errors, sanitizes `Content-Disposition`, and revokes object URLs.

The contract intentionally contains no client-controlled section order, public LaTeX source, CV version history, or Admin-governed lifecycle.
