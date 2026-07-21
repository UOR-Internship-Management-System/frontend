import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { routePaths } from '../../config/routePaths'
import { RequireAdmin, RequireStudent } from '../routeGuards'
import { routes } from '../routes'

describe('application route registration', () => {
  const rootChildren = routes[0]?.children ?? []
  const publicBranch = rootChildren.find((route) =>
    route.children?.some((child) => child.path === routePaths.studentLogin),
  )
  const studentBranch = rootChildren.find((route) =>
    route.children?.some((child) => child.path === routePaths.studentDashboard),
  )
  const adminBranch = rootChildren.find((route) =>
    route.children?.some((child) => child.path === routePaths.adminDashboard),
  )

  it('registers all six Student destinations under RequireStudent', () => {
    expect(isValidElement(studentBranch?.element)).toBe(true)
    if (!isValidElement(studentBranch?.element)) throw new TypeError('Missing Student guard')
    expect(studentBranch.element.type).toBe(RequireStudent)
    expect(studentBranch?.children?.map((route) => route.path)).toEqual([
      routePaths.studentDashboard,
      routePaths.studentProfile,
      routePaths.studentSkills,
      routePaths.studentProjects,
      routePaths.studentCvBuilder,
      routePaths.studentAcademicRecords,
    ])
  })

  it('registers every approved public authentication destination', () => {
    expect(publicBranch?.children?.map((route) => route.path)).toEqual([
      routePaths.studentSignUp,
      routePaths.studentVerifyOtp,
      routePaths.studentCreatePassword,
      routePaths.studentLogin,
      routePaths.studentForgotPassword,
      routePaths.studentResetVerifyOtp,
      routePaths.studentResetCreatePassword,
      routePaths.adminLogin,
      routePaths.adminForgotPassword,
      routePaths.adminVerifyResetOtp,
      routePaths.adminCreatePassword,
    ])
  })

  it('keeps the unknown-route fallback registered after protected workspaces', () => {
    expect(rootChildren.some((route) => route.path === '*')).toBe(true)
  })

  it('registers approved Admin destinations under RequireAdmin', () => {
    expect(isValidElement(adminBranch?.element)).toBe(true)
    if (!isValidElement(adminBranch?.element)) throw new TypeError('Missing Admin guard')
    expect(adminBranch.element.type).toBe(RequireAdmin)
    expect(adminBranch?.children?.map((route) => route.path)).toEqual([
      routePaths.adminDashboard,
      routePaths.adminAcademicLedger,
      routePaths.adminStudents,
      routePaths.adminStudentDetail,
      routePaths.adminInternships,
      routePaths.adminCandidateFiltering,
      routePaths.adminShortlists,
    ])
  })
})
