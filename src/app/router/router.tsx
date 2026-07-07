import { type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { userRoles, type UserRole } from '../../shared/security/permissions'
import { useAuth } from '../../shared/hooks/useAuth'
import { ThemeToggle } from '../../shared/components/ui/ThemeToggle'

function ShellPage({ title, description }: { readonly title: string; readonly description: string }) {
  return (
    <section className="page-stack" aria-labelledby="page-title">
      <header>
        <p className="eyebrow">Sprint 1 foundation shell</p>
        <h1 id="page-title">{title}</h1>
        <p>{description}</p>
      </header>
      <div className="sprint-shell-note">Feature workflow logic is deferred to later sprints.</div>
    </section>
  )
}

function PublicLayout({ children }: { readonly children: ReactNode }) {
  return <div className="auth-shell"><div className="auth-card"><aside className="auth-hero" aria-label="System introduction"><h1>CV Management and Internship Filtering System</h1><p>Approved Sprint 1 frontend foundation.</p></aside><main className="auth-content">{children}</main></div></div>
}

function PortalLayout({ children, role }: { readonly children: ReactNode; readonly role: 'Student' | 'Admin' }) {
  const links = role === 'Student'
    ? [[routePaths.student.dashboard, 'Dashboard'], [routePaths.student.profile, 'Profile'], [routePaths.student.skills, 'Skills'], [routePaths.student.projects, 'Projects'], [routePaths.student.cvBuilder, 'CV Builder'], [routePaths.student.academicRecords, 'Academic Records']] as const
    : [[routePaths.admin.dashboard, 'Dashboard'], [routePaths.admin.academicLedger, 'Academic Ledger'], [routePaths.admin.students, 'Students'], [routePaths.admin.internships, 'Internships'], [routePaths.admin.filtering, 'Candidate Filtering'], [routePaths.admin.shortlists, 'Shortlists']] as const

  return <div className="app-shell"><header className="portal-header"><strong>{role} Portal</strong><nav className="portal-nav" aria-label={`${role} navigation`}>{links.map(([path, label]) => <Link key={path} to={path}>{label}</Link>)}</nav><ThemeToggle /></header><main className="app-main">{children}</main></div>
}

function RequireRole({ children, role, loginPath }: { readonly children: ReactNode; readonly role: UserRole; readonly loginPath: string }) {
  const auth = useAuth()
  if (auth.role === null) return <Navigate to={loginPath} replace />
  if (auth.role !== role) return <Navigate to={routePaths.unauthorized} replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routePaths.home} element={<PublicLayout><ShellPage title="Frontend Foundation" description="Sprint 1 root route." /></PublicLayout>} />
        <Route path={routePaths.student.signUp} element={<PublicLayout><ShellPage title="Student Sign Up" description="Public route shell only." /></PublicLayout>} />
        <Route path={routePaths.student.verifyOtp} element={<PublicLayout><ShellPage title="Student OTP Verification" description="Public route shell only." /></PublicLayout>} />
        <Route path={routePaths.student.createPassword} element={<PublicLayout><ShellPage title="Create Password" description="Public route shell only." /></PublicLayout>} />
        <Route path={routePaths.student.login} element={<PublicLayout><ShellPage title="Student Login" description="Public route shell only." /></PublicLayout>} />
        <Route path={routePaths.student.forgotPassword} element={<PublicLayout><ShellPage title="Forgot Password" description="Public route shell only." /></PublicLayout>} />
        <Route path={routePaths.admin.login} element={<PublicLayout><ShellPage title="Admin Login" description="Public route shell only." /></PublicLayout>} />
        <Route path={routePaths.student.dashboard} element={<RequireRole role={userRoles.student} loginPath={routePaths.student.login}><PortalLayout role="Student"><ShellPage title="Student Dashboard" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.student.profile} element={<RequireRole role={userRoles.student} loginPath={routePaths.student.login}><PortalLayout role="Student"><ShellPage title="Student Profile" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.student.skills} element={<RequireRole role={userRoles.student} loginPath={routePaths.student.login}><PortalLayout role="Student"><ShellPage title="Declared Skills" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.student.projects} element={<RequireRole role={userRoles.student} loginPath={routePaths.student.login}><PortalLayout role="Student"><ShellPage title="Projects" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.student.cvBuilder} element={<RequireRole role={userRoles.student} loginPath={routePaths.student.login}><PortalLayout role="Student"><ShellPage title="CV Builder" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.student.academicRecords} element={<RequireRole role={userRoles.student} loginPath={routePaths.student.login}><PortalLayout role="Student"><ShellPage title="Academic Records" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.admin.dashboard} element={<RequireRole role={userRoles.admin} loginPath={routePaths.admin.login}><PortalLayout role="Admin"><ShellPage title="Admin Dashboard" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.admin.academicLedger} element={<RequireRole role={userRoles.admin} loginPath={routePaths.admin.login}><PortalLayout role="Admin"><ShellPage title="Academic Ledger" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.admin.students} element={<RequireRole role={userRoles.admin} loginPath={routePaths.admin.login}><PortalLayout role="Admin"><ShellPage title="Registered Students" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.admin.studentDeepDive} element={<RequireRole role={userRoles.admin} loginPath={routePaths.admin.login}><PortalLayout role="Admin"><ShellPage title="Student Deep Dive" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.admin.internships} element={<RequireRole role={userRoles.admin} loginPath={routePaths.admin.login}><PortalLayout role="Admin"><ShellPage title="Internships" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.admin.filtering} element={<RequireRole role={userRoles.admin} loginPath={routePaths.admin.login}><PortalLayout role="Admin"><ShellPage title="Candidate Filtering" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.admin.shortlists} element={<RequireRole role={userRoles.admin} loginPath={routePaths.admin.login}><PortalLayout role="Admin"><ShellPage title="Shortlists" description="Protected route shell." /></PortalLayout></RequireRole>} />
        <Route path={routePaths.unauthorized} element={<PublicLayout><ShellPage title="Unauthorized" description="This route is not available for the current role." /></PublicLayout>} />
        <Route path="*" element={<PublicLayout><ShellPage title="Page Not Found" description="The requested route is not defined." /></PublicLayout>} />
      </Routes>
    </BrowserRouter>
  )
}
