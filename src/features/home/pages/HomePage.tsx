import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'

export function HomePage() {
  return (
    <article className="gateway-page" aria-labelledby="gateway-title">
      <section className="gateway-hero">
        <div className="gateway-hero-bg" />
        <div className="gateway-hero-content">
          <p className="gateway-eyebrow">CV Management System</p>
          <h1 id="gateway-title">Department Access Gateway</h1>
          <p>
            Choose the approved Sprint 2 authentication path for Student onboarding or predefined
            Department Admin sign-in.
          </p>
        </div>
      </section>

      <section className="gateway-access" aria-labelledby="gateway-access-title">
        <div className="gateway-access-header">
          <h2 id="gateway-access-title">Select your role</h2>
          <p>Access is separated by actor role and enforced again by backend RBAC.</p>
        </div>

        <div className="gateway-split-panel">
          <div className="gateway-card gateway-card-student">
            <span className="material-symbols-outlined" aria-hidden="true">
              school
            </span>
            <div>
              <h3>Student</h3>
              <p>Register or sign in with your university account.</p>
            </div>
            <div className="gateway-actions">
              <Link className="button button-primary" to={routePaths.studentLogin}>
                Login
              </Link>
              <Link className="button button-secondary" to={routePaths.studentSignUp}>
                Register
              </Link>
            </div>
          </div>

          <div className="gateway-card gateway-card-admin">
            <span className="material-symbols-outlined" aria-hidden="true">
              admin_panel_settings
            </span>
            <div>
              <h3>Admin</h3>
              <p>Use predefined administrator credentials to access the workspace.</p>
            </div>
            <div className="gateway-actions">
              <Link className="button button-primary" to={routePaths.adminLogin}>
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
