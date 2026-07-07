# Frontend Folder Structure Audit and Extracted Directory Tree

**Source document:** `Frontend_Folder_Structure_Implementation_Plan_v1.0.docx`  
**Project:** CV Management and Deterministic Internship Candidate Filtering System  
**Audit output:** Markdown extraction of the complete frontend directory structure with implementation-readiness notes.

---

## 1. Audit Verdict

**Verdict:** The frontend folder structure document is broadly complete, internally coherent, and suitable as the implementation baseline for the locked Version 1 frontend. It correctly uses a single Vite-compatible React + TypeScript repository, separates business-facing feature modules under `src/features`, keeps app-level routing/providers/layouts under `src/app`, centralizes reusable infrastructure under `src/shared`, and includes testing, CI, OpenAPI generation, environment validation, and removed-scope guardrail scripts.

**Implementation readiness:** Accept with minor refinements before repository bootstrapping.

---

## 2. What Is Complete and Accurate

- The structure follows the approved single frontend repository decision and avoids separate Student/Admin applications.
- Student and Admin functionality is separated into feature/domain modules.
- Public authentication routes, Student-protected routes, Admin-protected routes, and fallback routes are defined.
- API integration is correctly centralized around OpenAPI-generated client artifacts under `src/shared/api/generated`, with feature-level API wrappers.
- Server-state ownership is aligned with TanStack Query-style query/mutation management.
- Shared UI, feedback, layout, overlay, form, skeleton, validation, notification, error, security, constants, and utility layers are included.
- Testing coverage structure includes Vitest/RTL/MSW support and Playwright E2E coverage, including a removed-scope negative test file.
- Removed-scope guardrails are explicitly represented through `docs/architecture/removed-scope-guardrails.md`, `src/shared/constants/removedScope.ts`, `scripts/verify-removed-scope.mjs`, and `e2e/removed-scope-negative.spec.ts`.

---

## 3. Minor Issues to Correct Before Final Lock-In

These are not major architectural problems, but they should be resolved before creating the actual repository.

1. **Fallback pages are referenced in the route map but not explicitly listed as page files.**  
   The route map includes `/unauthorized` and `/not-found`, but the tree only lists `fallbackRoutes.tsx` and `ErrorLayout.tsx`. Add explicit page files, for example:

   ```text
   src/app/router/fallbacks/UnauthorizedPage.tsx
   src/app/router/fallbacks/NotFoundPage.tsx
   ```

2. **Admin authentication E2E coverage is not explicit.**  
   The tree includes `e2e/auth.student.spec.ts`, but Admin login is a formal route and should have its own E2E test:

   ```text
   e2e/auth.admin.spec.ts
   ```

3. **Package manager lockfile is not listed.**  
   The CI gate requires installation using a locked package manager and lockfile. Add exactly one lockfile after selecting the package manager:

   ```text
   package-lock.json
   # or
   pnpm-lock.yaml
   # or
   yarn.lock
   ```

4. **Feature-level test folders are only explicit for `student-auth`.**  
   The feature-module standard includes `__tests__/`, but most feature modules do not list feature-level test folders in the full tree. This is acceptable for a bootstrap structure, but implementation should add feature-specific tests as each module is built.

5. **The removed-scope validation table has one formatting issue.**  
   The automated guardrail row appears duplicated across all table cells in the source document. The meaning is clear, but the row should be reformatted for readability in the Word document.

---

## 4. Extracted Structure Summary

- Explicit directory entries identified: **89**
- Explicit file entries identified: **324**
- Root directory: `cv-management-frontend/`

---

## 5. Full Extracted Frontend Directory Structure

```text
cv-management-frontend/
|-- .github/
|   `-- workflows/
|       |-- frontend-ci.yml
|       `-- frontend-preview.yml
|-- .husky/
|   `-- pre-commit
|-- .vscode/
|   |-- extensions.json
|   `-- settings.json
|-- docs/
|   |-- architecture/
|   |   |-- frontend-folder-structure.md
|   |   |-- routing-map.md
|   |   |-- state-management.md
|   |   `-- removed-scope-guardrails.md
|   |-- api/
|   |   |-- CV_Management_API_OpenAPI_v1.0.yaml
|   |   `-- generated-client-notes.md
|   `-- qa/
|       |-- frontend-test-plan.md
|       `-- accessibility-checklist.md
|-- public/
|   |-- favicon.svg
|   |-- robots.txt
|   |-- manifest.webmanifest
|   `-- assets/
|       |-- placeholder-avatar.svg
|       `-- cv-paper-preview-placeholder.svg
|-- src/
|   |-- main.tsx
|   |-- App.tsx
|   |-- vite-env.d.ts
|   |-- app/
|   |   |-- config/
|   |   |   |-- env.ts
|   |   |   |-- featureFlags.ts
|   |   |   |-- queryClient.ts
|   |   |   |-- routePaths.ts
|   |   |   `-- runtimeConfig.ts
|   |   |-- layouts/
|   |   |   |-- RootLayout.tsx
|   |   |   |-- AuthLayout.tsx
|   |   |   |-- StudentLayout.tsx
|   |   |   |-- AdminLayout.tsx
|   |   |   `-- ErrorLayout.tsx
|   |   |-- providers/
|   |   |   |-- AppProviders.tsx
|   |   |   |-- AuthProvider.tsx
|   |   |   |-- QueryProvider.tsx
|   |   |   |-- ThemeProvider.tsx
|   |   |   |-- NotificationProvider.tsx
|   |   |   `-- OverlayProvider.tsx
|   |   `-- router/
|   |       |-- router.tsx
|   |       |-- routes.tsx
|   |       |-- routeGuards.tsx
|   |       |-- lazyRoutes.ts
|   |       `-- fallbackRoutes.tsx
|   |-- features/
|   |   |-- student-auth/
|   |   |   |-- pages/
|   |   |   |   |-- StudentSignUpPage.tsx
|   |   |   |   |-- VerifyOtpPage.tsx
|   |   |   |   |-- CreatePasswordPage.tsx
|   |   |   |   |-- StudentLoginPage.tsx
|   |   |   |   `-- ForgotPasswordPage.tsx
|   |   |   |-- components/
|   |   |   |   |-- StudentSignUpForm.tsx
|   |   |   |   |-- VerificationStatusDialog.tsx
|   |   |   |   |-- OtpInput.tsx
|   |   |   |   |-- PasswordCreationForm.tsx
|   |   |   |   `-- ForgotPasswordForm.tsx
|   |   |   |-- api/
|   |   |   |   `-- studentAuthApi.ts
|   |   |   |-- hooks/
|   |   |   |   |-- useStartStudentVerification.ts
|   |   |   |   |-- useVerifyStudentOtp.ts
|   |   |   |   |-- useResendStudentOtp.ts
|   |   |   |   |-- useCreateStudentPassword.ts
|   |   |   |   `-- useStudentLogin.ts
|   |   |   |-- schemas/
|   |   |   |   `-- studentAuthSchemas.ts
|   |   |   |-- types/
|   |   |   |   `-- studentAuthTypes.ts
|   |   |   |-- __tests__/
|   |   |   |   `-- student-auth.routes.test.tsx
|   |   |   `-- index.ts
|   |   |-- admin-auth/
|   |   |   |-- pages/AdminLoginPage.tsx
|   |   |   |-- components/AdminLoginForm.tsx
|   |   |   |-- api/adminAuthApi.ts
|   |   |   |-- hooks/useAdminLogin.ts
|   |   |   |-- schemas/adminAuthSchemas.ts
|   |   |   `-- index.ts
|   |   |-- student-dashboard/
|   |   |   |-- pages/StudentDashboardPage.tsx
|   |   |   |-- components/StudentMetricCard.tsx
|   |   |   |-- api/studentDashboardApi.ts
|   |   |   |-- hooks/useStudentDashboard.ts
|   |   |   `-- index.ts
|   |   |-- student-profile/
|   |   |   |-- pages/StudentProfilePage.tsx
|   |   |   |-- components/
|   |   |   |   |-- ProfileForm.tsx
|   |   |   |   |-- AvatarUpload.tsx
|   |   |   |   |-- CertificateEditor.tsx
|   |   |   |   |-- AwardEditor.tsx
|   |   |   |   |-- ActivityEditor.tsx
|   |   |   |   `-- ExperienceEditor.tsx
|   |   |   |-- api/studentProfileApi.ts
|   |   |   |-- hooks/
|   |   |   |   |-- useStudentProfile.ts
|   |   |   |   `-- useUpdateStudentProfile.ts
|   |   |   |-- mappers/studentProfileMapper.ts
|   |   |   |-- schemas/studentProfileSchemas.ts
|   |   |   `-- index.ts
|   |   |-- student-skills/
|   |   |   |-- pages/StudentSkillsPage.tsx
|   |   |   |-- components/
|   |   |   |   |-- SkillTaxonomyBrowser.tsx
|   |   |   |   |-- DeclaredSkillForm.tsx
|   |   |   |   |-- DeclaredSkillsTable.tsx
|   |   |   |   `-- SkillLevelSelect.tsx
|   |   |   |-- api/studentSkillsApi.ts
|   |   |   |-- hooks/
|   |   |   |   |-- useSkillTaxonomy.ts
|   |   |   |   |-- useDeclaredSkills.ts
|   |   |   |   `-- useSaveDeclaredSkill.ts
|   |   |   |-- mappers/skillMapper.ts
|   |   |   |-- schemas/studentSkillSchemas.ts
|   |   |   `-- index.ts
|   |   |-- student-projects/
|   |   |   |-- pages/StudentProjectsPage.tsx
|   |   |   |-- components/
|   |   |   |   |-- ProjectForm.tsx
|   |   |   |   |-- ProjectRepository.tsx
|   |   |   |   |-- ProjectDetailsModal.tsx
|   |   |   |   `-- ProjectSkillChips.tsx
|   |   |   |-- api/studentProjectsApi.ts
|   |   |   |-- hooks/useStudentProjects.ts
|   |   |   |-- schemas/studentProjectSchemas.ts
|   |   |   `-- index.ts
|   |   |-- cv-builder/
|   |   |   |-- pages/CvBuilderPage.tsx
|   |   |   |-- components/
|   |   |   |   |-- CvPreviewPanel.tsx
|   |   |   |   |-- CvSourceFreshnessNotice.tsx
|   |   |   |   |-- CvActionBar.tsx
|   |   |   |   `-- LatexOutputPanel.tsx
|   |   |   |-- api/cvBuilderApi.ts
|   |   |   |-- hooks/
|   |   |   |   |-- useCvPreview.ts
|   |   |   |   |-- useSaveCvVersion.ts
|   |   |   |   `-- useDownloadCv.ts
|   |   |   |-- mappers/cvMapper.ts
|   |   |   `-- index.ts
|   |   |-- academic-records/
|   |   |   |-- pages/AcademicRecordsPage.tsx
|   |   |   |-- components/
|   |   |   |   |-- GpaSummaryCards.tsx
|   |   |   |   `-- AcademicRecordsTable.tsx
|   |   |   |-- api/academicRecordsApi.ts
|   |   |   |-- hooks/useAcademicRecords.ts
|   |   |   `-- index.ts
|   |   |-- admin-dashboard/
|   |   |   |-- pages/AdminDashboardPage.tsx
|   |   |   |-- components/AdminMetricCard.tsx
|   |   |   |-- api/adminDashboardApi.ts
|   |   |   |-- hooks/useAdminDashboard.ts
|   |   |   `-- index.ts
|   |   |-- academic-ledger/
|   |   |   |-- pages/AcademicLedgerPage.tsx
|   |   |   |-- components/
|   |   |   |   |-- LedgerUploadPanel.tsx
|   |   |   |   |-- LedgerValidationTable.tsx
|   |   |   |   |-- LedgerCommitDialog.tsx
|   |   |   |   `-- LedgerRecordDetailsModal.tsx
|   |   |   |-- api/academicLedgerApi.ts
|   |   |   |-- hooks/
|   |   |   |   |-- useLedgerUpload.ts
|   |   |   |   |-- useLedgerRecords.ts
|   |   |   |   `-- useCommitLedger.ts
|   |   |   |-- schemas/ledgerSchemas.ts
|   |   |   `-- index.ts
|   |   |-- student-management/
|   |   |   |-- pages/
|   |   |   |   |-- RegisteredStudentsPage.tsx
|   |   |   |   `-- StudentDeepDivePage.tsx
|   |   |   |-- components/
|   |   |   |   |-- RegisteredStudentsTable.tsx
|   |   |   |   |-- StudentDeepDiveTabs.tsx
|   |   |   |   |-- ReadOnlyStudentProfile.tsx
|   |   |   |   `-- LatestSavedCvPanel.tsx
|   |   |   |-- api/studentManagementApi.ts
|   |   |   |-- hooks/
|   |   |   |   |-- useRegisteredStudents.ts
|   |   |   |   `-- useStudentDeepDive.ts
|   |   |   `-- index.ts
|   |   |-- internship-management/
|   |   |   |-- pages/InternshipManagementPage.tsx
|   |   |   |-- components/
|   |   |   |   |-- CompanyForm.tsx
|   |   |   |   |-- CompanyTable.tsx
|   |   |   |   |-- InternshipRequestForm.tsx
|   |   |   |   `-- InternshipRequestTable.tsx
|   |   |   |-- api/internshipManagementApi.ts
|   |   |   |-- hooks/
|   |   |   |   |-- useCompanies.ts
|   |   |   |   `-- useInternshipRequests.ts
|   |   |   |-- schemas/internshipSchemas.ts
|   |   |   `-- index.ts
|   |   |-- candidate-filtering/
|   |   |   |-- pages/CandidateFilteringPage.tsx
|   |   |   |-- components/
|   |   |   |   |-- RuntimeGpaFilterPanel.tsx
|   |   |   |   |-- DeclaredSkillFilterPanel.tsx
|   |   |   |   |-- CandidateResultsTable.tsx
|   |   |   |   `-- CandidateSelectionPanel.tsx
|   |   |   |-- api/candidateFilteringApi.ts
|   |   |   |-- hooks/useCandidateFiltering.ts
|   |   |   |-- schemas/candidateFilteringSchemas.ts
|   |   |   `-- index.ts
|   |   |-- shortlists/
|   |   |   |-- pages/ShortlistsPage.tsx
|   |   |   |-- components/
|   |   |   |   |-- ShortlistReviewTable.tsx
|   |   |   |   |-- ShortlistGuidanceWarning.tsx
|   |   |   |   |-- FinalizeShortlistDialog.tsx
|   |   |   |   `-- ShortlistExportPanel.tsx
|   |   |   |-- api/shortlistsApi.ts
|   |   |   |-- hooks/useShortlists.ts
|   |   |   `-- index.ts
|   |   `-- exports/
|   |       |-- api/exportsApi.ts
|   |       |-- hooks/
|   |       |   |-- useDownloadFile.ts
|   |       |   `-- useBulkCvExport.ts
|   |       |-- utils/fileDownload.ts
|   |       `-- index.ts
|   |-- shared/
|   |   |-- api/
|   |   |   |-- httpClient.ts
|   |   |   |-- apiConfig.ts
|   |   |   |-- apiErrorMapper.ts
|   |   |   |-- problemDetails.ts
|   |   |   |-- queryKeys.ts
|   |   |   |-- requestCancellation.ts
|   |   |   |-- authTokenStorage.ts
|   |   |   `-- generated/
|   |   |       |-- cvManagementApi.types.ts
|   |   |       |-- cvManagementApi.client.ts
|   |   |       `-- README.md
|   |   |-- components/
|   |   |   |-- data/
|   |   |   |   |-- DataTable.tsx
|   |   |   |   |-- PaginationBar.tsx
|   |   |   |   |-- SearchInput.tsx
|   |   |   |   |-- SortSelect.tsx
|   |   |   |   `-- FilterChips.tsx
|   |   |   |-- feedback/
|   |   |   |   |-- EmptyState.tsx
|   |   |   |   |-- ErrorState.tsx
|   |   |   |   |-- LoadingButton.tsx
|   |   |   |   |-- SkeletonBlock.tsx
|   |   |   |   `-- ToastViewport.tsx
|   |   |   |-- forms/
|   |   |   |   |-- FormField.tsx
|   |   |   |   |-- TextInput.tsx
|   |   |   |   |-- SelectField.tsx
|   |   |   |   |-- FileUploadField.tsx
|   |   |   |   `-- FormErrorMessage.tsx
|   |   |   |-- layout/
|   |   |   |   |-- PageHeader.tsx
|   |   |   |   |-- SectionCard.tsx
|   |   |   |   |-- MetricCard.tsx
|   |   |   |   `-- ToolbarRow.tsx
|   |   |   |-- overlays/
|   |   |   |   |-- Modal.tsx
|   |   |   |   |-- ConfirmDialog.tsx
|   |   |   |   |-- Dropdown.tsx
|   |   |   |   `-- Tooltip.tsx
|   |   |   `-- ui/
|   |   |       |-- Button.tsx
|   |   |       |-- Card.tsx
|   |   |       |-- Chip.tsx
|   |   |       |-- Icon.tsx
|   |   |       |-- StatusBadge.tsx
|   |   |       `-- ThemeToggle.tsx
|   |   |-- skeletons/
|   |   |   |-- AuthSkeleton.tsx
|   |   |   |-- DashboardSkeleton.tsx
|   |   |   |-- TableSkeleton.tsx
|   |   |   |-- FormSkeleton.tsx
|   |   |   `-- WorkspaceSkeleton.tsx
|   |   |-- hooks/
|   |   |   |-- useAuth.ts
|   |   |   |-- useDebouncedValue.ts
|   |   |   |-- useUrlQueryState.ts
|   |   |   |-- usePagination.ts
|   |   |   |-- useDisclosure.ts
|   |   |   |-- useResponsiveLayout.ts
|   |   |   `-- useDocumentTitle.ts
|   |   |-- mappers/
|   |   |   |-- dateMapper.ts
|   |   |   |-- gpaMapper.ts
|   |   |   |-- skillMapper.ts
|   |   |   |-- statusMapper.ts
|   |   |   `-- fileSizeMapper.ts
|   |   |-- types/
|   |   |   |-- auth.ts
|   |   |   |-- api.ts
|   |   |   |-- pagination.ts
|   |   |   |-- roles.ts
|   |   |   |-- common.ts
|   |   |   `-- ui.ts
|   |   |-- validation/
|   |   |   |-- commonSchemas.ts
|   |   |   |-- paginationSchemas.ts
|   |   |   |-- fileSchemas.ts
|   |   |   `-- validationMessages.ts
|   |   |-- notifications/
|   |   |   |-- notify.ts
|   |   |   `-- notificationTypes.ts
|   |   |-- errors/
|   |   |   |-- ErrorBoundary.tsx
|   |   |   |-- routeErrorElement.tsx
|   |   |   |-- errorCodes.ts
|   |   |   `-- safeErrorMessage.ts
|   |   |-- overlays/
|   |   |   |-- OverlayRoot.tsx
|   |   |   |-- overlayZIndex.ts
|   |   |   `-- focusManagement.ts
|   |   |-- security/
|   |   |   |-- permissions.ts
|   |   |   |-- roleAccess.ts
|   |   |   |-- sanitizeDisplayText.ts
|   |   |   `-- sensitiveDataRules.ts
|   |   |-- constants/
|   |   |   |-- appConstants.ts
|   |   |   |-- routeConstants.ts
|   |   |   |-- storageKeys.ts
|   |   |   `-- removedScope.ts
|   |   `-- utils/
|   |       |-- assertNever.ts
|   |       |-- buildQueryString.ts
|   |       |-- clampPage.ts
|   |       |-- downloadBlob.ts
|   |       |-- formatters.ts
|   |       `-- stableKeys.ts
|   |-- styles/
|   |   |-- tokens.css
|   |   |-- globals.css
|   |   |-- typography.css
|   |   |-- material-theme.css
|   |   |-- dark-mode.css
|   |   |-- responsive.css
|   |   `-- print-cv-preview.css
|   |-- assets/
|   |   |-- icons/
|   |   `-- images/
|   |-- mocks/
|   |   |-- browser.ts
|   |   |-- server.ts
|   |   |-- handlers/
|   |   |   |-- authHandlers.ts
|   |   |   |-- studentHandlers.ts
|   |   |   |-- adminHandlers.ts
|   |   |   `-- exportHandlers.ts
|   |   `-- fixtures/
|   |       |-- students.fixture.ts
|   |       |-- skills.fixture.ts
|   |       |-- academicRecords.fixture.ts
|   |       `-- internships.fixture.ts
|   `-- test/
|       |-- setupTests.ts
|       |-- testUtils.tsx
|       |-- renderWithProviders.tsx
|       |-- accessibility.ts
|       `-- mswTestServer.ts
|-- e2e/
|   |-- auth.student.spec.ts
|   |-- student-profile.spec.ts
|   |-- student-skills.spec.ts
|   |-- cv-builder.spec.ts
|   |-- admin-ledger.spec.ts
|   |-- candidate-filtering.spec.ts
|   |-- shortlists-export.spec.ts
|   `-- removed-scope-negative.spec.ts
|-- scripts/
|   |-- generate-api-client.mjs
|   |-- validate-env.mjs
|   |-- verify-removed-scope.mjs
|   `-- check-openapi-sync.mjs
|-- .env.example
|-- .env.test
|-- .eslintignore
|-- .eslintrc.cjs
|-- .gitignore
|-- .prettierrc
|-- .prettierignore
|-- commitlint.config.cjs
|-- components.json
|-- index.html
|-- package.json
|-- playwright.config.ts
|-- postcss.config.cjs
|-- README.md
|-- tsconfig.json
|-- tsconfig.node.json
|-- tsconfig.paths.json
|-- vite.config.ts
`-- vitest.config.ts
```

---

## 6. Recommended Corrections Addendum

Add the following files during repository bootstrapping to close the minor gaps identified during the audit:

```text
cv-management-frontend/
|-- package-lock.json                  # or pnpm-lock.yaml / yarn.lock, depending on selected package manager
|-- src/
|   `-- app/
|       `-- router/
|           `-- fallbacks/
|               |-- UnauthorizedPage.tsx
|               `-- NotFoundPage.tsx
`-- e2e/
    `-- auth.admin.spec.ts
```

