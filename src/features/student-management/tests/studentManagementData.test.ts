import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import { mapRegisteredStudent } from '../mappers/studentManagementMappers'
import { registeredStudentSchema } from '../schemas/studentManagementSchemas'
import { studentManagementKeys } from '../hooks/studentManagementQueryKeys'
import {
  parseRegisteredStudentsQuery,
  serializeRegisteredStudentsQuery,
} from '../hooks/useRegisteredStudentsUrlState'

const student = {
  studentId: '11111111-1111-4111-8111-111111111111',
  indexNumber: 'SC/2022/12345',
  fullName: 'Asha Silva',
  universityEmail: 'asha@dcs.ruh.ac.lk',
  degreeProgram: 'B.Sc. in Computer Science',
  academicBatch: '2022',
  currentLevel: 3 as const,
  officialGpa: null,
}

describe('Student management data layer', () => {
  it('strictly validates registered Students and preserves nullable GPA', () => {
    expect(registeredStudentSchema.parse(student)).toEqual(student)
    expect(mapRegisteredStudent(student).officialGpaLabel).toBe('Not available')
    expect(() => registeredStudentSchema.parse({ ...student, currentLevel: 2 })).toThrow(ZodError)
  })

  it('recovers URL defaults and serializes only approved state', () => {
    const parsed = parseRegisteredStudentsQuery(
      new URLSearchParams('search=Silva&level=4&sort=officialGpa%2Cdesc&page=2&size=50'),
    )
    expect(parsed).toEqual({
      search: 'Silva',
      level: 4,
      sort: 'officialGpa,desc',
      page: 2,
      size: 50,
    })
    expect(serializeRegisteredStudentsQuery(parsed).toString()).toContain('level=4')
    expect(
      parseRegisteredStudentsQuery(new URLSearchParams('level=9&sort=bad&page=-1&size=7')),
    ).toEqual({ page: 0, size: 20, sort: 'fullName,asc', search: '', level: undefined })
  })

  it('uses stable protected query keys including every server parameter', () => {
    const query = parseRegisteredStudentsQuery(new URLSearchParams())
    expect(studentManagementKeys.studentList(query)).toEqual([
      'protected',
      'student-management',
      'students',
      'list',
      query,
    ])
  })
})
