# CV Builder Record-Level Inclusion Correction Plan

Date: 2026-07-18
Status: Proposed; requires approval before implementation
Recommended branch: `codex/cv-builder-record-level-inclusion-fix`
Supersedes: the section-level checkbox and boolean-selection portions of `cv-builder-single-active-cv-secure-migration-plan.md`

## 1. Outcome

Correct the CV Builder so its five fixed groups contain item-level inclusion checkboxes, matching the original wireframe and the existing Projects interaction:

1. Work Experience — one checkbox per Student-owned experience record.
2. Projects — one checkbox per Student-owned project.
3. Certificates — one checkbox per Student-owned certificate.
4. Awards and Honors — one checkbox per Student-owned award.
5. Extracurricular Activities — one checkbox per Student-owned activity.

There are no master section checkboxes. A section is emitted only when its selected-record list is non-empty. The backend owns the fixed section order and never accepts an order field.

The previously approved single-active-CV decisions remain unchanged: explicit Generate Preview, conditional Save/Update, one saved PDF, Student download, Admin read-only access, no LaTeX output, no version history, and no Admin review lifecycle.

## 2. Sources and controlling decisions

This plan is based on:

- Final Reduced Scope Baseline v1.1 and Scope Reductions;
- SRS v3.0.1;
- UI Frontend Specification v1.1;
- API, backend, database, ERD, workflow, use-case, and folder-structure documentation;
- New DESIGN.md;
- `04_LaTeX_CV_Builder_Audit_and_Implementation_Plan.md`;
- the complete `09-latex-cv-builder-final.html` wireframe;
- the current OpenAPI v1.4.0 replacement contract;
- the current frontend and backend implementation on `codex/cv-builder-single-active-cv`.

The wireframe controls the checklist structure. The reduced-scope baseline controls removed features. The replacement contract must be corrected before implementation because its five section booleans cannot represent the wireframe behavior.

## 3. Correct product semantics

### 3.1 Fixed structure

The backend renders the CV in this order:

1. Identity and contact header — always included.
2. Professional Summary — included when eligible source content exists.
3. Skills — included when declared skills exist.
4. Work Experience — selected records only.
5. Projects — selected records only.
6. Certificates — selected records only.
7. Awards and Honors — selected records only.
8. Extracurricular Activities — selected records only.
9. Academic Summary — included when official academic data exists.

Empty optional groups are omitted without an empty heading. Record ordering inside each group is a backend policy based on documented date/title rules; request array order cannot affect output.

### 3.2 Selection authority

- The CV configuration owns the selected record IDs.
- Toggling a CV Builder checkbox must not PATCH or otherwise mutate the source Profile or Project record.
- On a Student's first visit with no active CV, existing source preferences (`cvInclude`/`includeInCv`) may initialize the draft once.
- When an active CV exists, its saved record-ID configuration initializes the draft.
- A background refetch must never overwrite locally dirty selections.
- Deleted or newly inaccessible selected records are removed from the draft with a visible warning; they must never be silently substituted.

### 3.3 Real-time behavior

Checkbox changes update local UI state immediately and mark any generated preview stale. They do not automatically call generation or persistence endpoints. This preserves the explicit workflow:

1. Select records.
2. Generate Preview.
3. Save CV or Update Saved CV.
4. Download Saved PDF.

Admin readers see the replacement on their next authorized request. No SSE, WebSocket, auto-save, or background PDF generation is introduced.

## 4. Corrected API contract

Publish a new canonical OpenAPI revision, preferably v1.4.1, instead of silently changing the committed v1.4.0 artifact. Keep the `/api/v1` route namespace only because this is a pre-release contract correction; use a new route version if any consumer has already shipped.

### 4.1 Preview request

Replace `optionalSections` and the project-only list with one strict record-selection object:

```json
{
  "includedExperienceIds": [],
  "includedProjectIds": [],
  "includedCertificateIds": [],
  "includedAwardIds": [],
  "includedActivityIds": []
}
```

Contract rules:

- all five arrays are required;
- each value is a UUID;
- `uniqueItems: true` and a documented maximum apply to every array;
- `additionalProperties: false` applies;
- empty arrays are valid and omit the corresponding section;
- no section booleans, section order, Student ID, generated HTML, LaTeX, PDF, source payload, or governance field is accepted;
- ownership/eligibility failures use one safe `422 INVALID_CV_CONFIGURATION` response that does not reveal whether another Student's record exists.

Use the same strict configuration schema in `CvPreviewResponse` and `CvResponse`. Remove `CvOptionalSections` from OpenAPI, generated types, runtime schemas, fixtures, and code.

### 4.2 Resource workflow

Keep these operations and semantics:

- `GET /me/cv/source-freshness`;
- `POST /me/cv/preview`;
- `GET /me/cv`;
- conditional `PUT /me/cv` with `{ "previewId": "..." }`;
- `GET /me/cv/download`;
- Admin read-only metadata/download routes resolving the same active CV.

Keep preview expiry, source-fingerprint validation, `If-None-Match: *`, `If-Match`, `428 PRECONDITION_REQUIRED`, `412 STALE_VERSION`, PDF-only downloads, no-store headers, and idempotent repeated saves of the same preview.

### 4.3 Contract synchronization

Update in one contract commit:

- canonical OpenAPI YAML, changelog, and validation report;
- synchronized documentation copy;
- deterministic hash/check script;
- generated TypeScript models/client notes;
- backend DTOs and contract tests only after the contract commit is approved.

The contract gate must reject `optionalSections`, `sectionOrder`, LaTeX output, history paths, and any missing selection array.

## 5. Backend prerequisites

The checked-in Profile, Projects, Skills, and Academic backend modules are still placeholder-heavy, and the current CV generator uses only eligible-student identity data. A production-ready correction therefore requires the real source persistence and ownership interfaces before the CV endpoint is enabled.

Required prerequisites:

- Experience, Certificate, Award, Activity, and Project tables with Student ownership, timestamps/revisions, and indexes;
- repository/application interfaces that can load all requested IDs for exactly one Student in bounded, set-based queries;
- declared-skill and academic summary read interfaces for always-eligible sections;
- stable `updated_at` or revision values for freshness fingerprints;
- source-module migrations merged before the CV selection migration.

Do not accept unchecked UUIDs, omit ownership validation, generate placeholder sections, or advertise a complete ATS PDF while these prerequisites are absent.

## 6. Safe database migration

`V009__create_single_active_cv_schema.sql` is already committed. Do not edit it. Add a new Flyway migration using the next conflict-free version after the source-table migrations.

### 6.1 Selection tables

Add normalized preview and active-CV selection tables for:

- experiences;
- projects;
- certificates;
- awards;
- activities.

Use separate relational tables rather than JSONB or a polymorphic record table so foreign keys remain enforceable. Each table must have a composite primary key preventing duplicates and ownership-safe foreign keys tying the selected source record and preview/CV to the same Student. Add indexes for preview/CV lookup and source-reference cleanup.

### 6.2 Existing data transition

Treat environments separately:

- If no CV data has been deployed, create the new tables and stop writing the five boolean columns; retain the columns temporarily for rollback compatibility.
- If data exists, preserve every saved PDF. Backfill project selections from the existing join tables. For a true legacy boolean, backfill the exact currently eligible Student-owned records only after recording migration counts and discrepancies. Do not regenerate PDFs or infer a different saved document.
- Deploy dual-read compatibility only for the rollback window. New writes use record selections exclusively.
- Drop boolean columns and obsolete code only in a later migration after verification; never combine destructive cleanup with the corrective rollout.

Migration verification must compare Student counts, active-CV counts, selection counts, ownership, broken foreign keys, file checksums, and Admin download resolution.

## 7. Backend implementation

### 7.1 Validation and canonical model

1. Parse strict bounded arrays and reject duplicates.
2. Resolve the Student exclusively from the authenticated actor.
3. Load each requested collection using owner-scoped set queries.
4. Compare requested and returned ID sets; reject the entire request on any mismatch.
5. Build one immutable server-side `CvSourceSnapshot` containing only validated source data.
6. Sort sections and records using server policy.
7. Generate HTML preview and PDF from the same snapshot.

No repository method may accept a client-supplied owner ID for `/me` operations. Avoid N+1 queries and cap total records, rendered text length, generation time, and output size.

### 7.2 Preview, save, and freshness

- Persist the five validated selection sets with the preview.
- Fingerprint selected record IDs plus their revisions/timestamps, identity/profile, declared skills, and academic data.
- On save, re-evaluate ownership, preview expiry, and source fingerprint before swapping the active file.
- Atomically replace the active CV row and all five active selection sets under optimistic locking.
- Keep the previous PDF until the database transaction commits; remove orphaned files through recoverable cleanup.
- Mark freshness by accurate changed areas rather than the current Profile-only fallback.
- A source deletion/update makes the active CV OUTDATED but does not mutate its saved PDF.

### 7.3 PDF and preview security

- Escape all source text for the renderer context.
- Do not execute or accept Student HTML/LaTeX.
- Produce parser-friendly text, deterministic headings, selectable text, and no decorative tables/images that damage ATS parsing.
- Return sanitized HTML and render it client-side with allow-list sanitization, CSP, sandbox, and no-referrer defense in depth.
- Store PDFs under opaque keys outside the public web root; validate canonical paths and checksums.
- Apply preview/save/download rate limits and safe audit events without logging source bodies, tokens, paths, or file content.

### 7.4 Admin boundary

Admin can read metadata and download only the saved active PDF. Admin cannot change selections, generate previews, save, review, approve, reject, or correct a Student CV. Enforce this in controllers/services and negative security tests.

## 8. Frontend implementation

### 8.1 State model

Replace `optionalSections` with five selected-ID sets. Keep them in a reducer or focused hook that provides deterministic toggle, initialization, source-reconciliation, dirty-state, and request-serialization behavior. Serialize sorted arrays to make equality and tests stable.

Initialization waits for both active-CV resolution and all five source queries:

- active CV present: load its saved selections, intersect with accessible source IDs, and report removed IDs;
- no active CV: initialize once from source `cvInclude`/`includeInCv` preferences;
- local state dirty: never reset it from refetches.

Disable Generate Preview while any required source query is pending or failed. An error must not be mistaken for an empty selection.

### 8.2 Checklist UI

Rebuild `CvConfigurationPanel` as the fixed five-group dashboard from the wireframe:

- headings are plain headings/legends, not checkbox labels;
- every record row has one native accessible checkbox and a clear record label;
- Projects uses the same row component and behavior as the other groups;
- loading, error/retry, and empty states exist independently per group;
- optional Manage in Profile/Projects links may remain, but toggling never navigates or mutates source records;
- do not add Select All, drag/reorder, master toggles, hidden defaults, or unsupported convenience controls.

Use semantic fieldsets/lists, full-row labels, visible focus, keyboard-safe interaction, screen-reader group names, responsive stacking, dark-mode tokens, and reduced-motion behavior.

### 8.3 Preview and actions

- Every checkbox change immediately marks the preview dirty/stale.
- Generate Preview sends the five selected-ID arrays.
- Preview success clears draft dirtiness for that exact request snapshot.
- A later toggle cannot be saved using the old preview.
- Save/Update keeps the existing ETag workflow and preserves controls on 409/412 errors.
- Download is available only for the saved active PDF.
- Keep LaTeX output, version history, ordering controls, and Admin submission absent.

Sanitize backend HTML with an allow-list before composing iframe `srcDoc`; retain restrictive CSP, empty sandbox, and `referrerpolicy="no-referrer"`.

## 9. Testing and acceptance evidence

### 9.1 Contract and database

- OpenAPI parse/lint/sync and generated-type checks.
- Strict five-array request; duplicates, unknown fields, malformed IDs, and limits rejected.
- Flyway from empty PostgreSQL and upgrade from V009 with representative existing data.
- Foreign-key and database ownership isolation tests.
- One active CV per Student and no history tables/endpoints.

### 9.2 Backend

- Mixed owned/foreign/missing IDs fail atomically without information disclosure.
- Each group can be empty, partially selected, or fully selected.
- Request array order cannot change output order.
- Fixed section order and deterministic within-section ordering.
- Selected content appears; unselected content never appears in HTML or PDF.
- Source changes between preview and save invalidate the preview.
- Correct freshness areas for Profile, Skills, Projects, and Academics.
- First save, replacement, idempotent retry, missing/stale preconditions, and concurrent tabs.
- Student isolation, Admin read-only access, PDF headers, checksum/path safety, rate limits, audit redaction, rollback, and orphan cleanup.
- ATS extraction test proves expected headings/text order from the generated PDF.

### 9.3 Frontend

- Exactly five fixed groups and no group-heading/master checkbox.
- One checkbox per returned record in every group.
- First-time defaults and saved-configuration restoration.
- Immediate dirty state, no auto-generation, and no auto-save.
- Selected arrays are exact, sorted, unique, and unchanged by source response order.
- Loading/error cannot silently become empty selection.
- Deleted-source reconciliation warning and dirty-refetch preservation.
- Preview expiry, malicious markup sanitization, 409/412 recovery, save/update, and saved PDF download.
- Keyboard, screen reader, 320px layout, 400% zoom, dark mode, and reduced motion.
- Negative assertions for order controls, master section toggles, LaTeX, history, and Admin review wording.

### 9.4 End-to-end

1. First-time Student selects individual records in all five groups, previews, saves, and downloads.
2. Returning Student restores saved selections, changes individual records, regenerates, replaces, and downloads.
3. Deselecting every item in one group omits only that section.
4. Concurrent tabs cannot overwrite a newer CV.
5. Admin sees/downloads the newly saved CV and has no mutation controls.
6. A source update marks the saved CV outdated without changing its stored PDF.

Required gates: format, lint, strict typecheck, OpenAPI sync, removed-scope scan, frontend tests, backend tests, PostgreSQL Flyway integration, production builds, scoped E2E, and `git diff --check`.

## 10. Conflict-safe delivery sequence

Create `codex/cv-builder-record-level-inclusion-fix` from the current feature-branch heads in both repositories. Do not rewrite the existing commits; use corrective commits so the review trail remains explicit. Before switching, preserve the unrelated frontend `e2e/student-skills.spec.ts` change and the backend v1.2/v1.3 documentation changes. Stage files explicitly.

Recommended commits:

1. `docs: correct cv builder inclusion semantics`
2. `docs(api): add record-level cv selection contract`
3. `feat(db): add active cv record selection tables`
4. `feat(cv): validate and snapshot student-owned selections`
5. `feat(cv): render fixed-order ats cv from source records`
6. `fix(frontend): render item-level cv inclusion checklists`
7. `test(cv): cover selection ownership and active cv workflow`
8. `docs: record cv builder acceptance evidence`

Deploy in this order: source schemas/services, corrected contract, additive database migration, backend compatibility/readiness, frontend, Admin consumer verification, then later cleanup. Do not deploy the corrected frontend before the backend accepts the new contract.

## 11. Rollback and observability

- Keep current saved PDFs and boolean columns through the rollback window.
- Roll back frontend and backend together to avoid contract mismatch.
- Never roll back by deleting new selection rows or current files.
- Monitor preview/save/download status rates, 409/412/422 counts, generation duration, output size, orphan cleanup, and Admin download failures.
- Use correlation IDs and structured audit event names without sensitive payloads.
- Define rollback thresholds before deployment and verify a restored active PDF after rollback rehearsal.

## 12. Definition of done

The correction is complete only when:

- the approved contract contains five record-ID arrays and no section booleans;
- the UI has record-level checkboxes with no master checkboxes;
- every ID is validated as Student-owned before generation;
- the preview and PDF contain only selected records in fixed order;
- the saved active CV restores the exact selection configuration;
- source changes produce accurate freshness without mutating the saved PDF;
- Admin access remains read-only;
- live PostgreSQL migration and all required gates pass;
- no LaTeX output, history, ordering, review, approval, or other removed-scope behavior is reintroduced;
- unrelated worktree changes remain untouched;
- acceptance evidence documents commands, results, migration checks, security cases, and known operational limits.
