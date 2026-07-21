# Frontend Sprints 7 and 8 Implementation Plan

## 1. Plan purpose

This document defines the complete frontend implementation sequence for Sprints 7 and 8 of the CV Management and Deterministic Internship Candidate Filtering System.

It is a **development plan only**. It does not implement or modify production code. The work described below must be delivered as production-ready React and TypeScript code, integrated into the existing Sprint 6 frontend without breaking Sprints 1–6.

### Target routes

| Sprint | Page | Route |
|---|---|---|
| 7 | Student Deep-Dive | `/admin/students/:studentId` |
| 7 | Company and Internship Request Management | `/admin/internships` |
| 8 | Candidate Filtering Dashboard | `/admin/candidate-filtering` |
| 8 | Shortlist and Export Workflow | `/admin/shortlists` |

## 2. Governing source order

When requirements conflict, implementation decisions must follow this authority order:

1. Final Reduced Scope Baseline Document v1.1 and Scope Reductions
2. Software Requirements Specification v3.0.1
3. OpenAPI v1.6.0 YAML
4. Sprint 7–8 Contract Decision Register and Traceability Matrix
5. Backend Module Documentation and Database Design Document
6. Production-Ready Use Cases
7. Student/Admin Workflows
8. UI Frontend Specification v1.1
9. Frontend Folder Structure Implementation Plan v1.0
10. 45-Day Agile Sprint Implementation Plan
11. Admin and Student supporting descriptions
12. Original HTML wireframes
13. DESIGN.md for presentation only
14. Prototype mock data and legacy wording

The wireframes are layout and interaction references. Their embedded JavaScript arrays, Material Web Components, hardcoded data, unsupported fields, and obsolete wording must not be copied into production.

## 3. Locked scope guardrails

The frontend must not introduce any of the following:

- Admin approval of Student registration
- Pending or rejected registration states
- Temporary passwords
- Admin Skill Master or taxonomy mutation
- Verified skills or skill approval
- Estimated GPA
- CV submission, review, approval, rejection, correction, or comments
- Company login, company portal, or company user role
- AI score, AI ranking, match percentage, probability, recommendation, or weighted ranking
- Automated candidate selection
- Project approval, verification, or scoring
- Hard shortlist-capacity blocking
- GPA fields in internship request forms, DTOs, query models, mocks, or UI labels
- Frontend-only production persistence
- Hardcoded production candidate, company, request, shortlist, or export data

Required terminology:

- **Declared Skills**, not verified skills
- **Official GPA**, not Estimated GPA
- **Shortlist Guidance Value**, not hard capacity limit
- **Project Portfolio**, not submitted or approved projects
- **Latest Saved CV**, not submitted or approved CV
- **Deterministic filtering**, not AI matching

## 4. Current Sprint 6 frontend audit summary

The implementation plan starts from the following confirmed baseline:

- The project uses React, TypeScript, React Router, TanStack Query, Zod, MSW, Vitest, and Playwright.
- The existing feature-based architecture is suitable and must be preserved.
- Route constants already exist for all four Sprint 7–8 routes.
- `/admin/students/:studentId` is registered but currently renders a deferred Sprint 7 page.
- `/admin/internships`, `/admin/candidate-filtering`, and `/admin/shortlists` are not registered in the router or Admin navigation.
- The following feature folders already exist but are mostly empty scaffolding:
  - `student-management`
  - `internship-management`
  - `candidate-filtering`
  - `shortlists`
  - `exports`
- The current generated API metadata points to OpenAPI v1.5.0.
- OpenAPI v1.6.0 generated types, scripts, contract tests, decision records, and traceability documents are available in the attached contract package.
- The existing PDF download client only accepts `application/pdf`; Sprint 8 also requires `text/csv` and `application/zip`.
- Existing candidate-filtering and shortlist Playwright tests currently assert that their routes return Not Found. These tests must be replaced when the routes are activated.
- The existing shared UI already provides tables, search, sorting, pagination, loading boundaries, error/empty states, forms, modal focus management, confirmation dialogs, buttons, chips, skeleton primitives, dark mode, and reduced-motion support.
- The full Vitest command previously showed passing progress but did not reliably terminate in the review environment. Test teardown/open-handle behavior must be resolved before Sprint 8 is accepted.

## 5. Target frontend architecture

### 5.1 Layering rule

Every Sprint 7–8 feature must follow this sequence:

```text
OpenAPI v1.6 generated transport types
        ↓
Feature-owned Zod runtime schemas
        ↓
Feature-owned API wrappers
        ↓
Feature-owned mappers and UI types
        ↓
TanStack Query keys, queries, and mutations
        ↓
Page components and reusable feature components
        ↓
MSW handlers, unit tests, integration tests, and Playwright tests
```

Generated files must never be edited manually.

### 5.2 Feature ownership

| Feature | Responsibility |
|---|---|
| `student-management` | Registered Student list extension, read-only Student Deep-Dive, latest saved CV metadata and PDF download |
| `internship-management` | Company metadata, internship request lifecycle, required skill selection |
| `candidate-filtering` | Runtime deterministic criteria, filtering runs, paged candidate results, cross-page manual selection |
| `shortlists` | Draft shortlist creation/review, candidate mutations, guidance, finalization |
| `exports` | Export job creation, polling, warning display, CSV/ZIP download |
| `shared` | Generic infrastructure only: taxonomy read access, typed file downloading, common query/error/UI utilities |

Cross-feature imports must be avoided. Read-only skill taxonomy access should be extracted into shared infrastructure rather than making Admin features depend directly on `student-skills`.

### 5.3 Server-state rules

- All real data must come from backend APIs or MSW during tests.
- Search, filtering, sorting, and pagination must remain server-driven.
- Query keys must include every server query parameter.
- Request cancellation must use TanStack Query's `AbortSignal`.
- Read-after-write consistency must use query invalidation/refetch.
- `keepPreviousData` should be used for paged lists where preserving the previous page prevents layout instability.
- Zod contract failures must not be retried.
- Non-retryable 4xx errors must not loop.
- One retry may be used for transient 5xx/network failures, following existing project conventions.

## 6. OpenAPI v1.6.0 integration workstream

This workstream is the prerequisite for every Sprint 7 and Sprint 8 feature.

### Task API-01 — Install the canonical contract package

Actions:

- Add the OpenAPI v1.6.0 YAML to `docs/api/`.
- Add the v1.6.0 changelog and validation report.
- Add the Sprint 7–8 decision register and traceability matrix.
- Replace the generated-client notes with the v1.6.0 notes.
- Update the generated API README.
- Keep earlier contracts only as historical artifacts; v1.6.0 becomes the canonical active contract.

Acceptance criteria:

- Contract version is `1.6.0`.
- Contract path and checksum match the package.
- Sprint 1–6 paths and operation IDs remain unchanged.

**Commit:** `chore(api): install OpenAPI v1.6.0 Sprint 7-8 contract`

### Task API-02 — Synchronize generation and contract checks

Actions:

- Replace `scripts/generate-api-client.mjs` with the v1.6.0 generator.
- Replace `scripts/check-openapi-sync.mjs` with the v1.6.0 semantic checker.
- Update `scripts/verify-removed-scope.mjs` to allow only the approved v1.6.0 contract documentation contexts.
- Add the focused v1.6.0 contract test supplied in the package.
- Run `npm run openapi:generate`; do not manually copy-edit generated output.

Acceptance criteria:

- `src/shared/api/generated/cvManagementApi.client.ts` points to v1.6.0.
- Generated types include strict Student, company, request, filtering, shortlist, and export DTOs.
- `npm run openapi:check` passes.
- `npm run verify:scope` passes.

**Commit:** `chore(api): regenerate strict Sprint 7-8 transport metadata`

## 7. Shared infrastructure workstream

### Task SH-01 — Extract shared read-only skill taxonomy access

Actions:

- Create shared taxonomy API, schemas, types, query keys, and hooks under `src/shared/`.
- Support:
  - full taxonomy tree
  - paged clusters
  - paged categories
  - paged individual skills
  - server search and hierarchy filters
- Refactor `student-skills` to consume the shared taxonomy read layer without changing existing Student behavior.
- Reuse the same shared taxonomy hooks in internship request forms and candidate filtering.
- Do not add taxonomy create/update/delete operations.

Acceptance criteria:

- Student Skills regression tests still pass.
- Admin features do not import from `student-skills`.
- Taxonomy values are never hardcoded in production components.

**Commit:** `refactor(taxonomy): centralize read-only skill taxonomy access`

### Task SH-02 — Add typed multi-format download infrastructure

Actions:

- Keep the existing PDF download behavior compatible with Sprints 1–6.
- Add an additive generic authenticated file-download client supporting an explicit expected media type:
  - `application/pdf`
  - `text/csv`
  - `application/zip`
- Validate response media type and non-empty body.
- Parse and sanitize `Content-Disposition` filenames.
- Return blob, filename, content type, and content length.
- Preserve session-expiry behavior on `401`.
- Map non-JSON and malformed error bodies to safe Problem Details.
- Use the existing blob download utility for browser delivery.

Acceptance criteria:

- Existing Student CV download tests remain green.
- New tests reject incorrect content type and empty CSV/ZIP responses.
- No storage path or unsafe filename is exposed.

**Commit:** `feat(downloads): support authenticated PDF CSV and ZIP files`

### Task SH-03 — Add Sprint 7–8 skeletons and shared status presentation

Actions:

- Replace the minimal Student Deep-Dive skeleton with the wireframe-aligned identity/sidebar and section skeleton.
- Add:
  - `InternshipManagementSkeleton`
  - `CandidateFilteringSkeleton`
  - `ShortlistExportSkeleton`
- Add only genuinely reusable status treatments needed by multiple pages, such as stale-version recovery and export-job status display.
- Reuse current shared components rather than cloning page-specific alternatives.

Acceptance criteria:

- Skeletons use current light/dark tokens.
- Skeletons respect reduced motion.
- Route-level Suspense fallbacks match final page geometry.

**Commit:** `feat(ui): add Sprint 7-8 route skeletons and status patterns`

## 8. Sprint 7 plan — Admin inspection, companies, and requests

**Sprint objective:** Admin can inspect Student information read-only, access the latest saved CV, manage company metadata, and manage internship requests without GPA fields.

### 8.1 Student Deep-Dive

#### Task S7-STU-01 — Complete Student Deep-Dive runtime schemas and types

Implement strict schemas for:

- `AdminStudentDetailResponse`
- Student summary and profile
- CV-supporting data:
  - experiences
  - certificates
  - awards
  - activities
- `AdminLatestCvResponse`
- paged declared skills
- paged projects
- paged academic records
- GPA availability and nullable values

Create or extend:

- `studentManagementSchemas.ts`
- `studentManagementTypes.ts`
- dedicated deep-dive schemas/types when separation improves maintainability

Rules:

- Reject additional unsupported fields where project conventions permit strict objects.
- Represent `AVAILABLE` and `NOT_SAVED` explicitly.
- Do not create CV review status, skill verification status, or project approval status.

**Commit:** `feat(admin-students): add strict deep-dive runtime models`

#### Task S7-STU-02 — Implement Student Deep-Dive API wrappers and query keys

Add wrappers for:

| Operation | Endpoint |
|---|---|
| Student detail | `GET /admin/students/{studentId}` |
| Declared skills | `GET /admin/students/{studentId}/declared-skills` |
| Projects | `GET /admin/students/{studentId}/projects` |
| Academic records | `GET /admin/students/{studentId}/academic-records` |
| Latest CV metadata | `GET /admin/students/{studentId}/latest-cv` |
| Latest CV PDF | `GET /admin/students/{studentId}/latest-cv/download` |

Actions:

- Extend `studentManagementApi.ts`.
- Extend `studentManagementQueryKeys.ts` with detail, skills, projects, academics, and CV branches.
- Implement `useStudentDeepDive.ts` using independent queries so one subsection can retry without blanking the entire page.
- Add independent page/query state for paged skills, projects, and academic records.
- Use existing academic query parameters and the v1.6 contract's search/page/size/sort limits.

Acceptance criteria:

- Every endpoint response is Zod-validated.
- Requests are abortable.
- `404` on Student detail produces a route-level not-found state.
- CV metadata `NOT_SAVED` produces a neutral empty state, not an error.

**Commit:** `feat(admin-students): implement deep-dive API queries and pagination`

#### Task S7-STU-03 — Build the Student Deep-Dive page

Recreate the approved wireframe using React and the existing Admin shell.

Desktop layout:

- Sticky left identity panel containing:
  - Student name and identity
  - index number
  - degree/programme data available from contract
  - batch/current level where available
  - official GPA or explicit unavailable state
  - latest CV availability summary
- Right stacked read-only sections:
  - Profile Summary
  - Declared Skills
  - Project Portfolio
  - Academic Results
  - Work Experience
  - Credentials and Certifications
  - Awards and Achievements
  - Extracurricular Activities

Responsive layout:

- Collapse to one column.
- Move identity panel above content.
- Keep tables scroll-safe or convert to accessible compact rows using existing responsive patterns.

Component responsibilities:

- `ReadOnlyStudentProfile.tsx`
- `LatestSavedCvPanel.tsx`
- declared skill section
- project section
- academic records section
- CV-supporting-data sections
- back-to-roster action

The empty `StudentDeepDiveTabs.tsx` placeholder must not force an unapproved tab design. Replace it with a component matching the finalized stacked wireframe or remove it if unused.

Acceptance criteria:

- No edit, approve, verify, review, reject, comment, or save controls.
- Section-level loading, empty, and retry states are visible.
- External URLs are sanitized and open safely.
- Student ID remains route-derived and validated before requests.

**Commit:** `feat(admin-students): build read-only Student Deep-Dive UI`

#### Task S7-STU-04 — Implement latest saved CV view/download behavior

Actions:

- Display revision, saved/generated time, freshness status, filename, and file size when available.
- Provide an authenticated PDF download action only when `availability === AVAILABLE`.
- Use the server filename from `Content-Disposition`.
- Disable duplicate clicks while downloading.
- Show clear states for:
  - no saved CV
  - metadata unavailable
  - file unavailable at download time
  - unauthorized/session expired
  - transient download failure
- Treat the action as read-only and audit-sensitive.

Acceptance criteria:

- No CV history selector.
- No LaTeX source download.
- No CV review workflow.
- Response must be PDF and non-empty before browser download.

**Commit:** `feat(admin-students): add latest saved CV metadata and PDF download`

#### Task S7-STU-05 — Test Student Deep-Dive

Coverage:

- schema validation
- API query construction
- paged subsection behavior
- `NOT_SAVED` CV state
- PDF download success and failure
- read-only UI assertions
- Student not found
- forbidden access and session expiry
- Student-role route denial
- responsive and dark-mode smoke coverage
- removed-scope wording assertions

**Commit:** `test(admin-students): cover deep-dive and latest CV workflows`

### 8.2 Company metadata management

#### Task S7-COMP-01 — Implement company models, API, query keys, and URL state

Implement strict support for:

- `CompanyRequest`
- `CompanyUpdateRequest`
- `CompanyResponse`
- `PagedCompanyResponse`
- `CompanySort`

Endpoints:

| Action | Endpoint |
|---|---|
| List | `GET /admin/companies` |
| Create | `POST /admin/companies` |
| Detail | `GET /admin/companies/{companyId}` |
| Update/reactivate | `PATCH /admin/companies/{companyId}` |
| Soft deactivate | `DELETE /admin/companies/{companyId}` |

URL state:

- `companySearch`
- `companyActive` (`true`, `false`, or omitted for all)
- `companySort`
- `companyPage`
- `companySize`
- selected company identifier where useful for deep linking

Concurrency:

- Use `formatIfMatchVersion(company.version)` for PATCH and DELETE.
- Handle `412` with a stale-data message and refetch action.
- Handle `428` as a safe contract/precondition failure.
- Handle `409` when active linked requests prevent deactivation.

**Commit:** `feat(companies): implement company data layer and URL state`

#### Task S7-COMP-02 — Build company list, detail, create, edit, deactivate, and reactivate UI

Wireframe-aligned behavior:

- Searchable, paged company list
- Active/inactive/all filter
- Sort control
- Selected-company state
- Company detail modal/panel
- Create company modal
- Edit company modal
- Soft-deactivation confirmation
- Explicit reactivation through edit where supported

Fields:

- name
- website URL
- contact person
- contact email
- contact phone
- notes
- active state on update only

Validation:

- required and length constraints from contract
- valid email and URL formats
- normalize blank nullable fields to `null`
- never add industry or account credentials

Acceptance criteria:

- Inactive companies are visually distinct.
- Inactive companies cannot be selected for new internship requests.
- Mutations invalidate company lists, detail, and dependent request selectors.
- Deactivation is described as deactivation, not destructive deletion.

**Commit:** `feat(companies): build company management workspace`

### 8.3 Internship request management

#### Task S7-REQ-01 — Implement request schemas, types, API wrappers, and query keys

Models:

- `InternshipRequestCreateRequest`
- `InternshipRequestUpdateRequest`
- `InternshipRequestResponse`
- `InternshipRequestSummaryResponse`
- `InternshipRequiredSkillRequest`
- `InternshipRequiredSkillResponse`
- paged requests and paged required skills
- statuses: `DRAFT`, `ACTIVE`, `CLOSED`, `CANCELLED`
- work modes: `ONSITE`, `HYBRID`, `REMOTE`

Endpoints:

| Action | Endpoint |
|---|---|
| List | `GET /admin/internship-requests` |
| Create | `POST /admin/internship-requests` |
| Detail | `GET /admin/internship-requests/{requestId}` |
| Update | `PATCH /admin/internship-requests/{requestId}` |
| Cancel | `DELETE /admin/internship-requests/{requestId}` |
| List required skills | `GET /admin/internship-requests/{requestId}/required-skills` |
| Add required skill | `POST /admin/internship-requests/{requestId}/required-skills` |
| Remove required skill | `DELETE /admin/internship-requests/{requestId}/required-skills/{requiredSkillId}` |

Rules:

- Create sends the complete initial required-skill array.
- PATCH omits `requiredSkills` when unchanged.
- PATCH includes `requiredSkills` only when atomically replacing the full set.
- Nested add/remove wrappers remain available for approved incremental editing.
- Every mutable operation uses `If-Match`.
- No request schema, UI model, query string, fixture, or test may include GPA.

**Commit:** `feat(internships): implement request lifecycle and skill APIs`

#### Task S7-REQ-02 — Implement internship request URL state and server list behavior

URL state:

- `requestSearch`
- `requestStatus`
- `requestCompanyId`
- `requestSort`
- `requestPage`
- `requestSize`
- selected request identifier where useful

Rules:

- Reset request page when search/filter/sort/company changes.
- Debounce search using the existing shared hook.
- Keep previous page data during transitions.
- Clamp invalid page values after response metadata changes.

**Commit:** `feat(internships): add request list query and URL state management`

#### Task S7-REQ-03 — Build internship request forms and required-skill picker

Form fields:

- active company
- role title
- optional description
- optional location
- optional work mode
- lifecycle status
- optional shortlist guidance value
- optional notes
- required skills selected from API taxonomy
- optional required competency level per skill

Explicit exclusions:

- no minimum GPA
- no maximum GPA
- no GPA range
- no deadline, because it is not in the frozen v1.6.0 request contract
- no company credentials
- no Admin skill creation

Skill picker behavior:

- searchable three-level taxonomy:
  - Core Cluster
  - Skill Category
  - Individual Skill
- keyboard-accessible selection
- selected skill tokens
- duplicate prevention
- competency level selection only where the contract supports it
- server-backed search; no copied wireframe array

Validation:

- lower-level field validation from contract
- unique skill IDs
- guidance value is advisory and non-negative
- only valid lifecycle transitions should be offered; backend remains final authority

**Commit:** `feat(internships): build request forms and taxonomy skill picker`

#### Task S7-REQ-04 — Build the combined `/admin/internships` workspace

Page structure:

- Page header and actions
- Company search/filter/list section
- Selected company context
- Company create/edit/detail/deactivate dialogs
- Internship request search/filter/list section
- Request create/edit/detail/cancel dialogs
- Required-skill display and management
- Independent pagination for company and request lists

Wireframe corrections:

- Rename corporate-client wording to company metadata.
- Replace destructive company deletion with soft deactivation.
- Replace request deletion/archive wording with contract-approved cancellation/closure lifecycle.
- Replace maximum shortlist limit with advisory shortlist guidance value.
- Remove all GPA controls.

Acceptance criteria:

- Page remains usable with no selected company.
- New request flow requires an active company.
- Terminal requests are clearly marked and mutation controls are restricted.
- Conflict and stale-version recovery do not discard entered form data without warning.

**Commit:** `feat(internships): build combined company and request page`

#### Task S7-REQ-05 — Register Sprint 7 navigation and routes

Actions:

- Add lazy import for `InternshipManagementPage`.
- Register `/admin/internships` under `RequireAdmin` and `AdminLayout`.
- Use `InternshipManagementSkeleton` as Suspense fallback.
- Add Admin sidebar item for Internship Management.
- Ensure Registered Students continues to navigate to `/admin/students/:studentId`.
- Update route unit tests.

**Commit:** `feat(routes): activate Sprint 7 Admin internship workspace`

#### Task S7-REQ-06 — Test company and internship request workflows

Coverage:

- company list/search/filter/sort/pagination
- company create/update/deactivate/reactivate
- ETag/If-Match headers
- `409`, `412`, and `428` behavior
- request create/update/cancel
- status and work-mode enums
- atomic required-skill replacement
- duplicate taxonomy skill prevention
- no GPA field or payload property
- inactive company cannot be selected for new request
- Admin-only route access
- route loading/error/empty states
- responsive modal and keyboard behavior

**Commit:** `test(internships): cover company and request management`

### 8.4 Sprint 7 delivery schedule

| Day | Primary outcome | Required commits |
|---|---|---|
| Day 31 | OpenAPI v1.6.0 and shared foundations | API-01, API-02, SH-01, SH-02 |
| Day 32 | Student Deep-Dive data and page | S7-STU-01 to S7-STU-04 |
| Day 33 | Student tests and company management | S7-STU-05, S7-COMP-01, S7-COMP-02 |
| Day 34 | Internship request data and forms | S7-REQ-01 to S7-REQ-03 |
| Day 35 | Combined page, route integration, full Sprint 7 QA | S7-REQ-04 to S7-REQ-06, SH-03 if not completed earlier |

### 8.5 Sprint 7 Definition of Done

- `/admin/students/:studentId` is complete and read-only.
- Latest saved CV availability and PDF download work.
- `/admin/internships` is registered and present in Admin navigation.
- Company create, edit, soft deactivate, and explicit reactivate flows work.
- Internship request create, edit, lifecycle, cancel, and skill management work.
- No GPA request field exists anywhere.
- All responses are runtime-validated.
- All mutable resources use optimistic concurrency.
- Unit, integration, MSW, route, accessibility, and focused E2E tests pass.
- Sprints 1–6 regression gates remain green.

## 9. Sprint 8 plan — Filtering, shortlisting, finalization, and exports

**Sprint objective:** Admin can execute deterministic runtime filtering, manually select candidates, create/review a draft shortlist, finalize it after advisory guidance acknowledgement, and download authorized CSV/ZIP/PDF outputs.

### 9.1 Candidate filtering data layer

#### Task S8-FLT-01 — Implement filtering schemas and types

Models:

- `CandidateFilteringCriteriaRequest`
- `CandidateFilteringCriteriaResponse`
- `CandidateFilteringRunResponse`
- `CandidateFilteringCandidateResponse`
- `PagedCandidateFilteringCandidateResponse`
- `FilterSkillMatchMode`: `AND` or `OR`
- allowed candidate sorts:
  - `officialGpa,desc`
  - `officialGpa,asc`
  - `fullName,asc`
  - `indexNumber,asc`

Validation rules:

- GPA bounds are optional runtime values from `0.00` to `4.00`.
- Lower bound must not exceed upper bound.
- GPA values use at most two decimal places.
- Request-skill IDs and additional-skill IDs are unique.
- Candidate GPA is nullable.
- GPA availability must be represented explicitly.
- Cross-shortlist metadata is factual and non-blocking.
- No score, rank, recommendation, probability, or match percentage property may be accepted.

**Commit:** `feat(filtering): add strict deterministic filtering models`

#### Task S8-FLT-02 — Implement filtering API, query keys, and URL state

Endpoints:

| Action | Endpoint |
|---|---|
| Create filtering run | `POST /admin/candidate-filtering/runs` |
| Read filtering run | `GET /admin/candidate-filtering/runs/{filterRunId}` |
| Read paged candidates | `GET /admin/candidate-filtering/runs/{filterRunId}/candidates` |

URL state:

- `requestId`
- `minGpa`
- `maxGpa`
- repeated or safely serialized `requestSkillIds`
- repeated or safely serialized `additionalSkillIds`
- `matchMode`
- `runId`
- `candidateSearch`
- `candidateSort`
- `candidatePage`
- `candidateSize`

Behavior:

- Creating a run stores returned `runId` in the URL.
- Reloading with a valid `runId` restores run metadata and candidate results.
- Changing runtime criteria does not silently mutate the current persisted run; the user explicitly runs filtering again.
- Candidate page/search/sort changes reuse the same run.
- Changing request context clears candidate selection and stale run state.

**Commit:** `feat(filtering): implement filtering runs queries and URL state`

### 9.2 Candidate Filtering Dashboard UI

#### Task S8-FLT-03 — Build request selection and criteria panel

Wireframe-aligned left panel:

- Select Internship Request
- Active company/role/request context summary
- Optional minimum GPA
- Optional maximum GPA
- Request-required skill selection
- Additional taxonomy skill selection
- AND/OR matching mode
- Run Filtering action
- Reset criteria action

Rules:

- Prefer active requests for initial selection while allowing contract-approved contexts.
- Required request skills come from request data.
- Additional skills come from the shared taxonomy API.
- Runtime filters are not written back to the request.
- GPA controls appear only on this page.
- Controls remain keyboard accessible; use native inputs/selects or existing accessible shared components.

**Commit:** `feat(filtering): build request and runtime criteria panel`

#### Task S8-FLT-04 — Build candidate results table and detail interactions

Result fields allowed by contract:

- Student name
- index number
- official GPA or unavailable state
- matching declared skills
- total declared skill count
- latest saved CV availability
- existing active-shortlist indicator and count
- manual selection checkbox

Do not display:

- default rank
- project count unless a future contract adds it
- AI score
- match percentage
- recommendation
- equity warning unsupported by the contract

Behavior:

- server search, sorting, and pagination
- no-results state with deterministic wording
- independent loading/error states
- declared skill detail modal when the visible chip summary is truncated
- Student name may link to the Admin Student Deep-Dive
- latest CV indicator is informational; individual download may use the approved Admin CV endpoint where presented

**Commit:** `feat(filtering): build paged candidate results workspace`

#### Task S8-FLT-05 — Implement cross-page manual selection

Actions:

- Store selected Student IDs in page-level reducer/state keyed to the active filtering run.
- Preserve selection while paging, searching, and sorting within the same run.
- Reset selection when request or run changes.
- Provide:
  - selected count
  - selected-candidate review panel/modal
  - individual remove action
  - clear-all action
- Selection remains explicit; no candidate is auto-selected.
- Existing-active-shortlist indicators never block selection.

Acceptance criteria:

- Checkboxes reflect selection when a previously selected row reappears.
- A selection summary remains visible when selected rows are on another page.
- Keyboard and screen-reader labels include candidate identity.

**Commit:** `feat(filtering): add persistent manual candidate selection`

#### Task S8-FLT-06 — Create draft shortlist and batch-add selected candidates

Flow:

1. Admin reviews selected candidates.
2. Frontend calls `POST /admin/shortlists` with request ID and filtering run ID.
3. Frontend receives draft shortlist ID/version.
4. Frontend calls `POST /admin/shortlists/{shortlistId}/candidates` with selected Student IDs and `If-Match`.
5. Frontend reports added and already-present counts.
6. Frontend navigates to `/admin/shortlists` with the created shortlist selected.

Conflict behavior:

- One Version 1 shortlist is allowed per request.
- On duplicate creation `409`, do not attempt hidden duplicate resources.
- Display a clear existing-shortlist message and provide navigation to Shortlists.
- Use an existing shortlist identifier only when it is explicitly supplied and validated by the contract response/problem details; do not invent or scrape it.

Acceptance criteria:

- Empty selection cannot submit.
- Duplicate candidates are reported, not duplicated.
- Finalization does not occur on the filtering page.
- Remove the wireframe action wording “Confirm & Lock Final Shortlist” from this page.

**Commit:** `feat(filtering): hand off manual selections to draft shortlist`

#### Task S8-FLT-07 — Register and test Candidate Filtering

Actions:

- Add lazy import and protected route.
- Use `CandidateFilteringSkeleton`.
- Add Admin navigation item.
- Replace the stale Playwright Not Found test with the real workflow.

Coverage:

- URL parsing/serialization
- GPA validation and lower/upper ordering
- AND/OR mode
- request skill and additional skill arrays
- run creation
- paged results
- nullable GPA
- selection across pages
- batch draft handoff
- duplicate shortlist conflict
- no forbidden scoring/ranking fields or wording
- Student-role denial

**Commit:** `test(filtering): activate and cover deterministic filtering route`

### 9.3 Shortlist management

#### Task S8-SL-01 — Implement shortlist schemas, types, API wrappers, query keys, and URL state

Models:

- `ShortlistCreateRequest`
- `ShortlistResponse`
- `ShortlistDetailResponse`
- `ShortlistCandidateRequest`
- `ShortlistCandidateResponse`
- `ShortlistCandidateMutationResponse`
- `ShortlistFinalizeRequest`
- `ShortlistFinalizeResponse`
- statuses: `DRAFT`, `FINALIZED`

Endpoints:

| Action | Endpoint |
|---|---|
| List shortlists | `GET /admin/shortlists` |
| Create draft | `POST /admin/shortlists` |
| Read detail/candidates | `GET /admin/shortlists/{shortlistId}` |
| Batch add candidates | `POST /admin/shortlists/{shortlistId}/candidates` |
| Remove candidate | `DELETE /admin/shortlists/{shortlistId}/candidates/{studentId}` |
| Finalize | `POST /admin/shortlists/{shortlistId}/finalize` |

URL state:

- shortlist search
- status
- company ID
- sort
- page and size
- selected shortlist ID
- candidate search
- candidate sort
- candidate page and size
- summary and bulk export job IDs when active

Concurrency:

- Candidate add/remove and finalization use `If-Match` from current version.
- `412` triggers stale-state recovery and refetch.
- `409` maps to finalized/duplicate/guidance/state conflict messaging.
- `428` is treated as a precondition defect and safely reported.

**Commit:** `feat(shortlists): implement shortlist data and concurrency layer`

#### Task S8-SL-02 — Build shortlist list and detail workspace

Page structure:

- Search/filter/sort toolbar
- Company filter
- Status filter
- Paged shortlist list
- Selected shortlist summary
- Request and company context
- DRAFT/FINALIZED badge
- guidance value and selected count
- paged/searchable/sortable candidate table
- individual latest-CV availability/download action where approved
- draft candidate removal action
- finalized read-only state

Wireframe corrections:

- Remove default-rank wording.
- Do not infer ordering beyond supported sort values.
- Use one shortlist per request.
- Do not expose hidden scores.

Acceptance criteria:

- Candidate remove controls appear only for DRAFT.
- Finalized shortlists remain immutable.
- Candidate table uses server paging and search.
- Missing CV status is explicit and does not remove the candidate.

**Commit:** `feat(shortlists): build draft and finalized review workspace`

#### Task S8-SL-03 — Implement guidance warning and finalization

Components:

- `ShortlistGuidanceWarning.tsx`
- `FinalizeShortlistDialog.tsx`

Behavior:

- Display guidance value, selected count, exceeded state, and backend warning text.
- Guidance is advisory.
- When guidance is not exceeded, finalization may send `acknowledgeGuidanceWarning: false`.
- When guidance is exceeded, require explicit checkbox acknowledgement before submission.
- After acknowledgement, do not hard-block finalization.
- Allow optional finalization note if exposed in the dialog.
- On success, invalidate list/detail/candidates and render immutable FINALIZED state.
- On stale or concurrent finalization, refetch and explain the current server state.

Acceptance criteria:

- Only DRAFT can finalize.
- Repeat finalization does not silently mutate the shortlist.
- Warning acknowledgement is explicit and accessible.
- No capacity validation prevents an acknowledged finalization.

**Commit:** `feat(shortlists): add non-blocking guidance and finalization`

### 9.4 Export workflow

#### Task S8-EXP-01 — Implement export job models, API wrappers, and query keys

Models:

- `ShortlistSummaryExportCreateRequest` with `format: CSV`
- `BulkCvExportCreateRequest` with `format: ZIP`
- `ExportJobResponse`
- `MissingCvStudentResponse`
- `ExportWarningResponse`
- statuses:
  - `QUEUED`
  - `PROCESSING`
  - `COMPLETED`
  - `FAILED`
  - `CANCELLED`

Endpoints:

| Action | Endpoint |
|---|---|
| Start CSV summary | `POST /admin/exports/shortlists/{shortlistId}` |
| Start bulk ZIP | `POST /admin/exports/shortlists/{shortlistId}/bulk-cvs` |
| Read job | `GET /admin/exports/{exportJobId}` |
| Download CSV | `GET /admin/exports/{exportJobId}/download` |
| Download ZIP | `GET /admin/exports/{exportJobId}/bulk-cvs/download` |

Rules:

- Capture `Retry-After` from `202` responses where available.
- Poll only while `QUEUED` or `PROCESSING`.
- Stop polling for all terminal states.
- `downloadReady` and non-null download URL are required before enabling download.
- A partial bulk outcome is represented as `COMPLETED` plus warnings/missing-CV counts; do not invent a `PARTIALLY_COMPLETED` status.
- A zero-file bulk job fails safely.

**Commit:** `feat(exports): implement asynchronous CSV and ZIP export jobs`

#### Task S8-EXP-02 — Build export status and download UI

Implement `ShortlistExportPanel.tsx` with separate summary and bulk sections.

Display:

- export type
- status
- total candidate count
- included file count
- missing CV count
- missing Student list
- warnings
- failure code/message
- created/started/completed times
- expiry only when non-null
- download readiness

Behavior:

- Disable repeated start action while the same job is queued/processing.
- Preserve job IDs in URL state so a page reload can resume status polling.
- Allow a new job after terminal failure where the backend permits it.
- Download CSV with `text/csv` validation.
- Download ZIP with `application/zip` validation.
- Use safe server filenames.
- Keep shortlist state unchanged if exports fail.

Acceptance criteria:

- Missing CVs are never silently omitted.
- Export warnings are visible and accessible.
- Download controls remain disabled until ready.
- Expired/unavailable download returns a safe recovery message.

**Commit:** `feat(exports): build shortlist export polling and downloads`

#### Task S8-EXP-03 — Add individual CV downloads from shortlist candidates

Actions:

- For candidates with `hasLatestSavedCv`, use the approved Admin latest-CV PDF endpoint.
- Reuse the authenticated PDF download infrastructure.
- Disable the action for missing CVs with explanatory text.
- Keep individual downloads separate from bulk export-job state.

**Commit:** `feat(exports): add individual shortlist CV downloads`

### 9.5 Route integration and Sprint 8 tests

#### Task S8-ROUTE-01 — Activate Shortlists and complete Admin navigation

Actions:

- Register `/admin/shortlists` under `RequireAdmin`.
- Use `ShortlistExportSkeleton`.
- Add Shortlists navigation item.
- Ensure the Admin navigation order reflects workflow:
  1. Dashboard
  2. Academic Ledger
  3. Registered Students
  4. Internship Management
  5. Candidate Filtering
  6. Shortlists
- Update route tests and sidebar tests.

**Commit:** `feat(routes): activate Sprint 8 shortlist and export workflow`

#### Task S8-QA-01 — Add MSW fixtures and handlers

Create production-shape fixtures for:

- Student deep-dive and CV states
- active and inactive companies
- requests in every lifecycle state
- taxonomy selection
- filtering runs and nullable GPA candidates
- candidates already active in another shortlist
- draft and finalized shortlists
- guidance exceeded/not exceeded
- duplicate selection results
- export queued/processing/completed/failed/cancelled
- completed bulk export with missing CV warnings
- zero-file failure
- stale ETag/precondition errors

Rules:

- Fixtures must satisfy Zod schemas.
- Fixtures must not contain removed-scope fields.
- Do not use fixtures as production fallback data.

**Commit:** `test(mocks): add Sprint 7-8 contract-accurate MSW data`

#### Task S8-QA-02 — Unit and integration test matrix

Required tests:

- schema acceptance/rejection
- mappers and nullable values
- query key uniqueness
- URL parse/serialize round trips
- request cancellation
- mutation invalidation
- ETag/If-Match headers
- stale-version recovery
- form validation
- server paging/search/sort
- candidate selection persistence
- shortlist guidance acknowledgement
- finalized immutability
- export polling stop conditions
- CSV/ZIP media validation
- safe filename handling
- Problem Details mapping for `400`, `401`, `403`, `404`, `409`, `412`, `415`, `422`, `428`, `429`, `500`, and `503`

**Commit:** `test(frontend): add Sprint 7-8 unit and API integration coverage`

#### Task S8-QA-03 — End-to-end workflow tests

Replace stale route-not-found tests with real workflows:

1. Admin opens Student roster and Student Deep-Dive.
2. Admin downloads an available latest saved CV.
3. Admin creates/edits/deactivates a company.
4. Admin creates an internship request with taxonomy skills and no GPA field.
5. Admin selects the request on Candidate Filtering.
6. Admin applies runtime GPA and declared-skill criteria.
7. Candidate results render with no rank/score/match percentage.
8. Admin selects candidates across pages.
9. Admin creates a draft shortlist and batch-adds candidates.
10. Admin reviews and removes a draft candidate.
11. Admin acknowledges exceeded guidance and finalizes.
12. Finalized shortlist becomes read-only.
13. Admin starts CSV and bulk ZIP exports.
14. UI polls jobs and downloads completed files.
15. Missing-CV warnings are visible.

Also test:

- no-results filtering
- no saved CV
- stale company/request/shortlist version
- duplicate shortlist conflict
- export failure and retry
- Student role denied from every Admin route
- direct URL reload with preserved query state

**Commit:** `test(e2e): cover Sprint 7-8 Admin workflow`

#### Task S8-QA-04 — Accessibility, responsive, dark-mode, and visual verification

Verify:

- semantic headings and landmarks
- programmatic labels
- keyboard-operable filters and tables
- checkbox names include Student identity
- focus trap and focus return in every modal
- Escape handling except during protected in-flight mutation states
- aria-live status for downloads, mutations, and export polling
- table headers and responsive scroll behavior
- no information encoded by color alone
- desktop, tablet, and mobile layouts
- light and dark themes
- reduced-motion behavior
- skeleton/content visual snapshots where project conventions require them

**Commit:** `test(a11y): verify Sprint 7-8 responsive and theme behavior`

#### Task S8-QA-05 — Resolve full-test termination and run final gates

Actions:

- Identify and remove open handles, unclosed MSW servers, timers, polling intervals, query clients, or modal timers that prevent Vitest exit.
- Ensure export polling tests use fake timers or deterministic intervals.
- Run all repository gates from a clean install.

Required commands:

```bash
npm ci
npm run validate-env
npm run format:check
npm run lint
npm run typecheck
npm run openapi:check
npm run verify:scope
npm run test
npm run build
npm run e2e
```

Where configured, also run:

```bash
npm run test:coverage
npm run e2e:motion
npm run e2e:visual
npm run e2e:cross-browser
```

**Commit:** `chore(qa): close Sprint 7-8 quality gates`

### 9.6 Sprint 8 delivery schedule

| Day | Primary outcome | Required commits |
|---|---|---|
| Day 36 | Filtering models, APIs, URL state, criteria panel | S8-FLT-01 to S8-FLT-03 |
| Day 37 | Results, selection, draft handoff, route activation | S8-FLT-04 to S8-FLT-07 |
| Day 38 | Shortlist list/detail and candidate mutations | S8-SL-01, S8-SL-02 |
| Day 39 | Guidance, finalization, export jobs, downloads | S8-SL-03, S8-EXP-01 to S8-EXP-03, S8-ROUTE-01 |
| Day 40 | MSW, unit/integration/E2E, accessibility, full gates | S8-QA-01 to S8-QA-05 |

### 9.7 Sprint 8 Definition of Done

- `/admin/candidate-filtering` and `/admin/shortlists` are registered and protected.
- Filtering uses runtime official GPA and declared skills only.
- Filtering runs and candidate results are backend-driven and paginated.
- No AI-derived or ranking output exists.
- Candidate selection is fully manual and persists across result pages.
- A draft shortlist can be created and populated by explicit Admin action.
- Candidate add/remove operations are concurrency-protected.
- Guidance warnings are advisory and require acknowledgement only when exceeded.
- Finalized shortlists are immutable.
- CSV and ZIP exports are asynchronous and polled correctly.
- Partial bulk outcomes display completed status with missing-CV warnings.
- Individual PDF, summary CSV, and bulk ZIP downloads validate media type and non-empty content.
- All unit, integration, E2E, accessibility, scope, contract, type, lint, format, and build gates pass.

## 10. Query-key and invalidation plan

### Student management

```text
protected / student-management / students / detail / {studentId}
protected / student-management / students / {studentId} / declared-skills / {query}
protected / student-management / students / {studentId} / projects / {query}
protected / student-management / students / {studentId} / academic-records / {query}
protected / student-management / students / {studentId} / latest-cv
```

### Internship management

```text
protected / internship-management / companies / list / {query}
protected / internship-management / companies / detail / {companyId}
protected / internship-management / requests / list / {query}
protected / internship-management / requests / detail / {requestId}
protected / internship-management / requests / {requestId} / required-skills / {query}
```

### Candidate filtering

```text
protected / candidate-filtering / runs / detail / {runId}
protected / candidate-filtering / runs / {runId} / candidates / {query}
```

### Shortlists

```text
protected / shortlists / list / {query}
protected / shortlists / detail / {shortlistId} / {candidateQuery}
```

### Exports

```text
protected / exports / job / {exportJobId}
```

Invalidation rules:

- Company mutation invalidates company lists/detail and active-company selectors.
- Request mutation invalidates request lists/detail/required skills and request selectors used by filtering.
- Shortlist create invalidates shortlist lists.
- Candidate add/remove invalidates selected shortlist detail and list summary counts.
- Finalization invalidates shortlist list/detail and disables draft mutations.
- Starting an export seeds or invalidates the export job query but does not invalidate shortlist content.

## 11. Error and conflict UX plan

| Status/condition | Frontend behavior |
|---|---|
| `400` | Show safe request/form error; preserve user input |
| `401` | Use existing session-expiry flow and redirect to Admin login |
| `403` | Render unauthorized state without protected data |
| `404` | Show resource-specific not-found or unavailable state |
| `409` | Show lifecycle, duplicate, linked-resource, one-shortlist, finalized, or export-state conflict based on validated Problem Details |
| `412` | Show stale-version notice, refetch latest entity, require user to review before resubmitting |
| `415` | Show unsupported content/format error; this should be impossible from valid UI |
| `422` | Map field errors to form controls and form-level summary |
| `428` | Show missing-precondition failure and log as a frontend integration defect |
| `429` | Show rate-limit message and respect server retry guidance where available |
| `500`/`503` | Safe retryable error state with correlation ID when available |
| Zod parse failure | Non-retryable contract mismatch with safe UI message and diagnostic logging |
| Wrong/empty file | Do not download; show invalid download response error |

No raw stack trace, internal storage path, token, or unvalidated server message may be displayed.

## 12. File-level implementation map

The following map is directional; exact file splitting may be adjusted while preserving ownership and responsibilities.

### Existing files to complete or replace

```text
src/features/student-management/
  api/studentManagementApi.ts
  components/LatestSavedCvPanel.tsx
  components/ReadOnlyStudentProfile.tsx
  components/StudentDeepDiveTabs.tsx
  hooks/studentManagementQueryKeys.ts
  hooks/useStudentDeepDive.ts
  mappers/studentManagementMappers.ts
  pages/StudentDeepDivePage.tsx
  schemas/studentManagementSchemas.ts
  types/studentManagementTypes.ts

src/features/internship-management/
  api/internshipManagementApi.ts
  components/CompanyForm.tsx
  components/CompanyTable.tsx
  components/InternshipRequestForm.tsx
  components/InternshipRequestTable.tsx
  hooks/useCompanies.ts
  hooks/useInternshipRequests.ts
  pages/InternshipManagementPage.tsx
  schemas/internshipSchemas.ts

src/features/candidate-filtering/
  api/candidateFilteringApi.ts
  components/CandidateResultsTable.tsx
  components/CandidateSelectionPanel.tsx
  components/DeclaredSkillFilterPanel.tsx
  components/RuntimeGpaFilterPanel.tsx
  hooks/useCandidateFiltering.ts
  pages/CandidateFilteringPage.tsx
  schemas/candidateFilteringSchemas.ts

src/features/shortlists/
  api/shortlistsApi.ts
  components/FinalizeShortlistDialog.tsx
  components/ShortlistExportPanel.tsx
  components/ShortlistGuidanceWarning.tsx
  components/ShortlistReviewTable.tsx
  hooks/useShortlists.ts
  pages/ShortlistsPage.tsx

src/features/exports/
  api/exportsApi.ts
  hooks/useBulkCvExport.ts
  hooks/useDownloadFile.ts
  utils/fileDownload.ts
```

### Expected new feature files

```text
src/features/internship-management/
  hooks/internshipManagementQueryKeys.ts
  hooks/useInternshipManagementUrlState.ts
  mappers/internshipMappers.ts
  types/internshipTypes.ts
  tests/*

src/features/candidate-filtering/
  hooks/candidateFilteringQueryKeys.ts
  hooks/useCandidateFilteringUrlState.ts
  mappers/candidateFilteringMappers.ts
  types/candidateFilteringTypes.ts
  tests/*

src/features/shortlists/
  hooks/shortlistQueryKeys.ts
  hooks/useShortlistsUrlState.ts
  mappers/shortlistMappers.ts
  schemas/shortlistSchemas.ts
  types/shortlistTypes.ts
  tests/*

src/features/exports/
  hooks/exportQueryKeys.ts
  hooks/useExportJob.ts
  schemas/exportSchemas.ts
  types/exportTypes.ts
  tests/*
```

### Shared and app files to modify

```text
src/app/layouts/admin/adminNavigation.ts
src/app/router/lazyRoutes.ts
src/app/router/routes.tsx
src/app/router/__tests__/*
src/shared/api/httpDownloadClient.ts or additive generic file client
src/shared/api/generated/*
src/shared/hooks/* taxonomy additions
src/shared/skeletons/*
src/mocks/fixtures/*
src/mocks/handlers/*
e2e/candidate-filtering.spec.ts
e2e/shortlists-export.spec.ts
e2e/removed-scope-negative.spec.ts
scripts/check-openapi-sync.mjs
scripts/generate-api-client.mjs
scripts/verify-removed-scope.mjs
docs/api/* v1.6.0 artifacts
```

## 13. Commit discipline

Every task above must be committed separately using the provided commit subject or an equivalent conventional-commit message.

Rules:

- Each commit must be reviewable and buildable.
- Do not combine unrelated formatting or cleanup with feature logic.
- Do not commit generated files without the generator/script change that produces them.
- Add or update tests in the same commit as behavior where practical; dedicated test commits are acceptable when explicitly listed.
- Run targeted tests before each commit.
- Run complete gates at the end of each sprint.
- Never bypass a failing scope, type, lint, contract, or test gate by weakening validation.

## 14. Final acceptance checklist

### Contract and architecture

- [ ] OpenAPI v1.6.0 is canonical and synchronized.
- [ ] Generated files are deterministic and unedited.
- [ ] Feature-owned runtime schemas validate every Sprint 7–8 response.
- [ ] Shared taxonomy access is read-only and not duplicated.
- [ ] Existing Sprint 1–6 routes and behavior remain intact.

### Sprint 7

- [ ] Student Deep-Dive is complete and read-only.
- [ ] Latest saved CV metadata and PDF download work.
- [ ] Company list/create/edit/deactivate/reactivate work.
- [ ] Internship request list/create/edit/cancel work.
- [ ] Required skill selection is API-backed.
- [ ] No GPA request field exists.
- [ ] Concurrency and read-after-write behavior are tested.

### Sprint 8

- [ ] Candidate filtering is deterministic and runtime-only.
- [ ] GPA bounds and declared-skill AND/OR logic work.
- [ ] Results are paged, searchable, and sortable.
- [ ] Selection is manual and persists across pages.
- [ ] Draft shortlist creation and batch addition work.
- [ ] Draft candidate removal works.
- [ ] Guidance is non-blocking after acknowledgement.
- [ ] Finalized shortlists are immutable.
- [ ] CSV and ZIP export jobs poll and download correctly.
- [ ] Missing CV warnings are explicit.
- [ ] Individual latest-CV PDF download works where available.

### Quality and scope

- [ ] No removed-scope route, field, component, mock, payload, or wording exists.
- [ ] No AI score, rank, match percentage, recommendation, or automated selection exists.
- [ ] No company authentication exists.
- [ ] No Admin mutation of Student-owned data exists.
- [ ] No CV review or approval workflow exists.
- [ ] Accessibility, dark mode, responsive layouts, and reduced motion pass.
- [ ] Full Vitest suite terminates and passes.
- [ ] Playwright Admin Sprint 7–8 workflow passes.
- [ ] `validate-env`, format, lint, typecheck, OpenAPI, scope, build, and E2E gates pass.

## 15. Completion outcome

After this plan is executed, the frontend will provide the complete approved Sprint 7–8 Admin workflow:

```text
Registered Students
  → Student Deep-Dive and latest saved CV
  → Company and internship request management
  → Deterministic runtime candidate filtering
  → Manual draft shortlist creation
  → Shortlist review and guidance acknowledgement
  → Finalization
  → Individual PDF, summary CSV, and bulk CV ZIP downloads
```

The result must be production-ready, contract-accurate, fully tested, and limited to the locked Version 1 frontend scope.
