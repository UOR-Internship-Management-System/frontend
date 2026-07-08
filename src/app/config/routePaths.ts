export const routePaths = {
  home: '/',
  studentSignUp: '/student/sign-up',
  studentVerifyOtp: '/student/verify-otp',
  studentCreatePassword: '/student/create-password',
  studentLogin: '/student/login',
  studentForgotPassword: '/student/forgot-password',
  adminLogin: '/admin/login',
  studentDashboard: '/student/dashboard',
  studentProfile: '/student/profile',
  studentSkills: '/student/skills',
  studentProjects: '/student/projects',
  studentCvBuilder: '/student/cv-builder',
  studentAcademicRecords: '/student/academic-records',
  adminDashboard: '/admin/dashboard',
  adminAcademicLedger: '/admin/academic-ledger',
  adminStudents: '/admin/students',
  adminStudentDetail: '/admin/students/:studentId',
  adminInternships: '/admin/internships',
  adminCandidateFiltering: '/admin/candidate-filtering',
  adminShortlists: '/admin/shortlists',
  unauthorized: '/unauthorized',
} as const

export type RoutePath = (typeof routePaths)[keyof typeof routePaths]

export const buildAdminStudentDetailPath = (studentId: string) =>
  routePaths.adminStudentDetail.replace(':studentId', encodeURIComponent(studentId))
