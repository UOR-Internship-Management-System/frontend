import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { ThemeToggle } from '../../../shared/components/ui/ThemeToggle'

export function HomePage() {
  return (
    <article className="gateway-page">
      <header className="gateway-header">
        <div>
          <span className="small-label">CV Management System</span>
          <h1>Department access gateway</h1>
          <p>
            Enter the approved authentication flow for Students or predefined Department Admins.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <section className="gateway-grid" aria-label="Authentication entry points">
        <div className="gateway-card gateway-card-student">
          <span className="material-symbols-outlined" aria-hidden="true">
            school
          </span>
          <h2>Student</h2>
          <p>Register through auto verification, or sign in with your university account.</p>
          <div className="gateway-actions">
            <Link className="button button-primary" to={routePaths.studentLogin}>
              Student Login
            </Link>
            <Link className="button button-secondary" to={routePaths.studentSignUp}>
              Student Registration
            </Link>
          </div>
        </div>
        <div className="gateway-card gateway-card-admin">
          <span className="material-symbols-outlined" aria-hidden="true">
            admin_panel_settings
          </span>
          <h2>Department Admin</h2>
          <p>Use predefined administrator credentials to access the Sprint 2 Admin shell.</p>
          <div className="gateway-actions">
            <Link className="button button-primary" to={routePaths.adminLogin}>
              Admin Login
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}
