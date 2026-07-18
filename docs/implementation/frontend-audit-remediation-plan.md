# Frontend Student Workspace Audit Remediation Plan

## 1. Plan Control

| Item                 | Value                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Planning branch      | `codex/frontend-audit-remediation-plan`                                                           |
| Branch base          | `00e66de` (`feature/sprint-5-cv-builder-academic-view`)                                           |
| Scope                | Student Profile, Declared Skills, Projects, CV Builder, and Academic Records frontend corrections |
| Contract             | OpenAPI v1.4.0; no endpoint or DTO expansion is planned                                           |
| Existing user change | `e2e/student-skills.spec.ts` contains uncommitted toast-dismiss steps and must be preserved       |
| Implementation style | Small dependency-ordered commits; no framework, routing, API, or feature-scope rewrite            |

This plan consolidates the five replacement audit reports and validates them against the current checkout. It is intentionally narrower than the reports where a reported issue is already closed or where an API change would exceed the approved Version 1 contract.

## 2. Documents Audited

The following audit reports were read in full:

- `01_Student_Profile_Audit_and_Implementation_Plan.md`
- `02_Declared_Skills_Audit_and_Implementation_Plan.md`
- `03_Projects_Audit_and_Implementation_Plan.md`
- `04_LaTeX_CV_Builder_Audit_and_Implementation_Plan.md`
- `05_Academic_Records_Audit_and_Implementation_Plan.md`

The findings were cross-checked against the governing project sources available in the repository:

- Final Reduced Scope Baseline Document v1.1
- Scope reductions.docx
- Software Requirements Specification v3.0.1
- UI Frontend Specification v1.1
- API Specification Document v1.0
- OpenAPI v1.4.0 YAML, changelog, validation report, and generated-client notes
- Student and Admin Workflow Document v1.0
- Production-Ready Use-Case Documentation v1.0
- Frontend Folder Structure Implementation Plan v1.0
- New DESIGN.md
- Student.docx and finalized Student wireframes as supporting evidence
- Skill List Breakdown.pdf only as the taxonomy-structure reference

Authority remains: reduced-scope baseline and reductions first, then SRS, then the applicable API/UI/workflow sources. Wireframes and design references do not override the final API or reintroduce removed scope.

## 3. Current-State Validation

### 3.1 Already resolved; do not reimplement

The five reports share a High/P0 finding that the canonical OpenAPI files are missing. That finding is stale in this checkout.

- All four v1.4.0 artifacts exist under `docs/api`.
- `npm.cmd run openapi:check` passes with: `OpenAPI v1.4.0 contract and deterministic metadata are synchronized.`
- No OpenAPI restoration, generated-client regeneration, checksum change, endpoint change, or DTO extension belongs in this remediation unless a later code change proves an actual contract mismatch.

This closes `PROFILE-002`, `SKILLS-004`, `PROJECTS-004`, `CV-004`, and `ACADEMICS-002` for planning purposes.

### 3.2 Confirmed frontend findings

| Area             | Finding                                                                 | Current evidence                                                                                       | Planned disposition                                                                          |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Profile          | Regex-only date parsing accepts impossible calendar dates.              | `profileEntrySchemas.ts` uses only `YYYY-MM-DD` regex validation.                                      | Implement and test calendar-valid date-only parsing.                                         |
| Skills           | Add, browse, and declared-skill tasks are not clearly separated.        | Browse cards also act as the Individual Skill control inside one card.                                 | Create distinct Add Skill, Available System Skills, and Declared Skills sections.            |
| Skills           | Declared rows omit taxonomy lineage.                                    | `DeclaredSkillResponse` has no lineage, while `/skill-taxonomy` provides the full canonical hierarchy. | Enrich UI from the existing full taxonomy query; do not change the DTO.                      |
| Skills           | Duplicate prevention only knows declared IDs from visited result pages. | `knownDeclaredSkillIds` accumulates current page items.                                                | Add an all-pages declared-ID query and retain backend `409` as final protection.             |
| Projects         | Ongoing status is implicit in an empty end date.                        | No labelled ongoing control exists.                                                                    | Add UI-only state that maps to `endDate: null`; add no API field.                            |
| Projects         | Empty results can show both EmptyState and repository/table/pager.      | Page renders EmptyState and `ProjectRepository` whenever a response exists.                            | Make toolbar, empty content, table/cards, and pager one mutually exclusive repository state. |
| Projects         | Deferred Sprint 1 API boundary remains.                                 | `studentProjectsApi.ts` imports/exports `createSprintOneDeferredApi`.                                  | Remove dead import/export after consumer search.                                             |
| CV Builder       | Configuration omits grouped visibility for non-project source records.  | Only section order and project checkboxes are shown.                                                   | Add read-only grouped summaries and Profile management links using existing owned APIs.      |
| CV Builder       | Preview HTML is inserted into `srcDoc` without client sanitization.     | Sandbox and CSP exist, but `htmlPreview` is interpolated raw.                                          | Add explicit allow-list sanitization while preserving sandbox/CSP/no-referrer.               |
| CV Builder       | Empty history renders a zero-page pager.                                | `CvVersionList` renders pagination whenever `data` exists.                                             | Add a shared zero-page guard and targeted regression tests.                                  |
| Academic Records | Course code and title are combined.                                     | One `Course` header contains both values.                                                              | Split into separate accessible columns and retain every contract-required field.             |

### 3.3 Decisions that avoid contract and scope conflicts

1. **No skills API extension.** The existing `GET /skill-taxonomy` hierarchy can map canonical `skillId` values to all cluster/category paths. Cross-mapped skills will display all applicable paths rather than an invented single lineage.
2. **No CV preview-request extension.** Preview requests remain exactly `{ sectionOrder, includedProjectIds }`. Experience, certificate, award, and activity inclusion remains owned by persisted Profile `cvInclude` flags.
3. **No profile mutation from CV Builder.** The Builder shows current inclusion state and links to `/student/profile`; it does not edit profile-owned records.
4. **No unsupported project fields.** Project type, LinkedIn, documentation link, per-skill usage notes, approval, and verification remain absent.
5. **Retain the `CV Builder` product label.** Higher-authority requirements use CV Builder terminology; LaTeX remains an output panel, not a separate workflow. Exact `Save Current CV Version` wording remains unchanged.
6. **Split academic code/title columns.** The fields already exist independently, and this requires no contract change.
7. **No removed-scope behavior.** The exclusions catalogued in `docs/architecture/removed-scope-guardrails.md` remain prohibited, including legacy CV governance, skill-status governance, project governance, GPA-planning, external-stakeholder authentication, and non-deterministic filtering workflows.

## 4. Conflict-Avoidance Strategy

### 4.1 Git and ownership rules

- Implement only on `codex/frontend-audit-remediation-plan` or a later implementation branch created from it.
- Do not stage or rewrite the existing uncommitted `e2e/student-skills.spec.ts` change. Its two toast-dismiss steps are user-owned and must be incorporated when the skills E2E file is eventually extended.
- Before implementation begins, make the worktree clean by committing that user change separately with the user's approval or by leaving it untouched and excluding it from every interim commit.
- Stage files explicitly by path. Never use broad `git add .` while the user-owned file is uncommitted.
- Rebase/merge only from a clean worktree. Re-run the full gate matrix after any rebase.

### 4.2 Shared-file collision map

| Shared area                | Consumers affected                                    | Rule                                                                                                                        |
| -------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/index.css`            | All five features                                     | Stabilize component markup first, then make one consolidated CSS pass. Do not interleave unrelated feature styling commits. |
| `PaginationBar.tsx`        | Profile, Skills, Projects, CV, Academics, Admin pages | Add only a backward-compatible `totalPages <= 0` render guard after auditing all call sites; run all pagination tests.      |
| Student skills types/hooks | Skills page and Project skill picker                  | Add taxonomy/declared-summary hooks without changing existing `IndividualSkill` fields or paged browser behavior.           |
| Student projects API       | Projects page and CV project options                  | Remove only the unused deferred export; preserve all active list/get/CRUD function signatures.                              |
| Profile collection APIs    | Profile page and new CV summaries                     | Reuse read-only list functions and query keys; do not move ownership or add Builder mutations.                              |
| Generated OpenAPI files    | Every API feature                                     | Treat as read-only for this task because the sync gate is green and no contract change is approved.                         |
| E2E Student files          | Shared authenticated workspace/session setup          | Extend existing helpers and fixtures; do not duplicate routes, sessions, or mock servers.                                   |

## 5. Implementation Phases

### Phase 0 - Baseline and guardrail lock

Objective: establish a reproducible baseline before source changes.

1. Record `git status`, branch, and HEAD.
2. Preserve the uncommitted skills E2E edit.
3. Run the baseline gates: environment validation, format check, lint, typecheck, OpenAPI sync, removed-scope scan, unit tests, and build.
4. Search for removed-scope terms in active routes, components, schemas, APIs, mocks, and fixtures.
5. Record any baseline failure before implementation; do not weaken tests to proceed.

Acceptance: the worktree ownership is documented, OpenAPI remains green, and implementation starts from known test evidence.

### Phase 1 - Shared validation and pagination foundations

Objective: close the small cross-cutting defects before feature redesigns.

#### 1A. Calendar-valid profile dates

- Add a focused shared date-only validator/schema helper under `src/shared/validation`.
- Use it in profile response and form schemas for certificate, award, activity, and experience dates before existing date-range/current-role checks.
- Preserve nullable/empty semantics exactly.
- Do not broaden this into an unrelated project-schema refactor; the project schema already validates calendar dates.

Tests:

- Accept `2024-02-29`.
- Reject `2025-02-29`, month/day zero, month 13, day 32, impossible month/day combinations, timestamps, and malformed strings.
- Preserve null/empty activity dates.
- Preserve experience current-role/end-date and end-before-start errors.
- Reject malformed API responses at the Zod boundary.

#### 1B. Zero-page pagination guard

- Audit every `PaginationBar` call site.
- Make the shared component render nothing when `totalPages <= 0`.
- Preserve page summaries, previous/next behavior, labels, and positive-page rendering.
- Update shared tests first, then CV and Projects regression tests.

Acceptance: impossible profile dates cannot reach requests or UI models, and no consumer renders `Page 0 of 0`.

### Phase 2 - Declared Skills workflow correction

Objective: restore the Add/Browse/Declared hierarchy using existing APIs and canonical identities.

1. Add a cached full-taxonomy query around `studentSkillsApi.getTaxonomy()`.
2. Normalize the hierarchy into:
   - clusters and categories for cascading selection;
   - canonical skills keyed by `skillId`;
   - all taxonomy paths per skill for cross-mapped lineage display.
3. Create a distinct **Add Skill** section with accessible Core Cluster, Skill Category, Individual Skill, and Competency controls plus the immediate Add action.
4. Keep a separate **Available System Skills** section with server search/filter/pagination. Selecting a browse result may populate the Add form, but browsing and submission must remain visually and semantically distinct.
5. Keep a separate **Declared Skills** section. Add taxonomy-context cells/cards sourced from the normalized hierarchy. Display multiple paths when a skill is cross-mapped.
6. Add a query that retrieves all unfiltered declared-skill pages with the maximum approved page size, combines canonical IDs, and caches the set. Use it to disable duplicates across every visible taxonomy page.
7. After create/delete, update or invalidate both the visible declared page and complete ID-set query. Preserve competency and selected skill on `409`/network failure.
8. Keep POST/PATCH/DELETE bodies, competency enum, If-Match behavior, ownership routes, and Problem Details unchanged.

Tests:

- Exact three-section hierarchy and keyboard order.
- Cascading cluster/category/skill reset behavior.
- Browse-result-to-form selection.
- Cross-mapped skill renders one canonical declaration with all valid paths.
- A skill declared on an unvisited server page is disabled before POST.
- `409` remains handled and entered values remain recoverable.
- Existing update, stale conflict, remove confirmation, search, sort, page clamp, mobile cards, and independent error states.
- Project skill picker regression, because it shares taxonomy hooks/types.

Acceptance: no fabricated lineage, no duplicate canonical declaration opportunity after synchronization, and no Admin/verified-skill controls.

### Phase 3 - Projects interaction and empty-state correction

Objective: improve the form and repository without changing Project DTOs.

1. Add UI-only `ongoing` state to the project form model or component state; never add it to API request types.
2. Initialize ongoing as true only when an existing project has a start date and no end date. A new project remains explicitly unchecked until selected.
3. Checking ongoing clears and disables End Date. Unchecking restores an editable empty End Date.
4. Map ongoing to the existing `endDate: null` field. Preserve exact create/update allow-lists and dirty/conflict merge behavior.
5. Refactor repository composition so the toolbar remains available while result content is mutually exclusive: loading/error, empty state, or table/mobile cards with positive-page pagination.
6. Ensure an empty search result can be cleared without hiding the search field.
7. Remove the unused Sprint 1 deferred API import/export after repository-wide consumer verification.

Tests:

- Ongoing label, keyboard operation, clear/disable/uncheck behavior, create mapping, edit initialization, dirty state, and failure preservation.
- No `ongoing` property in POST/PATCH bodies.
- Empty initial repository, empty search results, positive results, page clamp after deletion, and no zero-page table/pager.
- Full create/view/edit/delete, If-Match, 404/412 recovery, skill IDs, links, CV inclusion, mobile cards, modal focus, and route guard.

Acceptance: ongoing state is explicit, empty rendering is coherent, active API signatures are unchanged, and no unsupported project field appears.

### Phase 4 - CV Builder configuration and security correction

Objective: make all CV-source groups understandable while preserving the exact preview/save/download contract.

#### 4A. Read-only source inclusion summaries

1. Add CV-specific read-only queries for experience, certificates, awards, and activities using the existing Profile collection APIs.
2. Fetch page 0 for all four groups in parallel with the maximum approved size, then fetch remaining pages in bounded parallel requests. Do not issue one request per record.
3. Normalize each group into label, `cvInclude`, and stable record ID. Keep these models local to CV Builder.
4. Redesign configuration into clearly grouped source sections:
   - Work Experience: read-only inclusion state + Manage in Profile link.
   - Projects: existing direct project checkboxes.
   - Certificates: read-only inclusion state + Manage in Profile link.
   - Awards and Honors: read-only inclusion state + Manage in Profile link.
   - Extracurricular Activities: read-only inclusion state + Manage in Profile link.
5. Retain top-level section enablement and ordering. Explain that a disabled section is omitted even when source records are marked for CV inclusion.
6. Give each group independent loading, empty, error, and retry behavior where practical; a failure in one profile group must not block project configuration or preview generation.
7. Do not add non-project IDs to `CvPreviewRequest`, do not mutate Profile data, and do not generate a client-side CV.

#### 4B. Preview HTML defense in depth

1. Add one focused, maintained client sanitization dependency rather than a home-grown HTML parser. Record the dependency/security rationale in the implementation commit.
2. Create a CV-specific sanitizer wrapper with an explicit allow-list suitable for ATS markup.
3. Remove scripts, event handlers, forms, frames, `srcdoc`, unsafe URL protocols, unsupported SVG/MathML/media, and unapproved style content before building `srcDoc`.
4. Keep the iframe's empty sandbox, restrictive CSP, no-referrer policy, and title unchanged.
5. Sanitize at the render boundary only; retain the original typed server response for data/state handling.

#### 4C. History and wording

- Rely on the shared zero-page pagination guard and assert the history EmptyState renders alone.
- Retain `CV Builder`, `Save Current CV Version`, PDF-only downloads, LaTeX text/copy, and the absence of Admin submission/review.

Tests:

- Five content groups, record labels/statuses, Profile links, independent loading/error/empty/retry states, and no N+1 behavior.
- Preview request remains exactly `{ sectionOrder, includedProjectIds }`.
- Save request remains exactly `{ previewId }`.
- Safe headings, paragraphs, lists, and necessary ATS markup survive sanitization.
- Encoded and direct scripts, event attributes, unsafe links/images, forms, nested frames, SVG/MathML, and disallowed styles are removed.
- Existing CSP, sandbox, no-referrer, expiry, dirty preview, save, immutable history, LaTeX copy, authenticated PDF, filename, blob URL cleanup, and error handling remain green.

Acceptance: all five groups are understandable, no ownership boundary is crossed, sanitized markup reaches `srcDoc`, and preview/save/download contracts are byte-for-field unchanged.

### Phase 5 - Academic Records table correction

Objective: make wireframe-visible course identity explicit while preserving official read-only data.

1. Split `Course` into `Course code` and `Course title` headers/cells.
2. Retain Academic period, Credits, Grade, Grade point, Attempt, Result, and Committed columns.
3. Preserve caption, scoped headers, focusable horizontal scroll region, and server-driven query states.
4. Adjust table minimum width/CSS only as required; do not hide official fields on mobile.

Tests:

- Separate header/cell assertions for code and title.
- Every OpenAPI field remains visible.
- AVAILABLE and NOT_AVAILABLE GPA success states, 200 empty records, search/sort/paging, retry, and page clamp.
- No Student mutation controls and no Estimated GPA terminology.
- 320px horizontal scroll, 200%/400% zoom, keyboard focus, and dark-mode contrast in supported browser tests.

Acceptance: the table is semantically complete, read-only, and usable at supported breakpoints without an API change.

### Phase 6 - Consolidated styling, browser evidence, and closure

Objective: close cross-feature visual, accessibility, integration, and removed-scope evidence after markup is stable.

1. Make one consolidated `src/index.css` pass using existing design tokens and feature prefixes.
2. Verify desktop, tablet, 390px, and 320px layouts; light/dark modes; reduced motion; keyboard navigation; focus visibility/return; modal scroll; table overflow; and 200%/400% zoom.
3. Run the five protected Student E2E workflows plus route/role negatives.
4. Preserve and extend the existing skills toast-dismiss E2E steps instead of overwriting them.
5. Run frontend against the contract backend for ownership, concurrency, invalid-response, and Problem Details behavior.
6. Record backend-owned acceptance separately:
   - profile/skills/projects changes update CV freshness;
   - CV PDF is ATS/parser friendly;
   - Academic Records exposes only the latest committed ledger rows.
7. Produce closure evidence mapping every retained finding to changed files, tests, commands, and reviewer result.

Acceptance: all frontend gates and supported-browser workflows pass; backend-owned evidence is attached or explicitly remains an external blocker.

## 6. Proposed Commit Sequence

Each commit should contain its implementation and directly related tests.

1. `test: capture audit remediation baselines`
2. `fix(profile): enforce calendar-valid profile dates`
3. `fix(ui): suppress zero-page pagination`
4. `feat(skills): separate taxonomy browse and declaration workflow`
5. `fix(skills): synchronize lineage and duplicate identities`
6. `feat(projects): add explicit ongoing project state`
7. `fix(projects): correct repository empty rendering`
8. `chore(projects): remove deferred api boundary`
9. `feat(cv-builder): show grouped source inclusion summaries`
10. `fix(cv-builder): sanitize generated html preview`
11. `fix(academic-records): split course identity columns`
12. `test(e2e): verify remediated student workflows`
13. `docs: record frontend audit closure evidence`

Do not combine all features into one commit. Do not include generated OpenAPI changes unless the contract check identifies a real mismatch.

## 7. Verification Matrix

### Per-phase checks

- Run the directly affected unit/component/schema tests.
- Run shared-component tests whenever `PaginationBar`, taxonomy hooks/types, profile APIs, or shared CSS changes.
- Run `npm.cmd run typecheck` after every phase.
- Run `npm.cmd run verify:scope` after every functional phase.

### Final mandatory gates

```text
npm.cmd run validate-env
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run openapi:check
npm.cmd run verify:scope
npm.cmd run test
npm.cmd run build
npm.cmd run e2e
```

The E2E gate must run in supported CI if local browser policy blocks Playwright. A blocked browser is not a passing result.

## 8. Removed-Scope Verification

The final review must confirm that active code, routes, DTOs, enums, mocks, fixtures, tests, and labels conform to every exclusion in `docs/architecture/removed-scope-guardrails.md`. This includes the legacy registration-decision lifecycle, credential-issuance workflow, Admin taxonomy governance, skill-status governance, GPA planning, CV governance, external-stakeholder authentication, non-deterministic filtering, Admin-governed project lifecycle, hard shortlist blocking, internship-request GPA persistence, and browser-only production state.

Legacy terms may appear only in negative tests, guardrail documentation, or explicit removed-scope checks.

## 9. Completion Criteria

The remediation is complete only when:

- every confirmed frontend finding in Section 3.2 is implemented and covered by tests;
- the already-resolved OpenAPI findings remain closed without unnecessary contract churn;
- the user-owned E2E edit is preserved;
- no unsupported endpoint, DTO field, route, role, or workflow is added;
- loading, empty, error, retry, conflict, success, and stale-response behavior remains correct;
- Student ownership and read-only academic boundaries remain intact;
- format, lint, strict typecheck, OpenAPI sync, removed-scope scan, unit/component tests, production build, and E2E all pass;
- responsive, dark-mode, keyboard, focus, zoom/reflow, and reduced-motion evidence is recorded;
- backend-owned ATS, freshness, and committed-ledger evidence is attached or reported as an external acceptance dependency;
- the final diff contains no unrelated changes or secrets.
