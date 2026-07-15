import { Link, useLocation, useOutlet } from 'react-router-dom'
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
])

export function RootLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const isStandalone = standaloneRoutes.has(location.pathname)
  const isStudentWorkspace = studentWorkspaceRoutes.has(location.pathname)

  return (
    <div
      className={`app-shell ${isStandalone ? 'app-shell-standalone' : ''} ${isStudentWorkspace ? 'app-shell-student-workspace' : ''}`.trim()}
    >
      {isStandalone ? <ThemeToggle className="global-theme-toggle" /> : null}

      {!isStandalone && !isStudentWorkspace ? (
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
            : `app-main ${isStudentWorkspace ? 'app-main-student-workspace' : ''}`.trim()
        }
      >
        {isStudentWorkspace ? (
          outlet
        ) : (
          <div className="page-transition" key={location.pathname}>
            {outlet}
          </div>
        )}
      </main>

      {!isStandalone ? (
        <footer className="app-footer">
          <div className="shell-bar">
            <p>CV Management and Candidate Filtering System.</p>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
