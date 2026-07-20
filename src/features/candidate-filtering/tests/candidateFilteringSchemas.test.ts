import { describe, expect, it } from 'vitest'
import {
  candidateFilteringCandidateResponseSchema,
  candidateFilteringCriteriaRequestSchema,
  candidateFilteringRunResponseSchema,
  candidateSortSchema,
} from '../schemas/candidateFilteringSchemas'

const requestId = '11111111-1111-4111-8111-111111111111'
const filterRunId = '22222222-2222-4222-8222-222222222222'
const studentId = '33333333-3333-4333-8333-333333333333'
const skillId = '44444444-4444-4444-8444-444444444444'
const now = '2026-07-20T09:30:00Z'

const criteria = {
  requestId,
  runtimeGpaLowerBound: 2.75,
  runtimeGpaUpperBound: 4,
  requestSkillIds: [skillId],
  additionalSkillIds: [],
  skillMatchMode: 'AND' as const,
}

const candidate = {
  studentId,
  indexNumber: 'SC/2022/12345',
  fullName: 'Ayesha Perera',
  officialGpa: 3.42,
  gpaAvailabilityStatus: 'AVAILABLE' as const,
  matchingDeclaredSkills: [],
  declaredSkillCount: 4,
  hasLatestSavedCv: true,
  hasExistingActiveShortlist: true,
  existingActiveShortlistCount: 1,
}

describe('candidate filtering runtime schemas', () => {
  it('accepts bounded deterministic criteria and all supported sorts', () => {
    expect(candidateFilteringCriteriaRequestSchema.parse(criteria)).toEqual(criteria)
    expect(
      ['officialGpa,desc', 'officialGpa,asc', 'fullName,asc', 'indexNumber,asc'].map((sort) =>
        candidateSortSchema.parse(sort),
      ),
    ).toHaveLength(4)
  })

  it('rejects reversed, overly precise, duplicated, and unsupported criteria', () => {
    expect(() =>
      candidateFilteringCriteriaRequestSchema.parse({
        ...criteria,
        runtimeGpaLowerBound: 3.5,
        runtimeGpaUpperBound: 3.25,
      }),
    ).toThrow('Minimum GPA')
    expect(() =>
      candidateFilteringCriteriaRequestSchema.parse({ ...criteria, runtimeGpaLowerBound: 2.755 }),
    ).toThrow('two decimal places')
    expect(() =>
      candidateFilteringCriteriaRequestSchema.parse({
        ...criteria,
        requestSkillIds: [skillId, skillId],
      }),
    ).toThrow('only once')
    expect(() => candidateFilteringCriteriaRequestSchema.parse({ ...criteria, extra: 1 })).toThrow()
  })

  it('supports nullable candidate GPA with an explicit availability state', () => {
    expect(candidateFilteringCandidateResponseSchema.parse(candidate)).toEqual(candidate)
    expect(
      candidateFilteringCandidateResponseSchema.parse({
        ...candidate,
        officialGpa: null,
        gpaAvailabilityStatus: 'NOT_AVAILABLE',
      }).officialGpa,
    ).toBeNull()
    expect(() =>
      candidateFilteringCandidateResponseSchema.parse({ ...candidate, officialGpa: null }),
    ).toThrow('availability')
  })

  it('validates filtering run context without accepting undeclared output', () => {
    const run = {
      filterRunId,
      request: {
        requestId,
        companyId: '55555555-5555-4555-8555-555555555555',
        companyName: 'Example Technologies',
        title: 'Software Engineering Intern',
        status: 'ACTIVE' as const,
        shortlistGuidanceValue: 10,
      },
      criteria,
      candidateCount: 1,
      createdAt: now,
    }
    expect(candidateFilteringRunResponseSchema.parse(run)).toEqual(run)
    expect(() => candidateFilteringRunResponseSchema.parse({ ...run, extra: 1 })).toThrow()
  })
})
