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
import { HomePage } from '../../features/home/pages/HomePage'
import {
  AdminCreatePasswordPage,
  AdminDashboardPage,
  AcademicLedgerPage,
  RegisteredStudentsPage,
  StudentDeepDivePage,
  InternshipManagementPage,
  CandidateFilteringPage,
  ShortlistsPage,
  EligibleStudentsPage,
  AdminForgotPasswordPage,
  AdminLoginPage,
  AdminVerifyResetOtpPage,
  CreatePasswordPage,
  ForgotPasswordPage,
  StudentDashboardPage,
  StudentProfilePage,
  StudentSkillsPage,
  StudentProjectsPage,
  CvBuilderPage,
  AcademicRecordsPage,
  StudentLoginPage,
  StudentResetOtpPage,
  StudentResetPasswordPage,
  StudentSignUpPage,
  VerifyOtpPage,
} from './lazyRoutes'

import {
  SkeletonCard,
  SkeletonFormFields,
  SkeletonListRows,
  SkeletonMetricGrid,
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonStatusRegion,
  SkeletonTableGrid,
  SkeletonToolbar,
} from '../../shared/skeletons'

/** A full page skeleton: page header + whatever body primitives the route composes. */
function routeSkeleton(label: string, body: ReactNode) {
  return (
    <SkeletonStatusRegion className="content-stack" label={label}>
      <SkeletonPageHeader action />
      {body}
    </SkeletonStatusRegion>
  )
}

/** A centered auth-card skeleton — same shape every auth route uses, sized by field count. */
function authSkeleton(label: string, fields: number) {
  return (
    <div className="route-skeleton route-skeleton-session">
      <SkeletonStatusRegion className="session-skeleton-card" label={label}>
        <SkeletonCard className="auth-skeleton-shell">
          <SkeletonFormFields count={fields} />
        </SkeletonCard>
      </SkeletonStatusRegion>
    </div>
  )
}

const withSuspense = (
  element: ReactElement,
  fallback: ReactNode = routeSkeleton('Loading', <SkeletonFormFields count={4} />),
) => <Suspense fallback={fallback}>{element}</Suspense>

export const routes: RouteObject[] = [
  {
    path: routePaths.home,
    element: <RootLayout />,
    errorElement: <RouteErrorElement />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <AuthLayout />,
        children: [
          {
            path: routePaths.studentSignUp,
            element: withSuspense(
              <PublicOnlyRoute>
                <StudentSignUpPage />
              </PublicOnlyRoute>,
              authSkeleton('Loading sign up', 6),
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
              authSkeleton('Loading verification', 1),
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
              authSkeleton('Loading', 2),
            ),
          },
          {
            path: routePaths.studentLogin,
            element: withSuspense(
              <PublicOnlyRoute>
                <StudentLoginPage />
              </PublicOnlyRoute>,
              authSkeleton('Loading login', 2),
            ),
          },
          {
            path: routePaths.studentForgotPassword,
            element: withSuspense(
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>,
              authSkeleton('Loading', 1),
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
              authSkeleton('Loading verification', 1),
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
              authSkeleton('Loading', 2),
            ),
          },
          {
            path: routePaths.adminLogin,
            element: withSuspense(
              <PublicOnlyRoute>
                <AdminLoginPage />
              </PublicOnlyRoute>,
              authSkeleton('Loading admin login', 2),
            ),
          },
          {
            path: routePaths.adminForgotPassword,
            element: withSuspense(
              <PublicOnlyRoute>
                <AdminForgotPasswordPage />
              </PublicOnlyRoute>,
              authSkeleton('Loading', 1),
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
              authSkeleton('Loading verification', 1),
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
              authSkeleton('Loading', 2),
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
            element: withSuspense(
              <StudentDashboardPage />,
              routeSkeleton('Loading Student Dashboard', <SkeletonMetricGrid count={4} />),
            ),
          },
          {
            path: routePaths.studentProfile,
            element: withSuspense(
              <StudentProfilePage />,
              routeSkeleton(
                'Loading Student Profile',
                <SkeletonCard>
                  <SkeletonFormFields columns={2} count={8} />
                </SkeletonCard>,
              ),
            ),
          },
          {
            path: routePaths.studentSkills,
            element: withSuspense(
              <StudentSkillsPage />,
              routeSkeleton(
                'Loading Student Skills',
                <SkeletonCard>
                  <SkeletonToolbar fields={2} />
                  <SkeletonListRows count={6} showActions={false} />
                </SkeletonCard>,
              ),
            ),
          },
          {
            path: routePaths.studentProjects,
            element: withSuspense(
              <StudentProjectsPage />,
              routeSkeleton(
                'Loading Student Projects',
                <SkeletonCard>
                  <SkeletonListRows count={4} />
                </SkeletonCard>,
              ),
            ),
          },
          {
            path: routePaths.studentCvBuilder,
            element: withSuspense(
              <CvBuilderPage />,
              routeSkeleton(
                'Loading CV Builder',
                <div className="skeleton-controls-grid">
                  <SkeletonCard>
                    <SkeletonFormFields count={5} />
                  </SkeletonCard>
                  <SkeletonCard title={false}>
                    <SkeletonListRows count={1} showActions={false} />
                  </SkeletonCard>
                </div>,
              ),
            ),
          },
          {
            path: routePaths.studentAcademicRecords,
            element: withSuspense(
              <AcademicRecordsPage />,
              routeSkeleton(
                'Loading Academic Records',
                <>
                  <SkeletonMetricGrid count={3} />
                  <SkeletonCard>
                    <SkeletonTableGrid
                      columns={5}
                      gridTemplateColumns="repeat(5, minmax(120px, 1fr))"
                      rows={5}
                    />
                    <SkeletonPagination />
                  </SkeletonCard>
                </>,
              ),
            ),
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
            element: withSuspense(
              <AdminDashboardPage />,
              routeSkeleton('Loading Admin Dashboard', <SkeletonMetricGrid count={3} />),
            ),
          },
          {
            path: routePaths.adminAcademicLedger,
            element: withSuspense(
              <AcademicLedgerPage />,
              routeSkeleton(
                'Loading Academic Ledger',
                <>
                  <SkeletonCard>
                    <SkeletonFormFields count={2} />
                  </SkeletonCard>
                  <SkeletonCard>
                    <SkeletonTableGrid
                      columns={6}
                      gridTemplateColumns="repeat(6, minmax(100px, 1fr))"
                      rows={4}
                    />
                  </SkeletonCard>
                  <SkeletonCard>
                    <SkeletonListRows count={3} showActions={false} />
                  </SkeletonCard>
                </>,
              ),
            ),
          },
          {
            path: routePaths.adminStudents,
            element: withSuspense(
              <RegisteredStudentsPage />,
              routeSkeleton(
                'Loading Registered Students',
                <SkeletonCard>
                  <SkeletonToolbar fields={3} />
                  <SkeletonTableGrid
                    columns={6}
                    gridTemplateColumns="repeat(6, minmax(100px, 1fr))"
                    rows={5}
                  />
                  <SkeletonPagination />
                </SkeletonCard>,
              ),
            ),
          },
          {
            path: routePaths.adminStudentDetail,
            element: withSuspense(
              <StudentDeepDivePage />,
              routeSkeleton(
                'Loading Student Deep-Dive',
                <div className="skeleton-controls-grid">
                  <SkeletonCard>
                    <SkeletonFormFields count={4} />
                  </SkeletonCard>
                  <SkeletonCard title={false}>
                    <SkeletonListRows count={5} showActions={false} />
                  </SkeletonCard>
                </div>,
              ),
            ),
          },
          {
            path: routePaths.adminInternships,
            element: withSuspense(
              <InternshipManagementPage />,
              routeSkeleton(
                'Loading Internship Management',
                <>
                  <SkeletonCard>
                    <SkeletonToolbar fields={2} />
                    <SkeletonListRows count={3} />
                  </SkeletonCard>
                  <SkeletonCard>
                    <SkeletonToolbar fields={2} />
                    <SkeletonListRows count={3} />
                  </SkeletonCard>
                </>,
              ),
            ),
          },
          {
            path: routePaths.adminCandidateFiltering,
            element: withSuspense(
              <CandidateFilteringPage />,
              routeSkeleton(
                'Loading Candidate Filtering',
                <div className="skeleton-controls-grid">
                  <SkeletonCard>
                    <SkeletonFormFields count={4} />
                  </SkeletonCard>
                  <SkeletonCard>
                    <SkeletonToolbar fields={2} />
                    <SkeletonTableGrid
                      columns={5}
                      gridTemplateColumns="repeat(5, minmax(100px, 1fr))"
                      rows={5}
                    />
                    <SkeletonPagination />
                  </SkeletonCard>
                </div>,
              ),
            ),
          },
          {
            path: routePaths.adminShortlists,
            element: withSuspense(
              <ShortlistsPage />,
              routeSkeleton(
                'Loading Shortlists and Exports',
                <SkeletonCard>
                  <SkeletonToolbar fields={2} />
                  <SkeletonListRows count={5} />
                  <SkeletonPagination />
                </SkeletonCard>,
              ),
            ),
          },
          {
            path: routePaths.adminEligibleStudents,
            element: withSuspense(
              <EligibleStudentsPage />,
              routeSkeleton(
                'Loading Eligible Students',
                <>
                  <SkeletonCard>
                    <SkeletonFormFields count={1} />
                  </SkeletonCard>
                  <SkeletonCard>
                    <SkeletonToolbar fields={1} />
                    <SkeletonTableGrid
                      columns={6}
                      gridTemplateColumns="repeat(6, minmax(100px, 1fr))"
                      rows={5}
                    />
                    <SkeletonPagination />
                  </SkeletonCard>
                </>,
              ),
            ),
          },
        ],
      },
      ...fallbackRoutes,
    ],
  },
]
