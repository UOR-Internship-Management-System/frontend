import { NavLink, Outlet } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { Button } from '../../shared/components/ui/Button'
import { useAuth } from '../../shared/hooks/useAuth'

const links = [['Dashboard', routePaths.adminDashboard]] as const

export function AdminLayout() {
  const auth = useAuth()

  return (
    <section className="workspace-layout">
      <aside className="sidebar section-card">
        <h2>Admin</h2>
        <p>{auth.currentUser?.displayName}</p>
        <nav aria-label="Admin routes">
          <ul className="nav-list">
            {links.map(([label, to]) => (
              <li key={to}>
                <NavLink className="nav-link" to={to}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Button className="logout-button" onClick={() => void auth.logout()} variant="secondary">
          Log Out
        </Button>
      </aside>
      <div className="content-stack">
        <Outlet />
      </div>
    </section>
  )
}
