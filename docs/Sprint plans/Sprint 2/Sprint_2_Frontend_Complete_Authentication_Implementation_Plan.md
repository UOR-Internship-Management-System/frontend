# Sprint 2 Frontend Implementation Plan — Complete Authentication

**Project:** CV Management and Deterministic Internship Candidate Filtering System  
**Plan type:** Frontend implementation plan  
**Sprint:** Sprint 2 — Complete Authentication  
**Target stack:** React + TypeScript, Vite, React Router, TanStack Query or equivalent, REST/JSON, OpenAPI-generated types where available  
**Status:** Implementation-ready planning document  
**Prepared role perspective:** Senior Solutions Architect / Technical Lead  

---

## 1. Purpose

This document defines the frontend implementation plan for the supervisor-approved Sprint 2 authentication expansion. It translates the Sprint 2 Complete Authentication Addendum into actionable frontend work while preserving all existing scope guardrails.

Sprint 2 frontend work must deliver a complete authentication experience for both valid human actors:

1. **Student** — sign-up, auto-verification, OTP, initial password creation, login, logout, forgot-password reset, and protected Student routing.
2. **Department Admin** — sign-in using predefined Admin credentials, OTP-based forgot-password reset, Admin token/session handling, and protected Admin routing.

This document intentionally does **not** authorize Admin operational modules such as ledger upload, registered student inspection, filtering, shortlisting, or export. Those remain in later sprints, except for a minimal Admin dashboard shell needed to verify authentication redirection.

---

## 2. Reviewed Source Set and How Each Source Controls This Plan

| Source | Frontend relevance for this plan | Rule applied |
|---|---|---|
| `Sprint_2_Complete_Authentication_Addendum.md` | Primary supplemental source for moving Admin Sign-In and Admin password reset into Sprint 2. | Use as Sprint 2 authentication scope addendum only; do not treat it as approval for wider Admin modules. |
| `45_Day_Agile_Sprint_Implementation_Plan_CV_Management (1).md` | Original sprint roadmap and implementation cadence. | Revise Sprint 2 to Complete Authentication; move only Admin authentication from Sprint 6 to Sprint 2. |
| `Final_Reduced_Scope_Baseline_Document_v1.1 (1).docx` | Root scope authority. | No frontend behavior may conflict with the reduced-scope baseline. |
| `Scope reductions.docx` | Confirms removal of Admin approval, temporary password, Admin Skill Master, and Admin skill CRUD/import. | Exclude all removed scope from routes, text, components, tests, and mock data. |
| `Software_Requirements_Specification_v3.0.1 (1) (1).docx` | Requirements authority for authentication, RBAC, validation, negative requirements, and acceptance behavior. | Frontend must support required auth flows and failure states without bypassing backend security. |
| `UI_Frontend_Specification_v1.1 (1).docx` | React implementation, route guards, API integration, UI states, validation, loading skeletons, accessibility, dark mode, and testing gates. | Implement using feature/domain structure, route-level guards, server-state handling, reusable components, and removed-scope checks. |
| `Frontend_Folder_Structure_Implementation_Plan_v1.0 (1).docx` | Required frontend repository structure and route organization. | Use `src/features`, `src/app`, and `src/shared` boundaries; avoid flat global service/page structures. |
| `Student_Admin_Workflow_Document_v1.0 (1).docx` | Page transitions, UI responses, backend system actions, failure paths, RBAC behavior. | Use existing Student auth workflows and Admin Login workflow; add Sprint 2-local Admin reset workflow traceability. |
| `Production_Ready_Use_Case_Documentation_v1.0 (1).docx` | Actor-goal model and negative use-case checklist. | Only Student and Department Admin are primary actors; Company remains non-login stakeholder. |
| `API_Specification_Document_v1.0 (1) (1).docx` | REST/JSON groups, status/error model, RBAC boundaries, validation expectations. | Use approved endpoint families; do not invent frontend-only fake contracts. |
| `CV_Management_API_OpenAPI_v1.0 (1).yaml` | Machine-readable API direction for auth, verification, OTP, password reset, `/auth/me`, and logout. | Generate or align frontend DTOs/hooks with this contract plus the Sprint 2 password-reset addendum. |
| `Backend_Module_Documentation_v1.0 (1).docx` | Backend module responsibilities and RBAC/security expectations. | Frontend route guards are UX only; backend remains security authority. |
| `Backend_Folder_Structure_Implementation_Plan_v1.0 (1).docx` | Backend structure reference for integration naming and module boundaries. | Keep frontend API wrappers aligned to backend module boundaries. |
| `Database_Design_Document_v1.0 (1) (1).docx` | Account, role, predefined Admin, OTP/reset persistence expectations. | Frontend must not assume local-only accounts or demo arrays. |
| `Student.docx` | Student page behavior and visible auth page expectations. | Use Student registration, OTP, password creation, login, and forgot-password layouts where aligned with higher authority. |
| `Admin.docx` | Admin page behavior and Admin Sign-In layout evidence. | Use Admin Sign-In visual/page expectations without adding Admin operations. |
| `Student Pages.zip` | HTML prototype evidence for Student auth pages and supporting JS. | Use as visual/page evidence only; do not copy frontend-only demo behavior as final logic. |
| `Admin Pages.zip` | HTML prototype evidence for Admin Sign-In and Admin page inventory. | Use Admin Sign-In visual evidence only for Sprint 2; Admin dashboard content remains shell-only. |
| `New DESIGN (1).md` | UI design tokens, Material-inspired academic dashboard style, responsive and dark-mode rules, selector safety. | Apply shared visual standard without changing business behavior. |
| `Skill List breakdown.pdf` | Structural taxonomy reference. | Not part of Sprint 2 auth; only included as a guardrail not to implement Admin skill management. |
| `Project Management Diagrams.zip` | Project workflow/scheduling visual evidence. | Reference only; does not override sprint scope or add features. |

---

## 3. Frontend Scope for Sprint 2

### 3.1 Included

| Area | Included frontend behavior |
|---|---|
| Student sign-up | Full Name, Index Number, University Email form; validation; verification status modal. |
| Student verification status | Loading, success, and failure states; redirect to OTP page on successful backend verification. |
| Student OTP | Six-digit OTP entry, verify, resend, expiry messaging, retry-safe errors. |
| Student initial password | New Password + Confirm Password, validation, create password action. |
| Student login | University Email + Password, login mutation, `/auth/me` hydration, redirect to Student dashboard shell. |
| Student forgot password | Email submission, reset OTP, reset password, redirect to Student login. |
| Admin Sign-In | `/admin/login`, Admin Email Address + Security Password, login mutation, role check, redirect to Admin dashboard shell. |
| Admin forgot password | `/admin/forgot-password`, reset OTP, reset password, redirect to Admin login. |
| Auth session UX | Token/session storage wrapper, current user provider, logout, role-aware redirects. |
| Route protection | Public auth routes, Student-only routes, Admin-only routes, unauthorized route. |
| Error handling | Safe generic errors, inline field errors, toast/success feedback, route-level recovery. |
| Tests | Unit/component tests, API mock tests, Playwright E2E happy paths and negative-scope scans. |

### 3.2 Explicitly Excluded

The frontend must not create, route, display, mock, or test any of the following as active behavior:

- Admin self-registration.
- Admin approval of Student sign-up.
- Pending/rejected Student registration lifecycle.
- Temporary password page, wording, DTO, or mocked behavior.
- Admin-issued password workflow.
- Admin dashboard metrics implementation.
- Academic ledger upload/staging/validation/commit.
- Registered Student list/deep-dive.
- Company login or company portal.
- Admin Skill Master, skill CRUD, skill upload/import.
- CV review/approval/rejection/correction workflow.
- AI scoring, AI ranking, match percentage, or automated selection.
- GPA fields in internship-request UI.
- Frontend-only persistent demo arrays as final implementation state.

---

## 4. Target Frontend Architecture

### 4.1 Repository Boundary

Use the existing feature/domain module standard:

```text
src/
  app/
    providers/
    routes/
    layouts/
    guards/
  features/
    student-auth/
    admin-auth/
  shared/
    api/
    auth/
    ui/
    validation/
    errors/
    config/
    testing/
```

Rules:

1. Auth feature folders own auth-specific pages, components, hooks, schemas, mappers, and tests.
2. `src/shared` contains reusable primitives only: UI primitives, generic API client, auth/session helpers, validation utilities, and test utilities.
3. Business-specific authentication behavior must not be hidden inside generic shared components.
4. Route guards provide UX protection only. Backend RBAC remains authoritative.
5. Do not use browser arrays/local mocks as final state. MSW fixtures may exist only inside tests/dev mocks.

### 4.2 Feature Module Layout

```text
src/features/student-auth/
  api/
    studentAuthApi.ts
  components/
    StudentSignUpForm.tsx
    VerificationStatusDialog.tsx
    StudentOtpForm.tsx
    StudentCreatePasswordForm.tsx
    StudentLoginForm.tsx
    StudentForgotPasswordForm.tsx
    StudentResetOtpForm.tsx
    StudentResetPasswordForm.tsx
  hooks/
    useStartStudentVerification.ts
    useVerifyStudentOtp.ts
    useResendStudentOtp.ts
    useCreateStudentPassword.ts
    useStudentLogin.ts
    useStartStudentPasswordReset.ts
    useVerifyStudentResetOtp.ts
    useResendStudentResetOtp.ts
    useCompleteStudentPasswordReset.ts
  pages/
    StudentSignUpPage.tsx
    StudentVerifyOtpPage.tsx
    StudentCreatePasswordPage.tsx
    StudentLoginPage.tsx
    StudentForgotPasswordPage.tsx
    StudentResetOtpPage.tsx
    StudentResetPasswordPage.tsx
  schemas/
    studentAuthSchemas.ts
  types/
    studentAuthTypes.ts
  tests/
    student-auth.unit.test.tsx
    student-auth.integration.test.tsx
```

```text
src/features/admin-auth/
  api/
    adminAuthApi.ts
  components/
    AdminLoginForm.tsx
    AdminForgotPasswordForm.tsx
    AdminResetOtpForm.tsx
    AdminCreatePasswordForm.tsx
  hooks/
    useAdminLogin.ts
    useStartAdminPasswordReset.ts
    useVerifyAdminResetOtp.ts
    useResendAdminResetOtp.ts
    useCompleteAdminPasswordReset.ts
  pages/
    AdminLoginPage.tsx
    AdminForgotPasswordPage.tsx
    AdminVerifyResetOtpPage.tsx
    AdminCreatePasswordPage.tsx
  schemas/
    adminAuthSchemas.ts
  types/
    adminAuthTypes.ts
  tests/
    admin-auth.unit.test.tsx
    admin-auth.integration.test.tsx
```

```text
src/shared/auth/
  AuthProvider.tsx
  authStorage.ts
  authTypes.ts
  currentUserMapper.ts
  permissions.ts
  redirects.ts
  useAuth.ts
```

```text
src/app/guards/
  PublicOnlyRoute.tsx
  RequireAuthRoute.tsx
  RequireRoleRoute.tsx
  RequireResetContextRoute.tsx
```

```text
src/app/routes/
  routePaths.ts
  appRouter.tsx
```

---

## 5. Route Inventory

### 5.1 Public Authentication Routes

| Route | Page component | Actor | Sprint 2 status | Notes |
|---|---|---|---|---|
| `/student/sign-up` | `StudentSignUpPage` | Student | Build | Public. Starts Student onboarding verification. |
| `/student/verify-otp` | `StudentVerifyOtpPage` | Student | Build | Requires `verificationId` context. |
| `/student/create-password` | `StudentCreatePasswordPage` | Student | Build | Requires verified onboarding OTP context. |
| `/student/login` | `StudentLoginPage` | Student | Build | Public. Redirect authenticated Student to dashboard shell. |
| `/student/forgot-password` | `StudentForgotPasswordPage` | Student | Build | Starts reset with `accountType: STUDENT`. |
| `/student/reset/verify-otp` | `StudentResetOtpPage` | Student | Build | Requires `resetId` context. |
| `/student/reset/create-password` | `StudentResetPasswordPage` | Student | Build | Requires verified reset context. |
| `/admin/login` | `AdminLoginPage` | Department Admin | Build | Public. Predefined Admin only. |
| `/admin/forgot-password` | `AdminForgotPasswordPage` | Department Admin | Build | Starts reset with `accountType: ADMIN`. |
| `/admin/verify-reset-otp` | `AdminVerifyResetOtpPage` | Department Admin | Build | Requires `resetId` context. |
| `/admin/create-password` | `AdminCreatePasswordPage` | Department Admin | Build | Requires verified reset context. |
| `/unauthorized` | `UnauthorizedPage` | Student/Admin | Build/confirm | Generic safe access-denied page. |

### 5.2 Protected Shell Routes

| Route | Component | Access | Sprint 2 behavior |
|---|---|---|---|
| `/student/dashboard` | `StudentDashboardShellPage` | `STUDENT` | Shell only if dashboard data is not in Sprint 2 implementation scope. |
| `/admin/dashboard` | `AdminDashboardShellPage` | `ADMIN` | Shell only for redirect verification. No real metrics until Sprint 6. |

Route shell rule: Shell pages may show a minimal authenticated landing message and logout button. They must not implement dashboard metrics, ledger upload, registered student search, or Admin operations.

---

## 6. API Integration Plan

### 6.1 Shared API Client

Implement or confirm:

```text
src/shared/api/
  httpClient.ts
  apiConfig.ts
  apiErrors.ts
  generated/
  queryClient.ts
```

Required behavior:

1. Base URL from environment variable, for example `VITE_API_BASE_URL=/api/v1`.
2. JSON request/response handling.
3. Bearer token attachment for authenticated requests.
4. Central mapping of backend standard errors to frontend-safe error objects.
5. Request cancellation support through TanStack Query or equivalent.
6. No raw passwords, OTPs, or tokens logged in console.

### 6.2 Sprint 2 Endpoint Mapping

| UI action | Endpoint | Method | Hook |
|---|---|---:|---|
| Start Student sign-up verification | `/student-verifications` | POST | `useStartStudentVerification` |
| Verify onboarding OTP | `/student-verifications/{verificationId}/otp/verify` | POST | `useVerifyStudentOtp` |
| Resend onboarding OTP | `/student-verifications/{verificationId}/otp/resend` | POST | `useResendStudentOtp` |
| Create initial Student password | `/student-verifications/{verificationId}/password` | POST | `useCreateStudentPassword` |
| Student login | `/auth/student/login` | POST | `useStudentLogin` |
| Admin login | `/auth/admin/login` | POST | `useAdminLogin` |
| Start Student reset | `/password-resets` with `accountType: STUDENT` | POST | `useStartStudentPasswordReset` |
| Start Admin reset | `/password-resets` with `accountType: ADMIN` | POST | `useStartAdminPasswordReset` |
| Verify reset OTP | `/password-resets/{resetId}/otp/verify` | POST | role-specific reset OTP hook |
| Resend reset OTP | `/password-resets/{resetId}/otp/resend` | POST | role-specific reset resend hook |
| Complete reset password | `/password-resets/{resetId}/password` | POST | role-specific reset completion hook |
| Get current user | `/auth/me` | GET | `useCurrentUser` / AuthProvider bootstrap |
| Logout | `/auth/logout` | POST | `useLogout` |

### 6.3 Password Reset Payload Rule

Frontend must send account type explicitly:

```ts
type PasswordResetStartRequest = {
  accountType: 'STUDENT' | 'ADMIN';
  email: string;
};
```

Do not infer `accountType` from backend URL alone. Role-specific pages may set the value internally and must not expose a cross-role switch unless explicitly approved.

---

## 7. Authentication State Model

### 7.1 AuthProvider Responsibilities

`AuthProvider` owns:

- Current authenticated user object.
- Access token or session state wrapper.
- `isAuthenticated` boolean.
- `role` / `roles` list.
- Bootstrap loading state while `/auth/me` is pending.
- Logout action.
- Role-aware redirect helpers.

### 7.2 Current User Model

```ts
type AuthRole = 'STUDENT' | 'ADMIN';

type CurrentUser = {
  userId: string;
  accountId: string;
  email: string;
  displayName: string;
  roles: AuthRole[];
  primaryRole: AuthRole;
};
```

Mapping rule: Use backend response fields from OpenAPI-generated types where available. If backend naming differs, map once in `currentUserMapper.ts`; do not scatter ad hoc mappings inside pages.

### 7.3 Token Storage Decision

The frontend must implement one storage strategy consistently:

| Option | Sprint 2 recommendation | Rule |
|---|---|---|
| In-memory token | Acceptable and safer for short demos | Requires login after refresh. |
| Session storage | Acceptable for student project convenience | Clear on logout; avoid logging. |
| Secure HTTP-only cookie | Acceptable if backend is ready | Requires backend CORS/CSRF decision. |
| Long-lived localStorage | Avoid unless team explicitly accepts risk | Must not store refresh tokens casually. |

Implementation note: The plan does not mandate a refresh-token system because that is not explicitly required for Sprint 2 and may exceed the immediate scope.

---

## 8. Reset Context State Model

### 8.1 Why Context Is Needed

OTP and reset pages require a valid `verificationId` or `resetId`. Users may refresh or navigate directly. The frontend must handle missing context safely.

### 8.2 Context Storage

Use session-scoped storage for short-lived flow metadata:

```ts
type VerificationFlowContext = {
  verificationId: string;
  email: string;
  expiresAt?: string;
};

type PasswordResetFlowContext = {
  resetId: string;
  accountType: 'STUDENT' | 'ADMIN';
  email: string;
  otpVerified?: boolean;
  expiresAt?: string;
};
```

Rules:

1. Never store OTP value.
2. Never store password values.
3. Clear context after successful password creation/reset.
4. If required context is missing, redirect to the relevant start page.
5. If backend rejects a context as expired or invalid, clear frontend context and show safe recovery guidance.

---

## 9. Page-by-Page Implementation Details

### 9.1 Student Sign-Up Page

**Route:** `/student/sign-up`  
**Component:** `StudentSignUpPage`

Fields:

| Field | Required | Validation |
|---|---:|---|
| Full Name | Yes | Non-empty, reasonable length. Used as display data only. |
| Index Number | Yes | Required; format validation according to final backend/SRS rule. |
| University Email | Yes | Email format; university email domain if backend/SRS requires it. |

Behavior:

1. User fills form.
2. Client validation runs before API call.
3. Open `VerificationStatusDialog` in loading state.
4. Call `POST /student-verifications`.
5. On success, store `verificationId` context and show verified state briefly.
6. Redirect to `/student/verify-otp`.
7. On failure, show failure state and allow user to close modal and correct fields.

Guardrails:

- Do not show pending approval wording.
- Do not mention Admin review.
- Do not create a Student dashboard session before password creation/login unless backend explicitly returns an authenticated session.

### 9.2 Verification Status Dialog

**Component:** `VerificationStatusDialog`

States:

| State | UI |
|---|---|
| `loading` | Spinner and text such as “Your details are verifying ...” |
| `success` | Success icon/text and automatic redirect. No close button required. |
| `failure` | Error icon/text and close button. |

Accessibility:

- Use `role="dialog"`.
- Announce state updates using `aria-live="polite"`.
- Do not trap user permanently during failure.

### 9.3 Student OTP Verification Page

**Route:** `/student/verify-otp`

Fields and controls:

- Six-digit OTP input.
- Verify button.
- Resend OTP button with cooldown.
- Back to sign-up link only if safe.

Behavior:

1. Require `verificationId` context.
2. Validate OTP length before submission.
3. Call onboarding OTP verify endpoint.
4. On success, mark context as verified and redirect to `/student/create-password`.
5. On incorrect OTP, show safe inline error and keep input focused.
6. On expired OTP, show resend/restart guidance.
7. On retry-limit failure, clear or lock context and ask user to restart.

### 9.4 Student Initial Password Creation Page

**Route:** `/student/create-password`

Fields:

| Field | Validation |
|---|---|
| New Password | Required, follows backend policy. |
| Confirm New Password | Required, must match. |

Behavior:

1. Require verified onboarding OTP context.
2. Validate password match locally.
3. Call create password endpoint.
4. On success, clear verification context and redirect to `/student/login`.
5. Do not auto-login unless backend and supervisor explicitly approve.

### 9.5 Student Login Page

**Route:** `/student/login`

Fields:

| Field | Validation |
|---|---|
| University Email | Required email format. |
| Password | Required. |

Behavior:

1. Call `POST /auth/student/login`.
2. Store returned token/session via shared auth storage.
3. Hydrate current user via response or `/auth/me`.
4. Confirm role contains `STUDENT`.
5. Redirect to `/student/dashboard` shell.
6. If backend returns non-Student role, clear session and redirect `/unauthorized`.

### 9.6 Student Forgot Password Flow

Routes:

- `/student/forgot-password`
- `/student/reset/verify-otp`
- `/student/reset/create-password`

Start request:

```ts
{ accountType: 'STUDENT', email }
```

Behavior:

1. Submit email.
2. Show safe response; do not reveal account existence beyond backend-approved text.
3. Store `resetId` context only when backend returns it.
4. Verify OTP.
5. Create new password.
6. Clear context and redirect to `/student/login`.

### 9.7 Admin Login Page

**Route:** `/admin/login`  
**Component:** `AdminLoginPage`

Layout:

- Split layout aligned with Admin Sign-In visual evidence.
- Left welcome panel: “Welcome back, administrator.” or approved equivalent.
- Right login card: “Admin Login”.
- Admin Email Address input.
- Security Password input.
- Log In button.
- Forgot Password link.
- Optional support text directing access issues to IT/Operations.

Behavior:

1. Validate required email/password.
2. Call `POST /auth/admin/login`.
3. Store token/session via shared auth storage.
4. Confirm current user has `ADMIN` role.
5. Redirect to `/admin/dashboard` shell.
6. Invalid credentials display a generic safe message.
7. Disabled/inactive Admin displays safe support message.
8. Non-Admin role must be blocked and redirected to `/unauthorized`.

Guardrails:

- No “Admin Sign Up” link.
- No “Request Admin Account” workflow unless it is a static support note.
- No temporary password wording.
- No Admin dashboard metrics in Sprint 2.

### 9.8 Admin Forgot Password Page

**Route:** `/admin/forgot-password`

Content:

- Title: `Forgot Password?`
- Helper text: `Provide your administrator email address to request a One-Time Password.`
- Admin email input.
- Send OTP button.
- Back to Admin Login link.

Start request:

```ts
{ accountType: 'ADMIN', email }
```

Behavior:

1. Validate email format.
2. Call shared password reset start endpoint.
3. Show safe response.
4. If `resetId` is returned, store reset context and redirect to `/admin/verify-reset-otp`.
5. Unknown email must not create an Admin account or expose account existence.

### 9.9 Admin Reset OTP Page

**Route:** `/admin/verify-reset-otp`

Behavior mirrors Student reset OTP, with `accountType: ADMIN` context.

Controls:

- Six-digit OTP input.
- Verify button.
- Resend button with cooldown.
- Back to Admin Forgot Password.

### 9.10 Admin Create Password Page

**Route:** `/admin/create-password`

Behavior:

1. Require verified reset context for `ADMIN`.
2. Validate New Password and Confirm Password.
3. Call reset password completion endpoint.
4. On success, clear reset context.
5. Redirect to `/admin/login`.
6. Do not auto-login after reset unless explicitly approved.

---

## 10. Validation Schemas

Use a schema library already approved by the team, or implement typed validation functions. Suggested schemas:

```ts
studentSignUpSchema = {
  fullName: requiredString,
  indexNumber: requiredString,
  universityEmail: requiredEmail
}

loginSchema = {
  email: requiredEmail,
  password: requiredString
}

otpSchema = {
  otp: requiredSixDigitString
}

passwordSchema = {
  newPassword: requiredPassword,
  confirmPassword: matchesNewPassword
}

passwordResetStartSchema = {
  email: requiredEmail
}
```

Rules:

1. Frontend validation improves user experience only.
2. Backend validation remains authoritative.
3. Password policy text must match backend policy. If backend policy is not finalized, show neutral helper text and rely on backend error mapping.

---

## 11. Shared UI Components Required

| Component | Purpose | Sprint 2 usage |
|---|---|---|
| `Button` | Primary/secondary/destructive/loading states | All auth forms |
| `TextInput` | Labeled input with error text | Email, index, name |
| `PasswordInput` | Masked password with optional reveal | Login/create/reset password |
| `OtpInput` | Six-digit OTP entry | Student OTP and reset OTP |
| `Modal` / `Dialog` | Verification status | Student sign-up verification |
| `InlineAlert` | Safe error/success messages | All forms |
| `LoadingSpinner` | Pending form and modal states | Submit operations |
| `AuthSplitLayout` | Two-column auth page layout | Student sign-up/login, Admin login if applicable |
| `AuthCard` | Form card container | Auth forms |
| `LinkButton` | Navigation links | Forgot password/back to login |

Design rules:

- Follow Material-inspired academic dashboard visual direction.
- Use design tokens from the existing design standard.
- Honor dark mode for cards, fields, modals, text, icons, and skeletons.
- Maintain responsive layout: split layouts collapse to stacked layout on mobile.
- Preserve accessible labels and keyboard behavior.

---

## 12. Implementation Sequence

### Day 1 — Contract and Frontend Foundation

| Task ID | Task | Output |
|---|---|---|
| FE-S2-001 | Confirm route list and API payloads with backend lead | Final route/API mapping for Sprint 2 |
| FE-S2-002 | Add route constants to `routePaths.ts` | Centralized path names |
| FE-S2-003 | Add/confirm `AuthProvider`, `RequireRoleRoute`, `RequireResetContextRoute` | Auth shell and guards |
| FE-S2-004 | Add shared auth UI primitives or confirm existing ones | Reusable form components |
| FE-S2-005 | Add MSW handlers for Sprint 2 auth endpoints | Frontend can develop against stable mocks |
| FE-S2-006 | Add removed-scope UI scan script/list | Guardrail from day one |

### Day 2 — Student Onboarding and Login

| Task ID | Task | Output |
|---|---|---|
| FE-S2-101 | Build Student Sign-Up page/form | `/student/sign-up` working |
| FE-S2-102 | Build verification modal states | Loading/success/failure modal |
| FE-S2-103 | Build Student OTP page | OTP verify/resend UI |
| FE-S2-104 | Build Student create password page | Initial password setup UI |
| FE-S2-105 | Build Student login page | Student login + redirect |
| FE-S2-106 | Add tests for Student sign-up/OTP/password/login | Unit and integration coverage |

### Day 3 — Admin Sign-In

| Task ID | Task | Output |
|---|---|---|
| FE-S2-201 | Build Admin Login page from Admin visual direction | `/admin/login` working |
| FE-S2-202 | Add `useAdminLogin` hook and API wrapper | Calls `/auth/admin/login` |
| FE-S2-203 | Add Admin role guard and redirect behavior | Admin-only route protection |
| FE-S2-204 | Add Admin dashboard shell only | Redirect target without real metrics |
| FE-S2-205 | Add Admin login tests | Valid, invalid, wrong role, disabled account handling |

### Day 4 — Unified Student/Admin Password Reset

| Task ID | Task | Output |
|---|---|---|
| FE-S2-301 | Build Student forgot/reset OTP/reset password pages | Student reset flow complete |
| FE-S2-302 | Build Admin forgot/reset OTP/create password pages | Admin reset flow complete |
| FE-S2-303 | Add reset context guards | Direct navigation handled safely |
| FE-S2-304 | Add resend cooldown UX | Cooldown displayed and enforced client-side |
| FE-S2-305 | Add password reset tests | Student/Admin reset coverage |

### Day 5 — Integration, QA, and Demo Hardening

| Task ID | Task | Output |
|---|---|---|
| FE-S2-401 | Integrate with real backend endpoints | Replace/align MSW with backend where ready |
| FE-S2-402 | Run Playwright auth flows | Student and Admin auth demos pass |
| FE-S2-403 | Run accessibility checks | Labels, focus, dialogs, keyboard flow pass |
| FE-S2-404 | Run removed-scope scan | No forbidden routes/text/components |
| FE-S2-405 | Prepare Sprint 2 frontend demo script | Supervisor-ready auth demonstration |

---

## 13. Testing Plan

### 13.1 Unit and Component Tests

| Area | Required tests |
|---|---|
| Student Sign-Up | Required fields, invalid email, verification loading/success/failure states. |
| Student OTP | Six-digit validation, verify success, incorrect OTP, expired OTP, resend cooldown. |
| Student Password | Password mismatch, backend policy error, success redirect. |
| Student Login | Invalid credentials, success redirect, wrong role rejected. |
| Admin Login | Required email/password, invalid email, success redirect, invalid credentials, disabled account safe error, non-Admin role rejected. |
| Admin Reset | Start reset, safe response, OTP verify, resend cooldown, password mismatch, success redirect. |
| AuthProvider | Bootstrap `/auth/me`, logout, token clearing, role mapping. |
| Guards | Public-only behavior, Student-only access, Admin-only access, reset-context protection. |

### 13.2 Integration Tests with MSW

| Test ID | Scenario | Expected behavior |
|---|---|---|
| FE-INT-001 | Student full onboarding | Sign-up → OTP → create password → login → Student dashboard shell. |
| FE-INT-002 | Student forgot password | Forgot password → OTP → reset password → login. |
| FE-INT-003 | Admin login | Admin login → `/auth/me` role check → Admin dashboard shell. |
| FE-INT-004 | Admin forgot password | Forgot password → OTP → create password → login. |
| FE-INT-005 | Wrong-role route access | Student to Admin route and Admin to Student-only owner route are denied. |
| FE-INT-006 | Reset direct URL access | Missing reset context redirects to correct forgot-password page. |

### 13.3 Playwright E2E Tests

| Test ID | Scenario |
|---|---|
| E2E-FE-AUTH-001 | Eligible Student completes onboarding and login. |
| E2E-FE-AUTH-002 | Student resets forgotten password and logs in with new password. |
| E2E-FE-AUTH-003 | Predefined Admin logs in and reaches Admin dashboard shell. |
| E2E-FE-AUTH-004 | Admin resets forgotten password and logs in with new password. |
| E2E-FE-AUTH-005 | Student cannot access `/admin/dashboard`. |
| E2E-FE-AUTH-006 | Unknown Admin email does not create account and does not reveal existence. |
| E2E-FE-AUTH-007 | Removed-scope route scan finds no forbidden routes. |

---

## 14. Frontend Removed-Scope Scan

Before the Sprint 2 review, search route constants, page names, component names, labels, test names, and mocks for forbidden terms.

Forbidden route/component concepts:

```text
admin-sign-up
admin-register
registration-approval
student-approval
pending-registration
rejected-registration
temporary-password
temp-password
admin-skill-master
skill-verification
verified-skill
cv-review
cv-approval
company-login
ai-score
match-percentage
estimated-gpa
```

Pass condition: No active route, component, label, API wrapper, MSW handler, test case, or sidebar item introduces these concepts.

---

## 15. Integration Contract with Backend

Frontend cannot close Sprint 2 unless these backend behaviors are available or mocked with signed-off assumptions:

1. `POST /student-verifications` returns a verification context for eligible Student records.
2. OTP verify/resend works for onboarding.
3. Initial Student password creation works after verified onboarding OTP.
4. Student login returns token/current user with `STUDENT` role.
5. Admin login returns token/current user with `ADMIN` role for predefined Admin accounts.
6. `/auth/me` returns current user context for Student/Admin.
7. Password reset start accepts `accountType` for `STUDENT` and `ADMIN`.
8. Password reset OTP verify/resend works.
9. Password reset completion updates password hash and invalidates reset context.
10. Safe errors do not leak passwords, OTPs, or account existence beyond approved behavior.

---

## 16. Frontend Definition of Done

### Student Auth

- [ ] Student sign-up page implemented and validated.
- [ ] Verification modal has loading, success, and failure states.
- [ ] Student OTP verify/resend implemented.
- [ ] Initial password creation implemented.
- [ ] Student login/logout implemented.
- [ ] Student forgot-password reset implemented.
- [ ] Student route guard implemented.

### Admin Auth

- [ ] Admin Login page implemented.
- [ ] Admin login calls backend and validates `ADMIN` role.
- [ ] Admin dashboard shell exists only as auth redirect target.
- [ ] Admin forgot-password page implemented.
- [ ] Admin reset OTP page implemented.
- [ ] Admin create-password page implemented.
- [ ] Admin route guard implemented.
- [ ] Admin can reset password and log in with new password.

### Quality and Security

- [ ] No raw OTP/password/token logging.
- [ ] Safe generic error messages used for auth failures.
- [ ] Reset context guards block invalid direct access.
- [ ] Route-level errors and loading states exist.
- [ ] Responsive and dark-mode behavior checked for auth pages.
- [ ] Unit/component tests pass.
- [ ] Integration tests pass.
- [ ] Playwright auth flows pass.
- [ ] Removed-scope UI scan passes.

---

## 17. Supervisor Demo Script

1. Open Student Sign-Up.
2. Submit valid Full Name, Index Number, and University Email.
3. Show verification modal loading and success.
4. Enter OTP.
5. Create Student password.
6. Log in as Student and reach Student dashboard shell.
7. Log out.
8. Reset Student password through forgot-password flow.
9. Open Admin Login.
10. Log in using predefined Admin account and reach Admin dashboard shell.
11. Log out.
12. Reset Admin password through OTP flow.
13. Log in using new Admin password.
14. Attempt Student access to Admin route and show unauthorized behavior.
15. Show removed-scope scan result: no Admin approval, no temporary password, no Admin self-registration.

---

## 18. Final Implementation Notes

- Keep Admin operational modules out of Sprint 2.
- Keep Admin dashboard metrics out of Sprint 2 unless separately approved.
- Treat Admin dashboard shell as an auth redirect target only.
- Keep password reset role-specific in UI but shared in backend through `accountType`.
- Do not create any Admin account from the frontend.
- Do not expose a generic account-type selector to users unless the supervisor explicitly asks for a combined reset page.
- Backend remains the authority for identity, role, OTP status, password policy, and access control.
