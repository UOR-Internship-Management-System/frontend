import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'

export function HomePage() {
  return (
    <article className="gateway-page" aria-labelledby="gateway-title">
      <section className="gateway-hero gateway-scroll-section" aria-label="Gateway introduction">
        <header className="gateway-hero-top">
          <span className="small-label">CV Management System</span>
        </header>

        <div className="gateway-hero-content">
          <p className="gateway-eyebrow">Department of Computer Science</p>
          <h1 id="gateway-title">One gateway for student and admin access.</h1>
          <p>
            Continue through the approved authentication path for Students or predefined
            Department Admins.
          </p>

          <a className="button button-primary gateway-scroll-link" href="#gateway-access">
            Choose Access Path
          </a>
        </div>

        <div className="gateway-scroll-cue" aria-hidden="true">
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
        </div>
      </section>

      <section
        id="gateway-access"
        className="gateway-access gateway-scroll-section"
        aria-label="Authentication entry points"
      >
        <div className="gateway-access-header">
          <div>
            <span className="small-label">Access Gateway</span>
            <h2>Select your role</h2>
          </div>
          <p>Use the correct side of the system to continue.</p>
        </div>

        <div className="gateway-split-panel">
          <div className="gateway-card gateway-card-student">
            <span className="material-symbols-outlined" aria-hidden="true">
              school
            </span>
            <div>
              <h3>Student Access</h3>
              <p>Register through auto verification, or sign in with your university account.</p>
            </div>
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
            <div>
              <h3>Department Admin</h3>
              <p>Use predefined administrator credentials to access the administrative workspace.</p>
            </div>
            <div className="gateway-actions">
              <Link className="button button-primary" to={routePaths.adminLogin}>
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
