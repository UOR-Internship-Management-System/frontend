# CV Management API OpenAPI v1.4.0 Changelog

## 1. Revision identity

- **Input file:** `CV_Management_API_OpenAPI_v1.3.0.yaml`
- **Output file:** `CV_Management_API_OpenAPI_v1.4.0.yaml`
- **OpenAPI version:** `3.1.1`
- **API document version:** `1.4.0`
- **Scope of revision:** Sprint 5 frontend contract freeze for the Student CV Builder, ATS-compliant CV preview/versioning/PDF download, Student read-only official academic records, and official Computer Science GPA.
- **Implementation status:** `frontendContract: READY`; `backendImplementation: PENDING`.
- **Input v1.3.0 raw uploaded SHA-256:** `b5aaaebbfa57384dfd68e58be78c7124004e9f313d5dcb9c29487d138ec1e1a5`
- **Input v1.3.0 canonical LF SHA-256:** `d920516cec8733e0011ea33e9be4abcad9554f5f7b6a97dd0599825cb462aa5e`
- **Final v1.4.0 canonical LF SHA-256:** `e96b7cb2efbe84295753ff03924b747f90196ada4726d7eebd39fd64a3e83282`

The raw uploaded v1.3.0 file used CRLF line endings. Canonical LF normalization produces the checksum declared by the v1.3.0 changelog and generated-client notes. The original v1.3.0 YAML and changelog were not overwritten or deleted.

## 2. Sources reviewed and authority order

Sources were applied in the required authority order. Higher-authority scope and requirements sources controlled conflicts with lower-priority visual evidence.

1. **Final Reduced Scope Baseline Document v1.1**
   - Student CV workflow is self-service.
   - ATS-compliant output, saved versions, freshness tracking, and Admin read-only latest access are in scope.
   - CV review/approval, Estimated GPA, company login, AI ranking, and other removed concepts are forbidden.
2. **Scope reductions.docx**
   - Confirms the removed approval and temporary-password workflows and protects the reduced scope.
3. **Software Requirements Specification v3.0.1**
   - Controls official GPA, read-only academic data, Save Current CV Version wording, ATS output, security, and acceptance behavior.
4. **Production-Ready Use-Case Documentation v1.0 and approved workflows**
   - Confirms Student-owned preview/save/download and read-only academic-record flows.
5. **45-Day Agile Sprint Implementation Plan**
   - Sprint 5 requires preview, LaTeX/output view, freshness warning, save, PDF download, official GPA, semester/module table, and loading/empty/error states.
6. **UI Frontend Specification v1.1**
   - Requires strict typed DTOs, server-state ownership, safe rendering, binary download handling, and removed-scope negative tests.
7. **Database Design Document v1.0 and Backend Module Documentation v1.0**
   - Supplies the authoritative academic-grade, GPA-summary, CV-version, generated-file, and freshness metadata model.
8. **OpenAPI v1.3.0 technical conventions**
   - Preserved `/me/...` ownership routes, operation IDs, bearer authentication, PageMetadata, Problem Details, and prior Sprint contracts.
9. **Student.docx and finalized Student wireframes**
   - Used for visible academic columns and the two-panel visual/LaTeX CV Builder evidence only.
10. **New DESIGN.md**
    - Used for UI safety and visual evidence only; it did not authorize transport functionality.

## 3. Contract decisions

### 3.1 Academic records use a concrete committed-record DTO

`PagedAcademicRecordResponse.items` now references `AcademicRecordResponse`. The response exposes the committed official-grade fields supported by the physical database design and Student table UI:

- `academicRecordId`
- `subjectId`
- `courseCode`
- `courseTitle`
- `credits`
- `letterGrade`
- `gradePoint`
- `semester`
- `academicYear`
- `attemptNumber`
- `resultStatus`
- `committedAt`

No mutation field or editable state is exposed.

### 3.2 No academic data is a successful empty state

`GET /me/academic-records` returns `200` with `items: []` and valid `PageMetadata` when no committed records exist. A normal empty collection is not represented by `404`.

### 3.3 GPA availability is explicit and typed

`GpaSummaryResponse` now includes `GpaAvailabilityStatus`:

- `AVAILABLE`
- `NOT_AVAILABLE`

When unavailable, `computerScienceGpa`, `totalCredits`, `calculatedAt`, and `source` are `null`. When available, `source` is a strict `AcademicRecordSourceResponse` containing the latest committed upload identifier and commit timestamp.

### 3.4 CV freshness includes the first-time state

`CvFreshnessStatus` now contains:

- `NOT_SAVED`
- `CURRENT`
- `OUTDATED`

`CvSourceArea` restricts changed source areas to approved high-level values:

- `PROFILE`
- `DECLARED_SKILLS`
- `PROJECTS`
- `ACADEMIC_RECORDS`

The frontend can determine state from typed fields without parsing the informational `message`.

### 3.5 CV sections are controlled

`CvSectionType` replaces arbitrary section strings:

- `PROFESSIONAL_SUMMARY`
- `SKILLS`
- `EXPERIENCE`
- `PROJECTS`
- `CERTIFICATES`
- `AWARDS`
- `ACTIVITIES`
- `ACADEMIC_SUMMARY`

The identity/contact header is always generated and is not part of `sectionOrder`. Sections omitted from `sectionOrder` are excluded rather than appended automatically.

### 3.6 Preview returns both safe visual output and LaTeX output

`CvPreviewResponse` now requires:

- `previewId`
- `htmlPreview`
- `latexSource`
- `freshness`
- `configuration`
- `generatedAt`
- `expiresAt`

`htmlPreview` is explicitly backend-generated and sanitized. It must contain no scripts, event-handler attributes, unsafe URLs, embedded credentials, or untrusted Student-supplied HTML. The frontend must still use its approved sanitizing boundary.

### 3.7 Save Current CV Version is atomically linked to the confirmed preview

`CvVersionCreateRequest` now accepts only `previewId`. The server saves the immutable content and configuration represented by the unexpired preview. The frontend never sends generated HTML or LaTeX back to the server.

This design prevents the saved CV from differing from the preview the Student confirmed. Expired or invalidated previews return the stable `CV_PREVIEW_EXPIRED` conflict response.

### 3.8 Unsupported free-form notes were removed

The preliminary `notes` field was removed from:

- `CvPreviewRequest`
- `CvVersionCreateRequest`

No controlling Sprint 5 source authorized free-form CV notes. Keeping the field would have introduced unsupported transport behavior.

### 3.9 CV-version metadata is strict and download-ready

`CvVersionResponse` now requires typed version number, timestamps, API-relative download URL, saved-version freshness, and strict PDF metadata. Saved versions can be `CURRENT` or `OUTDATED`; the `NOT_SAVED` state is not valid for an existing version.

`PagedCvVersionResponse.items` now references `CvVersionResponse`.

### 3.10 Student single-CV downloads are PDF-only

The two Student download operations expose only `application/pdf` and document:

- binary response schema;
- required `Content-Disposition` attachment header;
- sanitized filename pattern;
- optional `Content-Length`;
- Problem Details JSON for errors.

`application/zip` and `application/octet-stream` were removed from these single-CV operations because the approved Student workflow requires an unambiguous ATS-compliant PDF.

### 3.11 CV-version search was removed

The shared `Search` parameter was removed from `GET /me/cv/versions` because no authoritative UI requirement or defined searchable field exists. Page, size, and sort remain.

## 4. Conflict-resolution register

### Conflict 1 — Preliminary save request regenerated content instead of saving the confirmed preview

- **Source A:** v1.3.0 `CvVersionCreateRequest` repeated `sectionOrder`, `includedProjectIds`, and `notes`.
- **Source B:** SRS and Sprint 5 wording require Save Current CV Version, meaning the confirmed preview and saved result must match.
- **Decision:** Require a server-issued `previewId`; save the exact immutable preview snapshot.

### Conflict 2 — Preview identifiers had no lifecycle

- **Source A:** v1.3.0 returned `previewId` but did not define expiry or save behavior.
- **Source B:** Production-safe save linkage needs a bounded temporary preview lifecycle.
- **Decision:** Add server-controlled `expiresAt` and `CV_PREVIEW_EXPIRED` handling. No fixed TTL was invented; the response communicates the actual expiry.

### Conflict 3 — Wireframe contains forbidden “Submit for Admin Review” wording

- **Source A:** Legacy Student wireframe includes submission/review wording.
- **Source B:** Baseline, SRS, use cases, and Sprint plan explicitly prohibit that workflow.
- **Decision:** No submission route, field, state, or status was added. The save operation remains self-service.

### Conflict 4 — Wireframe downloads LaTeX text while Sprint 5 requires PDF

- **Source A:** Legacy standalone HTML demonstrates a `.tex` client-side download.
- **Source B:** Baseline, SRS, and Sprint plan require backend-controlled ATS-compliant PDF download.
- **Decision:** Keep LaTeX as a displayed response field; restrict Student download operations to PDF.

### Conflict 5 — Academic terminology uses both subject and module language

- **Source A:** Student UI describes a semester/module table.
- **Source B:** Database design uses canonical `subject`, `course_code`, and `course_title` fields.
- **Decision:** Use `courseCode` and `courseTitle` in the transport DTO and avoid duplicate subject/module aliases.

### Conflict 6 — GPA absence could be treated as missing resource

- **Source A:** v1.3.0 included broad `404` responses.
- **Source B:** The UI requires a safe no-record empty state; missing academic data is ordinary for a Student before a ledger commit.
- **Decision:** Return typed `NOT_AVAILABLE` under `200`.

### Conflict 7 — Detailed source areas versus the database’s singular last-changed area

- **Source A:** Database design stores a last changed source area.
- **Source B:** Frontend freshness notice and contract prompt require a typed changed-area collection.
- **Decision:** Expose approved high-level areas in `changedAreas`; backend implementation may derive the set from freshness/source-snapshot metadata without exposing internal table names.

### Conflict 8 — Arbitrary CV section strings

- **Source A:** v1.3.0 accepted any string.
- **Source B:** Strict TypeScript generation and deterministic LaTeX generation require controlled values.
- **Decision:** Add `CvSectionType` and reject unknown sections.

## 5. Exact paths changed

- `GET /me/academic-records`
- `GET /me/academic-records/gpa`
- `GET /me/cv/source-freshness`
- `POST /me/cv/preview`
- `POST /me/cv/versions`
- `GET /me/cv/versions`
- `GET /me/cv/versions/{cvVersionId}`
- `GET /me/cv/versions/{cvVersionId}/download`
- `GET /me/cv/latest/download`

No path was added or removed. All 104 existing operation IDs were preserved.

## 6. Exact schemas added, strengthened, and removed

### Added

- `GpaAvailabilityStatus`
- `CvFreshnessStatus`
- `CvSourceArea`
- `CvSectionType`
- `AcademicRecordResponse`
- `AcademicRecordSourceResponse`
- `CvPreviewConfigurationResponse`
- `GeneratedFileMetadataResponse`

### Replaced or strengthened

- `PagedAcademicRecordResponse`
- `GpaSummaryResponse`
- `CvFreshnessResponse`
- `CvPreviewRequest`
- `CvPreviewResponse`
- `CvVersionCreateRequest`
- `CvVersionResponse`
- `PagedCvVersionResponse`

### Removed fields

- `CvPreviewRequest.notes`
- `CvVersionCreateRequest.notes`
- `CvVersionCreateRequest.sectionOrder`
- `CvVersionCreateRequest.includedProjectIds`

`CvVersionCreateRequest` now contains only `previewId`.

No schema key was deleted because the existing schema names are retained for compatibility.

## 7. Parameters added or removed

### Added

- None.

### Removed

- Shared `Search` parameter from `GET /me/cv/versions`.

## 8. Response components added

- `InvalidCvConfiguration422`
- `CvPreviewExpired409`
- `CvGenerationFailed503`
- `NoSavedCv404`
- `CvFileUnavailable503`
- `AcademicDataUnavailable503`

Each response uses the existing `ProblemDetails` schema and includes a stable machine-readable `code` and example.

## 9. Response-status refinement

Broad inherited responses were removed from Sprint 5 operations where they were not meaningful.

- Bodyless GET operations no longer expose `412`, `415`, or `422`.
- Empty collections and unavailable GPA no longer use `404`.
- Preview generation uses `422` only for semantic configuration failure.
- Save uses `409` for expired/invalidated preview state.
- Download uses `404` for no saved/unknown owned resource and `503` for temporary PDF unavailability.
- No Sprint 5 operation uses `412` or `428` because no `If-Match` precondition is defined for these operations.

## 10. Backward-compatibility notes

The following were preserved:

- Every valid Sprint 1–4 path.
- All 104 existing operation IDs.
- Existing bearer-authentication and `/me/...` ownership conventions.
- Existing Problem Details and PageMetadata conventions.
- Sprint 4 taxonomy, declared-skill, project, and optimistic-concurrency contracts.
- Existing `htmlPreview`, `versionLabel`, `createdAt`, and `downloadUrl` properties where practical.

Expected Sprint 5 client impact:

- Regenerate or manually update generated types from v1.4.0.
- Replace generic academic/CV item types with strict DTOs.
- Replace arbitrary strings with generated enums.
- Change save mutation input to `{ previewId }`.
- Treat PDF downloads as binary responses through a separate authenticated download client.
- Do not mix v1.3.0 placeholder Sprint 5 types with v1.4.0 types.

## 11. Removed-scope verification

The active Sprint 5 paths and schemas were checked for the absence of active fields, route names, operation IDs, schema properties, and enum values representing:

- CV submission for Admin review;
- CV approval, rejection, correction, comments, reviewer, or verification;
- Estimated/planned/projected GPA;
- Student academic-record mutation;
- company login or company portal;
- AI scoring, ranking, match percentage, or automated selection;
- project approval or verification;
- Admin Skill Master or taxonomy mutation;
- GPA persistence inside internship-request schemas.

Negative-control descriptions may explicitly say that a forbidden workflow is absent. Such wording does not create active contract functionality.

## 12. Validation commands and results

### YAML parsing

- `ruamel.yaml` safe parse with duplicate-key rejection: **PASS**
- Independent `PyYAML.safe_load`: **PASS**

### Structural and compatibility validation

- `openapi: 3.1.1`: **PASS**
- `info.version: 1.4.0`: **PASS**
- Internal `$ref` pointers: **PASS — 1,451 references checked**
- Operation IDs present and unique: **PASS — 104/104**
- v1.3.0 operation IDs unchanged: **PASS**
- v1.3.0 paths preserved: **PASS**
- No body on `204`: **PASS**
- Target object schemas strict and required: **PASS**
- Typed academic/CV paged items: **PASS**
- Typed GPA source: **PASS**
- Controlled CV enums: **PASS**
- First-time freshness state: **PASS**
- LaTeX output: **PASS**
- Exact-preview save link: **PASS**
- PDF-only Student downloads and `Content-Disposition`: **PASS**
- Target GET response cleanup: **PASS**
- Student academic endpoints read-only: **PASS**
- Sprint 5 examples validated against JSON Schema: **PASS**
- Forbidden active fields: **PASS**

### External semantic linter

- `npx --no-install @redocly/cli lint ...`: **UNAVAILABLE** — package is not installed; no dependency was installed.
- `npx --no-install @stoplight/spectral-cli lint ...`: **UNAVAILABLE** — package is not installed; no dependency was installed.

## 13. Deferred non-Sprint-5 findings

- Existing later-sprint Admin operations still retain broad inherited error sets; they were not redesigned in this Sprint 5 contract-only revision.
- Some older non-Sprint-5 DTOs do not use the same strict required/additional-properties standard.
- The frontend repository’s OpenAPI generation and synchronization scripts remain pinned to v1.3.0 and must be updated when the frontend adopts v1.4.0. They were not edited because this task was contract-only.
- A third-party OpenAPI semantic linter should be added to CI through an approved dependency/change-control process.

None of these deferred items prevents Sprint 5 frontend implementation against the finalized Student paths.

## 14. Final contract-readiness verdict

# READY FOR SPRINT 5 FRONTEND IMPLEMENTATION

The v1.4.0 YAML parses successfully, all internal references resolve, all operation IDs remain stable and unique, targeted DTOs are strict and typed, academic and GPA empty states are explicit, CV preview/save semantics are atomic, PDF downloads are unambiguous, examples validate, and removed-scope functionality is absent from the active Sprint 5 contract.
