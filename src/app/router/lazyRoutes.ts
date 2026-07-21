import { lazy } from 'react'

export const HomePage = lazy(() =>
  import('../../features/home/pages/HomePage').then((module) => ({ default: module.HomePage })),
)
export const StudentSignUpPage = lazy(() =>
  import('../../features/student-auth/pages/StudentSignUpPage').then((module) => ({
    default: module.StudentSignUpPage,
  })),
)
export const VerifyOtpPage = lazy(() =>
  import('../../features/student-auth/pages/VerifyOtpPage').then((module) => ({
    default: module.VerifyOtpPage,
  })),
)
export const CreatePasswordPage = lazy(() =>
  import('../../features/student-auth/pages/CreatePasswordPage').then((module) => ({
    default: module.CreatePasswordPage,
  })),
)
export const StudentLoginPage = lazy(() =>
  import('../../features/student-auth/pages/StudentLoginPage').then((module) => ({
    default: module.StudentLoginPage,
  })),
)
export const ForgotPasswordPage = lazy(() =>
  import('../../features/student-auth/pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
)
export const StudentResetOtpPage = lazy(() =>
  import('../../features/student-auth/pages/StudentResetOtpPage').then((module) => ({
    default: module.StudentResetOtpPage,
  })),
)
export const StudentResetPasswordPage = lazy(() =>
  import('../../features/student-auth/pages/StudentResetPasswordPage').then((module) => ({
    default: module.StudentResetPasswordPage,
  })),
)
export const AdminLoginPage = lazy(() =>
  import('../../features/admin-auth/pages/AdminLoginPage').then((module) => ({
    default: module.AdminLoginPage,
  })),
)
export const AdminForgotPasswordPage = lazy(() =>
  import('../../features/admin-auth/pages/AdminForgotPasswordPage').then((module) => ({
    default: module.AdminForgotPasswordPage,
  })),
)
export const AdminVerifyResetOtpPage = lazy(() =>
  import('../../features/admin-auth/pages/AdminVerifyResetOtpPage').then((module) => ({
    default: module.AdminVerifyResetOtpPage,
  })),
)
export const AdminCreatePasswordPage = lazy(() =>
  import('../../features/admin-auth/pages/AdminCreatePasswordPage').then((module) => ({
    default: module.AdminCreatePasswordPage,
  })),
)
export const StudentDashboardPage = lazy(() =>
  import('../../features/student-dashboard/pages/StudentDashboardPage').then((module) => ({
    default: module.StudentDashboardPage,
  })),
)
export const StudentProfilePage = lazy(() =>
  import('../../features/student-profile/pages/StudentProfilePage').then((module) => ({
    default: module.StudentProfilePage,
  })),
)
export const StudentSkillsPage = lazy(() =>
  import('../../features/student-skills/pages/StudentSkillsPage').then((module) => ({
    default: module.StudentSkillsPage,
  })),
)
export const StudentProjectsPage = lazy(() =>
  import('../../features/student-projects/pages/StudentProjectsPage').then((module) => ({
    default: module.StudentProjectsPage,
  })),
)
export const CvBuilderPage = lazy(() =>
  import('../../features/cv-builder/pages/CvBuilderPage').then((module) => ({
    default: module.CvBuilderPage,
  })),
)
export const AcademicRecordsPage = lazy(() =>
  import('../../features/academic-records/pages/AcademicRecordsPage').then((module) => ({
    default: module.AcademicRecordsPage,
  })),
)
export const AdminDashboardPage = lazy(() =>
  import('../../features/admin-dashboard/pages/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
export const AcademicLedgerPage = lazy(() =>
  import('../../features/academic-ledger/pages/AcademicLedgerPage').then((module) => ({
    default: module.AcademicLedgerPage,
  })),
)
export const RegisteredStudentsPage = lazy(() =>
  import('../../features/student-management/pages/RegisteredStudentsPage').then((module) => ({
    default: module.RegisteredStudentsPage,
  })),
)
export const StudentDeepDivePage = lazy(() =>
  import('../../features/student-management/pages/StudentDeepDivePage').then((module) => ({
    default: module.StudentDeepDivePage,
  })),
)
export const InternshipManagementPage = lazy(() =>
  import('../../features/internship-management/pages/InternshipManagementPage').then((module) => ({
    default: module.InternshipManagementPage,
  })),
)

export const CandidateFilteringPage = lazy(() =>
  import('../../features/candidate-filtering/pages/CandidateFilteringPage').then((module) => ({
    default: module.CandidateFilteringPage,
  })),
)

export const ShortlistsPage = lazy(() =>
  import('../../features/shortlists/pages/ShortlistsPage').then((module) => ({
    default: module.ShortlistsPage,
  })),
)
