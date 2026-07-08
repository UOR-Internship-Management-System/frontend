import { NavLink, Outlet } from 'react-router-dom'
import { routePaths } from '../config/routePaths'

export function AuthLayout() {
  return (
    <section className="auth-layout">
      <aside className="auth-panel" aria-label="Authentication scope">
        <h1>Account Access</h1>
        <p>
          Complete Sprint 2 authentication for Student onboarding, Student login/reset, and
          predefined Admin sign-in/reset.
        </p>
        <nav aria-label="Public routes">
          <ul className="nav-list">
            <li>
              <NavLink className="nav-link" to={routePaths.studentLogin}>
                Student login
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to={routePaths.studentSignUp}>
                Student sign up
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to={routePaths.studentForgotPassword}>
                Student reset
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to={routePaths.adminLogin}>
                Admin login
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to={routePaths.adminForgotPassword}>
                Admin reset
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="auth-panel">
        <Outlet />
      </div>
    </section>
  )
}
