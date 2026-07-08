import { NavLink, Outlet } from 'react-router-dom'
import { routePaths } from '../config/routePaths'

const links = [
  ['Dashboard', routePaths.studentDashboard],
  ['Profile', routePaths.studentProfile],
  ['Skills', routePaths.studentSkills],
  ['Projects', routePaths.studentProjects],
  ['CV Builder', routePaths.studentCvBuilder],
  ['Academic Records', routePaths.studentAcademicRecords],
] as const

export function StudentLayout() {
  return (
    <section className="workspace-layout">
      <aside className="sidebar section-card">
        <h2>Student</h2>
        <nav aria-label="Student routes">
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
