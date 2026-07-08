import type { ReactElement } from 'react'
import { Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { AdminLayout } from '../layouts/AdminLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { RootLayout } from '../layouts/RootLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { RouteErrorElement } from '../../shared/errors/routeErrorElement'
import { SkeletonBlock } from '../../shared/components/feedback/SkeletonBlock'
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

const withSuspense = (element: ReactElement) => (
  <Suspense fallback={<SkeletonBlock />}>{element}</Suspense>
)

export const routes: RouteObject[] = [
  {
    path: routePaths.home,
    element: <RootLayout />,
    errorElement: <RouteErrorElement />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      {
        element: <AuthLayout />,
        children: [
          {
            path: routePaths.studentSignUp,
            element: withSuspense(
              <PublicOnlyRoute>
                <StudentSignUpPage />
              </PublicOnlyRoute>,
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
            ),
          },
          {
            path: routePaths.studentLogin,
            element: withSuspense(
              <PublicOnlyRoute>
                <StudentLoginPage />
              </PublicOnlyRoute>,
            ),
          },
          {
            path: routePaths.studentForgotPassword,
            element: withSuspense(
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>,
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
            ),
          },
          {
            path: routePaths.adminLogin,
            element: withSuspense(
              <PublicOnlyRoute>
                <AdminLoginPage />
              </PublicOnlyRoute>,
            ),
          },
          {
            path: routePaths.adminForgotPassword,
            element: withSuspense(
              <PublicOnlyRoute>
                <AdminForgotPasswordPage />
              </PublicOnlyRoute>,
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
          { path: routePaths.studentDashboard, element: withSuspense(<StudentDashboardPage />) },
          { path: routePaths.studentProfile, element: withSuspense(<StudentProfilePage />) },
          { path: routePaths.studentSkills, element: withSuspense(<StudentSkillsPage />) },
          { path: routePaths.studentProjects, element: withSuspense(<StudentProjectsPage />) },
          { path: routePaths.studentCvBuilder, element: withSuspense(<CvBuilderPage />) },
          {
            path: routePaths.studentAcademicRecords,
            element: withSuspense(<AcademicRecordsPage />),
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
          { path: routePaths.adminDashboard, element: withSuspense(<AdminDashboardPage />) },
          { path: routePaths.adminAcademicLedger, element: withSuspense(<AcademicLedgerPage />) },
          { path: routePaths.adminStudents, element: withSuspense(<RegisteredStudentsPage />) },
          { path: routePaths.adminStudentDetail, element: withSuspense(<StudentDeepDivePage />) },
          {
            path: routePaths.adminInternships,
            element: withSuspense(<InternshipManagementPage />),
          },
          {
            path: routePaths.adminCandidateFiltering,
            element: withSuspense(<CandidateFilteringPage />),
          },
          { path: routePaths.adminShortlists, element: withSuspense(<ShortlistsPage />) },
        ],
      },
      ...fallbackRoutes,
    ],
  },
]
