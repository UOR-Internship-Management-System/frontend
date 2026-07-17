import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { routePaths } from '../../config/routePaths'
import { RequireStudent } from '../routeGuards'
import { routes } from '../routes'

describe('application route registration', () => {
  const rootChildren = routes[0]?.children ?? []
  const studentBranch = rootChildren.find((route) =>
    route.children?.some((child) => child.path === routePaths.studentDashboard),
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

  it('keeps the unknown-route fallback registered after protected workspaces', () => {
    expect(rootChildren.some((route) => route.path === '*')).toBe(true)
  })
})
