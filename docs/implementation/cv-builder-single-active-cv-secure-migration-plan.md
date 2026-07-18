# CV Builder Single-Active-CV Secure Migration Plan

Date: 2026-07-18  
Status: Proposed; documentation and contract approval required before implementation  
Target branch: `codex/cv-builder-single-active-cv`

## 1. Objective

Replace the configurable-order, immutable-history CV workflow with one Student-owned active CV while preserving backend-generated ATS output, explicit preview confirmation, secure PDF storage/download, freshness tracking, and Admin read-only access.

The Student workflow becomes:

1. Change optional section toggles and project selections; the UI updates immediately.
2. Generate a server-confirmed preview.
3. Save the preview, creating or replacing the Student's single active CV atomically.
4. Download the saved active PDF.

There is no Student-visible or API-visible CV history. Saving replaces the active CV record and creates no Admin-governed lifecycle.

## 2. Approval and document conflict

This request intentionally overrides current approved CV behavior and therefore cannot be implemented as a frontend-only adjustment.

OpenAPI v1.4.0 and the current Sprint 5 documentation require all of the following behaviors that this plan removes:

- client-controlled `sectionOrder`;
- `latexSource` in `CvPreviewResponse` and a visible LaTeX output panel;
- immutable saved versions and Student version-history endpoints;
- version-specific metadata and downloads.

Before code changes, approve and update the reduced-scope/SRS/UI/API/backend/database/ERD/workflow/use-case sources that govern CV behavior. The replacement authority must explicitly state:

- one active CV per Student;
- fixed server-controlled structural order;
- exactly five optional section toggles: Work Experience, Projects, Certificates, Awards and Honors, and Extracurricular Activities;
- no LaTeX source exposure in the UI or public API;
- no saved-version history;
- Admin read-only access to the active saved CV;
- bulk shortlist exports resolve the active saved CV;
- no Admin-governed CV lifecycle.

Because the checked-in backend CV module is placeholder-only and no CV Flyway migration exists, the repository can adopt the single-row model directly. If another deployed environment already has version data, use the compatibility migration in Section 8 rather than deleting data in place.

## 3. Final product semantics

### 3.1 Fixed structure

The backend, not the browser, owns the canonical order:

1. Identity and contact header — always included.
2. Professional Summary — always eligible.
3. Skills — always eligible.
4. Work Experience — optional.
5. Projects — optional.
6. Certificates — optional.
7. Awards and Honors — optional.
8. Extracurricular Activities — optional.
9. Academic Summary — always eligible.

Disabled optional sections are omitted. Enabled sections with no eligible records should also be omitted rather than emitting empty headings. The existing Profile `cvInclude` flag continues to decide which records inside Experience, Certificates, Awards, and Activities are eligible. Project IDs remain explicitly Student-selectable.

No request field may encode or reorder the canonical structure.

### 3.2 Immediate UI behavior

“Real-time” means checkbox and selection changes are reflected immediately in local UI state and immediately mark any existing preview as stale. It does not mean implicit generation, implicit persistence, or auto-save: those would contradict the explicit Generate Preview → Save CV workflow and could create costly or surprising writes.

Admin and export consumers see the new active CV on their next authorized request. Use no-store responses and refetch-on-focus/before-download to prevent stale screens. Cross-session push updates via SSE/WebSocket are not included; if live updates without a request are required, that is a separate approved infrastructure change.

## 4. API contract migration

Publish a new canonical OpenAPI revision before frontend/backend implementation. Since this is pre-release and the CV backend is not active, the `/api/v1` namespace can remain if project governance approves the breaking revision. Otherwise introduce `/api/v2`.

### 4.1 Preview request

Keep `POST /me/cv/preview`, but replace ordered sections with strict toggle configuration:

```json
{
  "optionalSections": {
    "experience": true,
    "projects": true,
    "certificates": true,
    "awards": true,
    "activities": true
  },
  "includedProjectIds": ["660e8400-e29b-41d4-a716-446655440001"]
}
```

Contract rules:

- all five booleans are required;
- `additionalProperties: false` applies at every level;
- project IDs must be unique and Student-owned;
- `projects: false` requires `includedProjectIds: []`;
- the server applies canonical order regardless of JSON property order;
- the request accepts no HTML, LaTeX, PDF, owner ID, or governance field.

`CvPreviewResponse` retains `previewId`, sanitized `htmlPreview`, configuration, freshness, generation time, and expiry. Remove `latexSource`. LaTeX may remain an internal backend PDF-generation detail but is never returned to clients.

### 4.2 Single active CV resource

Add the following Student endpoints:

| Method | Endpoint          | Behavior                                                                                                                        |
| ------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/me/cv`          | Return active CV metadata and saved configuration; `404 CV_NOT_SAVED` when absent.                                              |
| `PUT`  | `/me/cv`          | Create or atomically replace the active CV using `{ "previewId": "..." }`. Return `201` on first save and `200` on replacement. |
| `GET`  | `/me/cv/download` | Download the active Student-owned PDF; `404 CV_NOT_SAVED` when absent.                                                          |

Concurrency rules:

- `GET /me/cv` returns an ETag derived from an integer `revision`.
- First creation requires `If-None-Match: *`.
- Replacement requires `If-Match: "<revision>"`.
- Missing preconditions return `428 PRECONDITION_REQUIRED`.
- A stale revision returns `412 STALE_VERSION` without replacing the current file.
- Retrying the same successful preview save must be idempotent and must not create duplicate files or audit events.

Replace `CvVersionResponse` with `CvResponse` containing only active-resource concepts: `cvId`, `revision`, `generatedAt`, `savedAt`, `updatedAt`, `freshnessStatus`, saved configuration, `downloadUrl`, and PDF metadata. Remove `versionNumber`, `versionLabel`, and `latest`.

### 4.3 Remove history endpoints

Remove from the canonical contract and generated client:

- `GET /me/cv/versions`;
- `GET /me/cv/versions/{cvVersionId}`;
- `GET /me/cv/versions/{cvVersionId}/download`;
- `POST /me/cv/versions` after `PUT /me/cv` is available.

`GET /me/cv/latest/download` may remain as a temporarily deprecated alias only when an already-deployed client requires a transition window. New code must use `/me/cv/download`.

### 4.4 Freshness contract

Keep `GET /me/cv/source-freshness`, but rename version-specific fields:

- `latestSavedCvVersionId` → `cvId`;
- `latestSavedAt` → `savedAt`.

Statuses remain `NOT_SAVED`, `CURRENT`, and `OUTDATED`. Source changes never mutate the saved PDF automatically; they mark it outdated until the Student explicitly previews and saves again.

### 4.5 Admin and export compatibility

Preserve the existing Admin routes to minimize downstream breakage:

- `GET /admin/students/{studentId}/latest-cv`;
- `GET /admin/students/{studentId}/latest-cv/download`.

Their schema changes from `CvVersionResponse` to `CvResponse`, and “latest” resolves the unique active CV. Admin access remains read/download only, enforced by backend RBAC. Bulk shortlist export routes remain stable and resolve each selected Student's active CV.

Admin and Student PDF responses must use `Content-Type: application/pdf`, a sanitized `Content-Disposition`, `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`, and authorization on every request.

## 5. Persistence design

Create the first CV Flyway migration only after the contract is approved.

### 5.1 `student_cvs`

Use one row per Student:

- `cv_id UUID PRIMARY KEY`;
- `student_id UUID NOT NULL UNIQUE` with ownership foreign key;
- `revision BIGINT NOT NULL` with optimistic locking;
- five non-null optional-section booleans;
- `source_fingerprint` or equivalent server-controlled freshness snapshot;
- generated PDF file-asset foreign key;
- `generated_at`, `saved_at`, `created_at`, and `updated_at` timestamps;
- optional saved-preview identifier for idempotency/audit correlation.

The unique `student_id` constraint is the database authority for the single-active-CV rule. Do not rely only on service checks.

### 5.2 Selected projects

Use a normalized `student_cv_projects` join table with `(cv_id, project_id)` uniqueness and ownership-safe foreign keys. Do not store arbitrary project payloads or client HTML. The PDF remains the immutable saved output for the active revision even if source projects later change.

### 5.3 Preview and file lifecycle

A preview record/cache entry must bind:

- preview ID;
- Student owner ID;
- strict configuration snapshot;
- source fingerprint;
- generated HTML/PDF or safe temporary file reference;
- expiry;
- consumed/idempotency state.

Saving must validate owner, expiry, source fingerprint, and configuration server-side. Generate a new opaque file asset, then transactionally swap the active row's file reference and revision. Delete the old file only after a successful commit through recoverable orphan cleanup; never delete the current PDF before the replacement is durable.

## 6. Backend implementation plan

1. Replace placeholder CV DTOs/entities/repositories with package-by-feature implementation.
2. Add strict request validation and canonical-order domain policy.
3. Implement owner-scoped preview generation without accepting generated content from clients.
4. Implement transactional single-row upsert with ETag/If-Match handling and idempotency.
5. Update freshness orchestration so Profile, declared skill, project, and relevant academic mutations mark the active CV outdated.
6. Update Student download, Admin metadata/download, and bulk export services to resolve `student_cvs.student_id`.
7. Add safe audit events for preview generation, Student save/update, Student download, Admin download, and bulk export. Never log preview bodies, PDF content, JWTs, or sensitive source payloads.
8. Apply rate limits to preview/save/download operations and bound PDF-generation resource usage.
9. Return standard Problem Details with stable codes; never return LaTeX/compiler logs or filesystem paths.

## 7. Frontend implementation plan

### 7.1 Configuration UI

Remove the `Included sections and order` fieldset, movement buttons, `sectionOrder` state, and ordering mapper.

Keep the five source groups in fixed visual order. Put an accessible inclusion checkbox in each group heading:

- Include Work Experience;
- Include Projects;
- Include Certificates;
- Include Awards and Honors;
- Include Extracurricular Activities.

The Projects group retains its existing per-project checkboxes. Disabling Projects retains selections locally for easy recovery but sends an empty project ID list to preview. The four Profile-owned groups remain read-only below their section checkbox and keep their Manage in Profile link; the CV Builder must not mutate Profile records.

On load:

- use the saved `GET /me/cv` configuration when an active CV exists;
- use documented defaults for a first-time Student;
- never overwrite locally dirty controls when a background refetch completes.

### 7.2 Preview and actions

Retain sanitized iframe preview, restrictive CSP, empty sandbox, no-referrer, expiry handling, and dirty-preview protection.

Remove `LatexOutputPanel`, its clipboard behavior, styles, mocks, and tests. Do not remove backend LaTeX/PDF generation internals unless separately approved.

Use action labels that match the new resource semantics:

- `Generate Preview` / `Update Preview`;
- `Save CV` for first save;
- `Update Saved CV` when replacing an existing active CV;
- `Download Saved PDF` after a successful save.

Download remains disabled when no active CV exists. Configuration changes mark the active CV outdated but do not silently overwrite it.

### 7.3 Remove history implementation

Remove `CvVersionList`, `useCvVersions`, version-list/detail query keys, selected-version download logic, paged version schemas/types/mappers, history fixtures/handlers, history CSS, and history tests.

Add a single active-CV query and mutation. After save, invalidate/refetch active CV metadata and freshness. Preserve the exact preview object until save succeeds; on 412/409, preserve controls and require the Student to inspect and regenerate rather than silently retrying with different content.

### 7.4 Admin UI

When the Admin registered-student detail page is implemented, add one read-only Saved CV card with generated/saved timestamps, freshness, file metadata, view/download actions, loading/empty/error states, and no mutation or governance controls.

Refetch on focus and immediately before download. A `404 CV_NOT_SAVED` is an empty state, not an application error. Backend RBAC remains the security authority.

## 8. Migration and deployment strategy

### Repository state with no deployed CV data

Implement the single-row schema directly; do not create a version-history table merely to remove it later.

### Contingency for environments with version data

1. Add `student_cvs` and related constraints additively.
2. Backfill exactly the row marked latest per Student; fail migration validation if a Student has multiple latest rows or broken file references.
3. Verify Student counts, file counts, ownership, checksums, and Admin/bulk-export resolution.
4. Deploy backend compatibility reads before the frontend switch.
5. Deploy frontend and Admin consumers of the active-CV endpoints.
6. Observe errors and audit events through a rollback window.
7. Archive or remove legacy history tables/endpoints only through a later approved migration. Do not delete historical files during the cutover transaction.

## 9. Test and acceptance matrix

### Contract and backend

- OpenAPI lint/sync and generated-client checks.
- Fixed order enforced even when request JSON order differs.
- All five toggle combinations and enabled-empty groups.
- Project ownership, duplicate IDs, and `projects: false` validation.
- Preview owner/expiry/source-invalidation enforcement.
- First create, update, idempotent retry, missing precondition, stale ETag, and concurrent-tab tests.
- One-row-per-Student repository and Flyway-from-empty tests.
- Transaction/file rollback and orphan-cleanup tests.
- Student owner isolation; Admin read-only RBAC; other-role denial.
- Admin current-CV and bulk-export resolution.
- Safe PDF headers, filename, caching, audit redaction, and rate limits.

### Frontend

- No Included Sections and Order UI or move controls.
- Five accessible section checkboxes in fixed order.
- Project section toggle plus per-project selection behavior.
- Immediate dirty state without auto-save or auto-generation.
- Saved configuration initialization and dirty-refetch preservation.
- No LaTeX output or clipboard action.
- No Saved CV Versions history or version-specific download.
- Preview sanitization, expiry, source-change, save/update, 412/409 recovery, and active-PDF download.
- Admin saved-CV loading/empty/error/download states without governance wording.
- Keyboard, screen reader, 320px/400% zoom, dark mode, and reduced-motion checks.
- Removed-scope scan and negative tests for any Admin-governed CV lifecycle.

### End-to-end acceptance

1. First-time Student configures toggles/projects, previews, saves, and downloads.
2. Returning Student loads saved configuration, changes it, updates preview, replaces active CV, and downloads the replacement.
3. Concurrent tabs cannot overwrite a newer saved CV.
4. Admin sees/downloads the replacement on the next request and cannot modify it.
5. Bulk export contains the active replacement and handles missing CVs safely.
6. Source changes make the saved CV outdated without changing its PDF until explicit save.

## 10. Conflict-avoidance and commit sequence

Create `codex/cv-builder-single-active-cv` from the agreed clean integration base after the existing remediation branch is merged or rebased. Preserve the current user-owned `e2e/student-skills.spec.ts` change and stage files explicitly.

Recommended commits:

1. `docs: approve single-active-cv workflow`
2. `docs(api): replace cv version history contract`
3. `feat(db): add single active student cv schema`
4. `feat(cv): implement fixed-order preview configuration`
5. `feat(cv): upsert active cv with optimistic locking`
6. `feat(admin): read and download active student cv`
7. `feat(frontend): add fixed-order cv section toggles`
8. `refactor(frontend): remove latex and cv history panels`
9. `test: cover active cv workflow and access boundaries`
10. `docs: record single-active-cv acceptance evidence`

Do not implement frontend contract assumptions before the canonical OpenAPI and governing documents are approved. Do not remove legacy persistence destructively in the same deployment that introduces the active resource.
