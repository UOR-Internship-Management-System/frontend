# CV Management API OpenAPI v1.3.0 Changelog

## 1. Revision identity

- **Input file:** `CV_Management_API_OpenAPI_v1.2.0.yaml`
- **Output file:** `CV_Management_API_OpenAPI_v1.3.0.yaml`
- **OpenAPI version:** `3.1.1`
- **API document version:** `1.3.0`
- **Scope of revision:** Sprint 4 frontend contract freeze for the developer-managed skill taxonomy, Student declared-skill management, and Student portfolio-project management.
- **Implementation status:** `frontendContract: READY`; `backendImplementation: PENDING`.
- **Original v1.2.0 SHA-256:** `daadee303a88fdb31591e56f6835375f99a00afc1014bc700b01308ae3db9e38`
- **Final v1.3.0 SHA-256:** `d920516cec8733e0011ea33e9be4abcad9554f5f7b6a97dd0599825cb462aa5e`

The original v1.2.0 file was read only and was not overwritten or deleted.

## 2. Sources reviewed

Sources were reviewed in the required authority order. Higher-authority scope and requirements sources controlled conflicts with lower-priority visual evidence.

1. **Final Reduced Scope Baseline Document v1.1**
   - Declared skills must reference the developer-managed taxonomy.
   - Cross-mapped skills use one normalized skill with many-to-many category mappings.
   - Projects are Student-owned portfolio records and do not affect filtering eligibility.
   - Admin skill management, verified-skill states, and project approval/verification are excluded.
2. **Scope reductions.docx**
   - Confirms removal of the Admin Skill Master and all Admin skill CRUD/import behavior.
   - Confirms the retained three-level taxonomy and developer-controlled maintenance.
3. **45-Day Agile Sprint Implementation Plan**
   - Sprint 4 requires taxonomy browsing, declared-skill CRUD, competency levels, project CRUD, technologies, date range, repository link, and approved live link.
4. **Software Requirements Specification v3.0.1**
   - Declared skills require taxonomy references and Beginner/Intermediate/Advanced competency levels.
   - Students cannot create free-form skills.
   - Taxonomy search/filtering and canonical cross-mapped skills are required.
   - Projects are Student-owned portfolio records.
5. **CV_Management_API_OpenAPI_v1.2.0.yaml**
   - Audited all existing paths, schemas, operation IDs, security, shared errors, pagination, and profile concurrency conventions.
6. **UI Frontend Specification v1.1**
   - Confirmed server-state ownership, typed DTO expectations, server-side pagination/search/sort, strict mutation states, and frontend error handling.
7. **Student and Admin Workflow Document v1.0**
   - Confirmed declared-skill add/update/remove behavior, duplicate/invalid-level failures, project CRUD behavior, ownership, and CV-source freshness changes.
8. **Production-Ready Use-Case Documentation v1.0**
   - Confirmed Student ownership, Admin read-only inspection, taxonomy-only skill selection, project portfolio boundaries, and removed-scope restrictions.
9. **Frontend Folder Structure Implementation Plan v1.0**
   - Confirmed feature API wrappers must follow OpenAPI and must not invent fields, endpoints, or states.
10. **Backend Module Documentation v1.0**
    - Confirmed module ownership, validation/error semantics, ownership enforcement, CV freshness, and REST contract boundaries.
11. **Database Design Document v1.0**
    - Confirmed declared-skill uniqueness, optimistic locking, project/project-skill atomicity, row versions, rollback behavior, and no approval/verification state.
12. **Skill List breakdown.pdf**
    - Confirmed the three-level structure and canonical many-to-many treatment for cross-mapped skills.
13. **Finalized Student Skills and Projects wireframes in Student Pages.zip**
    - Used as lower-priority visual evidence for competency selection, project dates, repository link, skills, and CV inclusion.
    - Legacy visual-only fields not authorized by the controlling contract were not added.

`Student.docx` was not separately present in the mounted source set. This did not block finalization because it is a lower-priority reference, the finalized Student wireframes were available, and the controlling baseline, SRS, workflow, use-case, frontend, backend, and database documents were available.

## 3. Contract decisions

### Project technologies use normalized skills

Project technologies are represented by `skillIds` in create/update requests and typed `IndividualSkillResponse` objects in responses. No free-text `technologies` field was added. This preserves canonical taxonomy identity and many-to-many category mappings.

### Project dates added

`startDate` and `endDate` were added as nullable ISO `date` values. When both are supplied, `endDate` must not be before `startDate`; violations return `422` Problem Details.

### Create and update request schemas separated

The following ambiguous v1.2.0 request schemas were removed:

- `DeclaredSkillRequest`
- `ProjectRequest`

They were replaced with:

- `DeclaredSkillCreateRequest`
- `DeclaredSkillUpdateRequest`
- `ProjectCreateRequest`
- `ProjectUpdateRequest`

### Declared-skill PATCH is competency-only

`PATCH /me/declared-skills/{declaredSkillId}` accepts only `competencyLevel`. A declared skill cannot be changed to a different taxonomy skill through PATCH.

### Typed paged item schemas

The following paged responses now use concrete item references and strict required metadata:

- `PagedDeclaredSkillResponse`
- `PagedProjectResponse`
- `PagedIndividualSkillResponse`
- `PagedSkillCategoryResponse`
- `PagedSkillClusterResponse`

### Optimistic concurrency

`If-Match` is now required for declared-skill and project PATCH/DELETE operations. The operations expose:

- `412` for stale versions
- `428` for a missing precondition

Project data and project-skill mappings are treated as one consistent mutation boundary.

### Fields intentionally excluded

The finalized Sprint 4 contract does not include:

- verified-skill or endorsement fields
- Admin approval or reviewer fields
- project approval/verification fields
- project eligibility, score, rank, or filtering fields
- free-text technologies
- project type
- under-development flag
- LinkedIn project URL
- documentation URL
- skill evidence notes
- Admin taxonomy mutation endpoints

A precise description-length maximum was not invented because the existing controlling contract does not establish one. Frontend form limits must not contradict the eventual backend/database validation contract.

## 4. Conflict-resolution register

### Conflict 1 — One declared-skill request used for POST and PATCH

- **Source A:** OpenAPI v1.2.0 required `skillId` and `competencyLevel` for both create and update.
- **Source B:** Sprint plan, SRS, workflow, and use cases define update as competency-level modification only.
- **Authority applied:** Reduced-scope requirements and operational workflow.
- **Final decision:** Split create/update schemas; PATCH accepts only `competencyLevel`.

### Conflict 2 — Project dates missing from OpenAPI v1.2.0

- **Source A:** OpenAPI v1.2.0 omitted project dates.
- **Source B:** Sprint 4 plan and finalized Student project wireframe include a project date range.
- **Authority applied:** Sprint implementation baseline supported by finalized UI evidence and portfolio data requirements.
- **Final decision:** Add nullable `startDate` and `endDate` with a `422` cross-field validation rule.

### Conflict 3 — “Technologies” wording versus normalized taxonomy model

- **Source A:** Sprint plan and wireframe use the user-facing word “technologies.”
- **Source B:** Baseline, SRS, database design, and taxonomy specification require canonical Individual Skills and many-to-many mappings.
- **Authority applied:** Baseline, SRS, and database design.
- **Final decision:** Transport technologies as taxonomy `skillIds`; return typed `skills`.

### Conflict 4 — Lower-priority project fields in the wireframe

- **Source A:** The visual wireframe contains project type, under-development, LinkedIn, documentation, and skill-usage-note controls.
- **Source B:** The locked transport-field set and higher-authority project requirements do not require these fields.
- **Authority applied:** Final reduced-scope baseline, SRS, database design, and the formal contract-finalization instruction.
- **Final decision:** Exclude the unsupported fields from v1.3.0.

### Conflict 5 — Generic paged item objects

- **Source A:** OpenAPI v1.2.0 used `items: { type: object }` for declared skills and projects.
- **Source B:** UI specification and contract-first frontend implementation require typed DTOs.
- **Authority applied:** UI frontend specification and OpenAPI implementation safety requirements.
- **Final decision:** Replace generic items with concrete response references.

### Conflict 6 — Missing Sprint 4 concurrency preconditions

- **Source A:** OpenAPI v1.2.0 returned `412` but did not require `If-Match` on declared-skill/project mutations.
- **Source B:** Existing profile contract conventions and database design require optimistic locking/row versions.
- **Authority applied:** Existing production-ready profile convention and database concurrency design.
- **Final decision:** Require `If-Match`; add explicit `428` handling and version metadata.

### Conflict 7 — Taxonomy relationship filtering was implicit

- **Source A:** OpenAPI v1.2.0 described optional cluster/category filtering but exposed only generic page/size/sort/search parameters.
- **Source B:** Hierarchical UI flows and SRS require cluster/category navigation and server-side filtering.
- **Authority applied:** SRS, workflow, and frontend specification.
- **Final decision:** Add optional `clusterId` and `categoryId` query parameters while preserving route names and operation IDs.

## 5. Exact paths changed

- `GET /skill-taxonomy`
- `GET /skill-taxonomy/clusters`
- `GET /skill-taxonomy/categories`
- `GET /skill-taxonomy/skills`
- `GET /me/declared-skills`
- `POST /me/declared-skills`
- `PATCH /me/declared-skills/{declaredSkillId}`
- `DELETE /me/declared-skills/{declaredSkillId}`
- `GET /me/projects`
- `POST /me/projects`
- `GET /me/projects/{projectId}`
- `PATCH /me/projects/{projectId}`
- `DELETE /me/projects/{projectId}`

No valid authentication, Student Dashboard, Student Profile, upload, Admin, filtering, shortlist, or export operation ID was renamed or removed.

## 6. Exact schemas added, replaced, or removed

### Added

- `DeclaredSkillCreateRequest`
- `DeclaredSkillUpdateRequest`
- `ProjectCreateRequest`
- `ProjectUpdateRequest`

### Removed/replaced

- `DeclaredSkillRequest`
- `ProjectRequest`

### Finalized or strengthened

- `DeclaredSkillResponse`
- `ProjectResponse`
- `PagedDeclaredSkillResponse`
- `PagedProjectResponse`
- `SkillTaxonomyResponse`
- `PagedIndividualSkillResponse`
- `PagedSkillCategoryResponse`
- `PagedSkillClusterResponse`
- `IndividualSkillResponse`
- `SkillCategoryResponse`
- `SkillClusterResponse`

### Parameters added

- `ClusterIdFilter`
- `CategoryIdFilter`

### Response components added

- `DuplicateDeclaredSkill409`
- `InvalidProjectDateRange422`
- `StaleProjectVersion412`
- `MissingIfMatch428`

## 7. Backward-compatibility notes

The following were preserved:

- Existing `/me/...` route convention
- Existing Sprint 2 and Sprint 3 paths
- Existing operation IDs
- Existing bearer authentication and RBAC descriptions
- Existing shared pagination parameters
- Existing shared Problem Details schemas and response components
- Existing profile optimistic-concurrency convention

The v1.3.0 Sprint 4 changes require regeneration or manual update of generated client types because:

- old request schema names were replaced;
- declared-skill PATCH no longer accepts `skillId`;
- project PATCH is now a true partial update;
- project response metadata and nullable date/link fields are required in responses;
- `If-Match` is mandatory for declared-skill and project PATCH/DELETE operations.

Consumers pinned to v1.2.0 should not mix old generated Sprint 4 types with the v1.3.0 contract.

## 8. Removed-scope verification

The active Sprint 4 paths and schemas were checked for the absence of:

- Admin Student signup approval
- pending/rejected Student registration
- temporary passwords
- Admin Skill Master or Admin taxonomy mutation
- verified-skill status or Admin skill verification
- Estimated GPA planning
- CV review/approval/correction/comment states
- company login/account behavior
- AI score, rank, weighted score, or match percentage
- automated candidate selection
- project approval/rejection/verification
- hard shortlist blocking
- GPA fields inside internship request persistence

Taxonomy endpoints remain read-only. Students cannot create free-form taxonomy records. Projects remain portfolio-only.

## 9. Validation commands and results

### YAML parsing

- Parsed with `ruamel.yaml` using duplicate-key rejection: **PASS**
- Parsed independently with `PyYAML.safe_load`: **PASS**

### OpenAPI structural checks

- `openapi: 3.1.1`: **PASS**
- `info.version: 1.3.0`: **PASS**
- Internal `$ref` pointers resolved: **PASS — 1,475 references checked**
- Operation IDs present and unique: **PASS — 104 operation IDs checked**
- Old `DeclaredSkillRequest` key/reference absent: **PASS**
- Old `ProjectRequest` key/reference absent: **PASS**
- Declared-skill pagination item reference: **PASS**
- Project pagination item reference: **PASS**
- Taxonomy paged responses typed and strict: **PASS**
- `If-Match`, `412`, and `428` on all required mutations: **PASS**
- No response body on any `204` response: **PASS**
- Taxonomy paths expose GET only: **PASS**
- Cluster/category relationship filters present: **PASS**
- Required Sprint 4 examples present: **PASS**
- Forbidden Sprint 4 response/request fields absent: **PASS**

### External linter

`npx --no-install @redocly/cli lint CV_Management_API_OpenAPI_v1.3.0.yaml` was attempted without installing packages. It could not run because Redocly CLI is not installed in the environment. No dependency was installed or upgraded. This check is recorded as **UNAVAILABLE**, not passed.

## 10. Deferred non-Sprint-4 contract findings

The following existing v1.2.0 areas were deliberately not redesigned because they belong to later sprints or unrelated contract scopes:

- Some later-sprint paged response schemas still use generic object items.
- Some older non-Sprint-4 DTOs do not yet apply the same strict `required` and `additionalProperties: false` conventions.
- Several read-only endpoints retain broad shared error response sets that may be narrowed during later backend implementation review.
- The frontend repository’s OpenAPI synchronization script is currently pinned to v1.2.0 and the old Sprint 4 schema names; it must be updated when v1.3.0 is adopted, but frontend files were intentionally not modified in this contract-only task.
- A full third-party OpenAPI semantic linter should be run in CI when an approved linter is available.

## 11. Final contract-readiness verdict

# READY FOR SPRINT 4 FRONTEND IMPLEMENTATION

The v1.3.0 YAML parses successfully, all internal references resolve, operation IDs remain unique, the required Sprint 4 schemas and examples are present, optimistic concurrency is explicit, and active removed-scope functionality is absent. Backend implementation remains pending.
