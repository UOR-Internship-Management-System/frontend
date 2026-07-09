import { Link, Outlet, useLocation } from 'react-router-dom'
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

export function RootLayout() {
  const location = useLocation()
  const isStandalone = standaloneRoutes.has(location.pathname)

  return (
    <div className={`app-shell ${isStandalone ? 'app-shell-standalone' : ''}`.trim()}>
      {!isStandalone ? (
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
      <main className={isStandalone ? 'app-main app-main-standalone' : 'app-main'}>
        <Outlet />
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
