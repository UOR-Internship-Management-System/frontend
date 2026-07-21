import { Link, matchPath, useLocation, useOutlet } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { ThemeToggle } from '../../shared/components/ui/ThemeToggle'

const standaloneRoutes = new Set<string>([
  routePaths.home,
  routePaths.studentSignUp,
  routePaths.studentVerifyOtp,
  routePaths.studentCreatePassword,
  routePaths.studentLogin,
  routePaths.studentForgotPassword,
  routePaths.studentResetVerifyOtp,
  routePaths.studentResetCreatePassword,
  routePaths.adminLogin,
  routePaths.adminForgotPassword,
  routePaths.adminVerifyResetOtp,
  routePaths.adminCreatePassword,
])

const studentWorkspaceRoutes = new Set<string>([
  routePaths.studentDashboard,
  routePaths.studentProfile,
  routePaths.studentSkills,
  routePaths.studentProjects,
  routePaths.studentCvBuilder,
  routePaths.studentAcademicRecords,
])

const adminWorkspaceRoutes = [
  routePaths.adminDashboard,
  routePaths.adminAcademicLedger,
  routePaths.adminStudents,
  routePaths.adminStudentDetail,
  routePaths.adminInternships,
  routePaths.adminCandidateFiltering,
  routePaths.adminShortlists,
] as const

function isAdminWorkspacePath(pathname: string) {
  return adminWorkspaceRoutes.some((route) =>
    matchPath(
      {
        path: route,
        end: true,
      },
      pathname,
    ),
  )
}

export function RootLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  const isStandalone = standaloneRoutes.has(location.pathname)
  const isStudentWorkspace = studentWorkspaceRoutes.has(location.pathname)
  const isAdminWorkspace = isAdminWorkspacePath(location.pathname)
  const isWorkspace = isStudentWorkspace || isAdminWorkspace

  return (
    <div
      className={`app-shell ${
        isStandalone ? 'app-shell-standalone' : ''
      } ${isWorkspace ? 'app-shell-workspace' : ''} ${
        isStudentWorkspace ? 'app-shell-student-workspace' : ''
      } ${
        isAdminWorkspace ? 'app-shell-admin-workspace' : ''
      }`.trim()}
    >
      {isStandalone ? (
        <ThemeToggle className="global-theme-toggle" />
      ) : null}

      {!isStandalone && !isWorkspace ? (
        <header className="app-header">
          <div className="shell-bar">
            <Link className="brand-mark" to={routePaths.home}>
              <span className="brand-dot" />
              CV Management
            </Link>

            <ThemeToggle />
          </div>
        </header>
      ) : null}

      <main
        className={
          isStandalone
            ? 'app-main app-main-standalone'
            : `app-main ${
                isWorkspace ? 'app-main-workspace' : ''
              } ${
                isStudentWorkspace
                  ? 'app-main-student-workspace'
                  : ''
              } ${
                isAdminWorkspace
                  ? 'app-main-admin-workspace'
                  : ''
              }`.trim()
        }
      >
        {isWorkspace ? (
          outlet
        ) : (
          <div
            className="page-transition"
            key={location.pathname}
          >
            {outlet}
          </div>
        )}
      </main>
    </div>
  )
}
