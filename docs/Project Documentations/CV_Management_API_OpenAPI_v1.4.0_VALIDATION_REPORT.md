# CV Management API OpenAPI v1.4.0 Validation Report

## 1. Validation identity

| Item | Value |
|---|---|
| Input contract | `CV_Management_API_OpenAPI_v1.3.0.yaml` |
| Output contract | `CV_Management_API_OpenAPI_v1.4.0.yaml` |
| OpenAPI version | `3.1.1` |
| API document version | `1.4.0` |
| Input canonical LF SHA-256 | `d920516cec8733e0011ea33e9be4abcad9554f5f7b6a97dd0599825cb462aa5e` |
| Output canonical LF SHA-256 | `e96b7cb2efbe84295753ff03924b747f90196ada4726d7eebd39fd64a3e83282` |
| Internal references checked | 1,451 |
| Operations checked | 104 |
| Automated checks | 51 passed, 0 failed |
| Frontend contract status | `READY` |
| Backend implementation status | `PENDING` |

## 2. Validation environment and commands

The contract was validated without installing or upgrading dependencies.

```bash
python /tmp/build_v140.py
python /tmp/validate_v140.py
sha256sum CV_Management_API_OpenAPI_v1.4.0.yaml
npx --no-install @redocly/cli lint CV_Management_API_OpenAPI_v1.4.0.yaml
npx --no-install @stoplight/spectral-cli lint CV_Management_API_OpenAPI_v1.4.0.yaml
```

The Python validation used:

- `ruamel.yaml` with duplicate-key rejection;
- `PyYAML.safe_load` as an independent parser;
- `jsonschema.Draft202012Validator` for Sprint 5 schema/example validation;
- custom JSON Pointer resolution for all internal `$ref` values;
- direct source/output comparison for paths and operation IDs.

## 3. Parsing and revision checks

| Check | Result | Evidence |
|---|---|---|
| Duplicate-key-rejecting YAML parse | PASS | `ruamel.yaml` parsed the complete document. |
| Independent YAML parse | PASS | `PyYAML.safe_load` parsed the complete document. |
| OpenAPI version | PASS | Exactly `3.1.1`. |
| API document version | PASS | Exactly `1.4.0`. |
| Revision status | PASS | `frontendContract: READY`, `backendImplementation: PENDING`. |
| Final checksum | PASS | `e96b7cb2efbe84295753ff03924b747f90196ada4726d7eebd39fd64a3e83282`. |
| Generated-client notes checksum reference | PASS | The v1.4.0 notes contain the same final checksum. |

## 4. Reference and operation checks

| Check | Result | Evidence |
|---|---|---|
| Internal `$ref` resolution | PASS | 1,451 references resolved; 0 unresolved. |
| Every operation has `operationId` | PASS | 104/104 operations. |
| Operation IDs unique | PASS | 104 unique values. |
| v1.3.0 operation IDs preserved | PASS | 0 changed. |
| v1.3.0 paths preserved | PASS | 0 removed. |
| No `204` response body | PASS | 0 violations. |
| Student `/me/...` Sprint 5 security | PASS | Explicit `bearerAuth` on all targeted operations. |

## 5. Sprint 5 schema strictness checks

Every listed object schema has `type: object`, `additionalProperties: false`, and an explicit non-empty `required` list.

| Schema | Strict object | Explicit required fields |
|---|---:|---:|
| `AcademicRecordResponse` | PASS | PASS |
| `PagedAcademicRecordResponse` | PASS | PASS |
| `AcademicRecordSourceResponse` | PASS | PASS |
| `GpaSummaryResponse` | PASS | PASS |
| `CvFreshnessResponse` | PASS | PASS |
| `CvPreviewConfigurationResponse` | PASS | PASS |
| `CvPreviewRequest` | PASS | PASS |
| `CvPreviewResponse` | PASS | PASS |
| `CvVersionCreateRequest` | PASS | PASS |
| `GeneratedFileMetadataResponse` | PASS | PASS |
| `CvVersionResponse` | PASS | PASS |
| `PagedCvVersionResponse` | PASS | PASS |

Additional type checks:

| Check | Result |
|---|---|
| `PagedAcademicRecordResponse.items` references `AcademicRecordResponse` | PASS |
| `PagedCvVersionResponse.items` references `CvVersionResponse` | PASS |
| `GpaSummaryResponse.source` uses typed `AcademicRecordSourceResponse` or `null` | PASS |
| Nullable GPA fields are explicit | PASS |
| Stable identifiers use UUID format | PASS |
| Timestamps use date-time format | PASS |
| Academic collection empty state is typed | PASS |
| CV-version collection empty state is typed | PASS |

## 6. CV contract checks

| Check | Result | Evidence |
|---|---|---|
| First-time freshness state | PASS | `CvFreshnessStatus` includes `NOT_SAVED`. |
| Current/outdated states | PASS | `CURRENT` and `OUTDATED` are controlled values. |
| Changed source areas controlled | PASS | `changedAreas` references `CvSourceArea`. |
| Section order controlled | PASS | `sectionOrder` references `CvSectionType`. |
| Duplicate sections prevented | PASS | `uniqueItems: true`. |
| Unsupported notes removed | PASS | No `notes` in preview/save DTOs. |
| No raw HTML/LaTeX request fields | PASS | Requests contain only controlled configuration or `previewId`. |
| Sanitized visual preview represented | PASS | `htmlPreview` safety requirements documented. |
| LaTeX output represented | PASS | Required `latexSource`. |
| Preview lifecycle represented | PASS | Required `previewId` and `expiresAt`. |
| Exact-preview save linkage | PASS | `CvVersionCreateRequest` contains only required `previewId`. |
| Saved version metadata typed | PASS | Version number, timestamps, download URL, freshness, and PDF metadata required. |
| Saved version cannot be `NOT_SAVED` | PASS | Version freshness enum is limited to `CURRENT`/`OUTDATED`. |
| CV history typed | PASS | Concrete `CvVersionResponse` items. |

## 7. Academic contract checks

| Check | Result | Evidence |
|---|---|---|
| Student academic endpoints read-only | PASS | Only `GET` exists under the targeted Student paths. |
| Concrete record fields | PASS | Code, title, credits, grade, grade point, period, attempt, status, commit time. |
| Official committed source | PASS | Contract descriptions and DTOs prohibit staging/editable data. |
| No-record collection behavior | PASS | `200` with empty items and valid page metadata. |
| GPA available behavior | PASS | Typed `AVAILABLE` state. |
| GPA unavailable behavior | PASS | Typed `NOT_AVAILABLE` with nullable value/source fields. |
| GPA source typed | PASS | Latest committed upload ID and commit timestamp. |
| No Student mutation fields | PASS | No editable status/action property. |
| No GPA field in internship-request schemas | PASS | 0 violations. |

## 8. Download checks

| Operation | PDF-only | Binary schema | `Content-Disposition` | Safe filename pattern |
|---|---:|---:|---:|---:|
| `GET /me/cv/versions/{cvVersionId}/download` | PASS | PASS | PASS | PASS |
| `GET /me/cv/latest/download` | PASS | PASS | PASS | PASS |

Additional results:

- `application/zip`: absent from both Student single-CV download operations.
- `application/octet-stream`: absent from both Student single-CV download operations.
- Error responses remain Problem Details JSON rather than PDF.
- No download operation changes save/freshness workflow state.
- No-saved-latest behavior uses stable `CV_NOT_SAVED` Problem Details.
- Temporarily unavailable PDF behavior uses stable `CV_FILE_UNAVAILABLE` Problem Details.

## 9. Response-status checks

| Check | Result |
|---|---|
| Target GET operations omit meaningless `412` | PASS |
| Target GET operations omit meaningless `415` | PASS |
| Target GET operations omit meaningless `422` | PASS |
| Preview uses `422` only for semantic configuration failure | PASS |
| Save uses `409` for expired/invalidated preview | PASS |
| Empty academic collection does not use `404` | PASS |
| GPA unavailable does not use `404` | PASS |
| No Sprint 5 `428` without required precondition | PASS |

## 10. Example validation

All Sprint 5 schema-level and operation-level JSON examples were validated against their OpenAPI 3.1 / JSON Schema definitions.

| Example group | Result |
|---|---|
| Academic records available | PASS |
| Academic records empty | PASS |
| GPA available | PASS |
| GPA unavailable | PASS |
| CV freshness `NOT_SAVED` | PASS |
| CV freshness `CURRENT` | PASS |
| CV freshness `OUTDATED` after profile change | PASS |
| CV freshness `OUTDATED` after skills/projects | PASS |
| Full CV preview request | PASS |
| Minimal CV preview request | PASS |
| CV preview success | PASS |
| Save exact preview request | PASS |
| Saved CV version response | PASS |
| CV-version page | PASS |
| Empty CV-version page | PASS |
| Targeted Problem Details examples | PASS through shared schema structure |

Automated example result: **0 validation failures**.

## 11. Removed-scope checks

The validation scanned active Sprint 5 schema properties and related request/response models for forbidden functional concepts.

| Forbidden active concept | Result |
|---|---|
| CV submission for Admin review | ABSENT |
| CV approval/rejection/correction/comment/reviewer state | ABSENT |
| Estimated/planned/projected GPA | ABSENT |
| Student academic mutation | ABSENT |
| AI score/rank/match percentage | ABSENT |
| Project approval/verification | ABSENT |
| Company login/account behavior | ABSENT |
| GPA inside internship-request DTOs | ABSENT |
| Unsupported free-form CV notes | ABSENT |

Descriptions may state that a forbidden workflow does not exist. These negative-control statements are not active transport behavior.

## 12. Full automated result list

The custom validator returned **51 PASS, 0 FAIL**:

1. Independent PyYAML parse — PASS
2. OpenAPI version 3.1.1 — PASS
3. API document version 1.4.0 — PASS
4. All internal `$ref` values resolve — PASS
5. Every operation has an operation ID — PASS
6. Operation IDs are unique — PASS
7. All v1.3 operation IDs are preserved — PASS
8. No v1.3 paths are removed — PASS
9. No `204` response has a body — PASS
10. Version-specific Student download is PDF-only — PASS
11. Version-specific download documents `Content-Disposition` — PASS
12. Latest Student download is PDF-only — PASS
13. Latest download documents `Content-Disposition` — PASS
14. Academic paged items are typed — PASS
15. CV-version paged items are typed — PASS
16. GPA source is typed — PASS
17–40. Twelve target object schemas each pass strict-object and required-field checks — PASS
41. Freshness includes `NOT_SAVED` — PASS
42. CV sections are controlled — PASS
43. Changed source areas are controlled — PASS
44. LaTeX source is represented — PASS
45. Save request links the exact preview — PASS
46. Unsupported notes are absent — PASS
47. Target GETs omit meaningless `412`/`415`/`422` — PASS
48. Student academic endpoints are read-only — PASS
49. Internship-request schemas contain no GPA fields — PASS
50. Sprint 5 schemas contain no forbidden active fields — PASS
51. Sprint 5 examples validate against schemas — PASS

## 13. Unavailable checks

| Tool | Result | Reason |
|---|---|---|
| Redocly CLI | UNAVAILABLE | `@redocly/cli` is not installed; `npx --no-install` refused to fetch it. |
| Spectral CLI | UNAVAILABLE | `@stoplight/spectral-cli` is not installed; `npx --no-install` refused to fetch it. |

No package was installed or upgraded. These checks are not reported as passed.

## 14. Deferred checks and changes

- The frontend repository synchronization and generation scripts remain pinned to OpenAPI v1.3.0. Updating them is a separate frontend adoption task.
- Existing later-sprint Admin paths and unrelated older schemas were not broadly redesigned.
- An approved semantic linter should be added to CI in a controlled dependency change.

These items do not leave a Sprint 5 frontend transport ambiguity.

## 15. Final verdict

# READY FOR SPRINT 5 FRONTEND IMPLEMENTATION
