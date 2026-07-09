import type { ReactElement, ReactNode } from 'react'
import { Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { AdminLayout } from '../layouts/AdminLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { RootLayout } from '../layouts/RootLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { RouteErrorElement } from '../../shared/errors/routeErrorElement'
import {
  PublicOnlyRoute,
  RequireAdmin,
  RequireResetContextRoute,
  RequireStudent,
  RequireVerificationContextRoute,
} from './routeGuards'
import { fallbackRoutes } from './fallbackRoutes'
import {
  AcademicLedgerPage,
  AcademicRecordsPage,
  AdminCreatePasswordPage,
  AdminDashboardPage,
  AdminForgotPasswordPage,
  AdminLoginPage,
  AdminVerifyResetOtpPage,
  CandidateFilteringPage,
  CreatePasswordPage,
  CvBuilderPage,
  ForgotPasswordPage,
  HomePage,
  InternshipManagementPage,
  RegisteredStudentsPage,
  ShortlistsPage,
  StudentDashboardPage,
  StudentDeepDivePage,
  StudentLoginPage,
  StudentProfilePage,
  StudentProjectsPage,
  StudentResetOtpPage,
  StudentResetPasswordPage,
  StudentSignUpPage,
  StudentSkillsPage,
  VerifyOtpPage,
} from './lazyRoutes'

import {
  AuthSkeleton,
  StudentDashboardSkeleton,
  AdminDashboardSkeleton,
  TableSkeleton,
  WorkspaceSkeleton,
  FormSkeleton,
} from '../../shared/skeletons'

const withSuspense = (element: ReactElement, fallback: ReactNode = <FormSkeleton />) => (
  <Suspense fallback={fallback}>{element}</Suspense>
)

export const routes: RouteObject[] = [
  {
    path: routePaths.home,
    element: <RootLayout />,
    errorElement: <RouteErrorElement />,
    children: [
      { index: true, element: withSuspense(<HomePage />, <FormSkeleton />) },
      {
        element: <AuthLayout />,
        children: [
          {
            path: routePaths.studentSignUp,
            element: withSuspense(
              <PublicOnlyRoute>
                <StudentSignUpPage />
              </PublicOnlyRoute>,
              <AuthSkeleton variant="student-sign-up" />
            ),
          },
          {
            path: routePaths.studentVerifyOtp,
            element: withSuspense(
              <PublicOnlyRoute>
                <RequireVerificationContextRoute>
                  <VerifyOtpPage />
                </RequireVerificationContextRoute>
              </PublicOnlyRoute>,
              <AuthSkeleton variant="otp" />
            ),
          },
          {
            path: routePaths.studentCreatePassword,
            element: withSuspense(
              <PublicOnlyRoute>
                <RequireVerificationContextRoute requireVerified>
                  <CreatePasswordPage />
                </RequireVerificationContextRoute>
              </PublicOnlyRoute>,
              <AuthSkeleton variant="create-password" />
            ),
          },
          {
            path: routePaths.studentLogin,
            element: withSuspense(
              <PublicOnlyRoute>
                <StudentLoginPage />
              </PublicOnlyRoute>,
              <AuthSkeleton variant="student-login" />
            ),
          },
          {
            path: routePaths.studentForgotPassword,
            element: withSuspense(
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>,
              <AuthSkeleton variant="forgot-password" />
            ),
          },
          {
            path: routePaths.studentResetVerifyOtp,
            element: withSuspense(
              <PublicOnlyRoute>
                <RequireResetContextRoute
                  accountType="STUDENT"
                  redirectTo={routePaths.studentForgotPassword}
                >
                  <StudentResetOtpPage />
                </RequireResetContextRoute>
              </PublicOnlyRoute>,
              <AuthSkeleton variant="otp" />
            ),
          },
          {
            path: routePaths.studentResetCreatePassword,
            element: withSuspense(
              <PublicOnlyRoute>
                <RequireResetContextRoute
                  accountType="STUDENT"
                  redirectTo={routePaths.studentForgotPassword}
                  requireVerified
                >
                  <StudentResetPasswordPage />
                </RequireResetContextRoute>
              </PublicOnlyRoute>,
              <AuthSkeleton variant="create-password" />
            ),
          },
          {
            path: routePaths.adminLogin,
            element: withSuspense(
              <PublicOnlyRoute>
                <AdminLoginPage />
              </PublicOnlyRoute>,
              <AuthSkeleton variant="admin-login" />
            ),
          },
          {
            path: routePaths.adminForgotPassword,
            element: withSuspense(
              <PublicOnlyRoute>
                <AdminForgotPasswordPage />
              </PublicOnlyRoute>,
              <AuthSkeleton variant="forgot-password" />
            ),
          },
          {
            path: routePaths.adminVerifyResetOtp,
            element: withSuspense(
              <PublicOnlyRoute>
                <RequireResetContextRoute
                  accountType="ADMIN"
                  redirectTo={routePaths.adminForgotPassword}
                >
                  <AdminVerifyResetOtpPage />
                </RequireResetContextRoute>
              </PublicOnlyRoute>,
              <AuthSkeleton variant="otp" />
            ),
          },
          {
            path: routePaths.adminCreatePassword,
            element: withSuspense(
              <PublicOnlyRoute>
                <RequireResetContextRoute
                  accountType="ADMIN"
                  redirectTo={routePaths.adminForgotPassword}
                  requireVerified
                >
                  <AdminCreatePasswordPage />
                </RequireResetContextRoute>
              </PublicOnlyRoute>,
              <AuthSkeleton variant="create-password" />
            ),
          },
        ],
      },
      {
        element: (
          <RequireStudent>
            <StudentLayout />
          </RequireStudent>
        ),
        children: [
          {
            path: routePaths.studentDashboard,
            element: withSuspense(<StudentDashboardPage />, <StudentDashboardSkeleton />),
          },
          {
            path: routePaths.studentProfile,
            element: withSuspense(<StudentProfilePage />, <FormSkeleton variant="profile" />),
          },
          {
            path: routePaths.studentSkills,
            element: withSuspense(<StudentSkillsPage />, <WorkspaceSkeleton variant="skills" />),
          },
          {
            path: routePaths.studentProjects,
            element: withSuspense(<StudentProjectsPage />, <TableSkeleton variant="student-projects" />),
          },
          {
            path: routePaths.studentCvBuilder,
            element: withSuspense(<CvBuilderPage />, <WorkspaceSkeleton variant="cv-builder" />),
          },
          {
            path: routePaths.studentAcademicRecords,
            element: withSuspense(<AcademicRecordsPage />, <TableSkeleton variant="academic-records" />),
          },
        ],
      },
      {
        element: (
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        ),
        children: [
          {
            path: routePaths.adminDashboard,
            element: withSuspense(<AdminDashboardPage />, <AdminDashboardSkeleton />),
          },
          {
            path: routePaths.adminAcademicLedger,
            element: withSuspense(<AcademicLedgerPage />, <TableSkeleton variant="academic-ledger" />),
          },
          {
            path: routePaths.adminStudents,
            element: withSuspense(<RegisteredStudentsPage />, <TableSkeleton variant="registered-students" />),
          },
          {
            path: routePaths.adminStudentDetail,
            element: withSuspense(<StudentDeepDivePage />, <FormSkeleton variant="student-detail" />),
          },
          {
            path: routePaths.adminInternships,
            element: withSuspense(<InternshipManagementPage />, <TableSkeleton variant="internship-management" />),
          },
          {
            path: routePaths.adminCandidateFiltering,
            element: withSuspense(<CandidateFilteringPage />, <TableSkeleton variant="candidate-filtering" />),
          },
          {
            path: routePaths.adminShortlists,
            element: withSuspense(<ShortlistsPage />, <TableSkeleton variant="shortlists" />),
          },
        ],
      },
      ...fallbackRoutes,
    ],
  },
]
