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
import { RequireAdmin, RequireStudent } from './routeGuards'
import { fallbackRoutes } from './fallbackRoutes'
import {
  AcademicLedgerPage,
  AcademicRecordsPage,
  AdminDashboardPage,
  AdminLoginPage,
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
          { path: routePaths.studentSignUp, element: withSuspense(<StudentSignUpPage />) },
          { path: routePaths.studentVerifyOtp, element: withSuspense(<VerifyOtpPage />) },
          { path: routePaths.studentCreatePassword, element: withSuspense(<CreatePasswordPage />) },
          { path: routePaths.studentLogin, element: withSuspense(<StudentLoginPage />) },
          { path: routePaths.studentForgotPassword, element: withSuspense(<ForgotPasswordPage />) },
          { path: routePaths.adminLogin, element: withSuspense(<AdminLoginPage />) },
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
