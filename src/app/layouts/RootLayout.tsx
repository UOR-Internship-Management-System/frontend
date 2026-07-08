import { Link, Outlet } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { ThemeToggle } from '../../shared/components/ui/ThemeToggle'

export function RootLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="shell-bar">
          <Link className="brand-mark" to={routePaths.home}>
            <span className="brand-dot" />
            CV Management
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="shell-bar">
          <p>Sprint 1 frontend foundation.</p>
        </div>
      </footer>
    </div>
  )
}
