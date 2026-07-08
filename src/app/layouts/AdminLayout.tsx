import { NavLink, Outlet } from 'react-router-dom'
import { routePaths } from '../config/routePaths'

const links = [
  ['Dashboard', routePaths.adminDashboard],
  ['Academic Ledger', routePaths.adminAcademicLedger],
  ['Students', routePaths.adminStudents],
  ['Internships', routePaths.adminInternships],
  ['Candidate Filtering', routePaths.adminCandidateFiltering],
  ['Shortlists', routePaths.adminShortlists],
] as const

export function AdminLayout() {
  return (
    <section className="workspace-layout">
      <aside className="sidebar section-card">
        <h2>Admin</h2>
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
      </aside>
      <div className="content-stack">
        <Outlet />
      </div>
    </section>
  )
}
