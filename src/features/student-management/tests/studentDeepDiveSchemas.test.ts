import { describe, expect, it } from 'vitest'
import {
  adminLatestCvSchema,
  adminStudentDetailSchema,
  gpaSummarySchema,
  pagedAdminAcademicRecordsSchema,
  pagedAdminDeclaredSkillsSchema,
  pagedAdminStudentProjectsSchema,
} from '../schemas/studentManagementSchemas'

const studentId = '11111111-1111-4111-8111-111111111111'
const recordId = '22222222-2222-4222-8222-222222222222'
const now = '2026-07-20T09:30:00Z'
const page = { page: 0, size: 20, totalElements: 1, totalPages: 1, sort: 'createdAt,desc' }

const notSavedCv = {
  availability: 'NOT_SAVED' as const,
  cvId: null,
  revision: null,
  generatedAt: null,
  savedAt: null,
  freshnessStatus: null,
  fileName: null,
  fileSizeBytes: null,
  downloadUrl: null,
}

const detail = {
  student: {
    studentId,
    indexNumber: 'SC/2022/12345',
    fullName: 'Asha Silva',
    universityEmail: 'asha@dcs.ruh.ac.lk',
    degreeProgram: 'B.Sc. in Computer Science',
    academicBatch: '2022',
    currentLevel: 3 as const,
    officialGpa: null,
  },
  profile: {
    studentId,
    fullName: 'Asha Silva',
    indexNumber: 'SC/2022/12345',
    universityEmail: 'asha@dcs.ruh.ac.lk',
    degreeProgramme: 'B.Sc. in Computer Science',
    studentLevel: 3 as const,
    cohortYear: 2022,
    personalEmail: null,
    headline: 'Software engineering undergraduate',
    summary: null,
    phone: null,
    location: 'Matara',
    profilePhoto: null,
    version: 2,
    updatedAt: now,
    cvSourceUpdatedAt: now,
  },
  cvSupportingData: {
    experiences: [
      {
        id: recordId,
        organization: 'Example Labs',
        positionTitle: 'Engineering Intern',
        location: null,
        startDate: '2026-01-01',
        endDate: null,
        currentRole: true,
        description: null,
        cvInclude: true,
        version: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
    certificates: [],
    awards: [],
    activities: [],
  },
  latestCv: notSavedCv,
}

describe('Student Deep-Dive runtime schemas', () => {
  it('validates the detail and explicit CV availability states', () => {
    expect(adminStudentDetailSchema.parse(detail)).toEqual(detail)
    expect(adminLatestCvSchema.parse(notSavedCv).availability).toBe('NOT_SAVED')

    const available = {
      availability: 'AVAILABLE',
      cvId: recordId,
      revision: 3,
      generatedAt: now,
      savedAt: now,
      freshnessStatus: 'CURRENT',
      fileName: 'SC_2022_12345_CV.pdf',
      fileSizeBytes: 184320,
      downloadUrl: `/admin/students/${studentId}/latest-cv/download`,
    }
    expect(adminLatestCvSchema.parse(available)).toEqual(available)
  })

  it('rejects removed-scope and internally inconsistent CV fields', () => {
    expect(() => adminStudentDetailSchema.parse({ ...detail, reviewStatus: 'APPROVED' })).toThrow()
    expect(() =>
      adminStudentDetailSchema.parse({
        ...detail,
        cvSupportingData: { ...detail.cvSupportingData, skillVerified: true },
      }),
    ).toThrow()
    expect(() =>
      adminLatestCvSchema.parse({ ...notSavedCv, cvId: recordId, revision: 1 }),
    ).toThrow()
  })

  it('models available and unavailable official GPA without placeholder values', () => {
    expect(
      gpaSummarySchema.parse({
        studentId,
        status: 'NOT_AVAILABLE',
        computerScienceGpa: null,
        totalCredits: null,
        calculatedAt: null,
        source: null,
      }).status,
    ).toBe('NOT_AVAILABLE')

    expect(
      gpaSummarySchema.parse({
        studentId,
        status: 'AVAILABLE',
        computerScienceGpa: 3.75,
        totalCredits: 42,
        calculatedAt: now,
        source: { sourceUploadId: recordId, committedAt: now },
      }).computerScienceGpa,
    ).toBe(3.75)
  })

  it('strictly validates the independently paged deep-dive collections', () => {
    const skill = {
      declaredSkillId: recordId,
      skillId: studentId,
      skillName: 'TypeScript',
      competencyLevel: 'ADVANCED',
      version: 1,
      createdAt: now,
      updatedAt: now,
    }
    expect(pagedAdminDeclaredSkillsSchema.parse({ items: [skill], page }).items).toHaveLength(1)

    const project = {
      projectId: recordId,
      title: 'CV Management System',
      description: null,
      repositoryUrl: null,
      demoUrl: null,
      startDate: null,
      endDate: null,
      skills: [],
      includeInCv: true,
      version: 0,
      createdAt: now,
      updatedAt: now,
    }
    expect(pagedAdminStudentProjectsSchema.parse({ items: [project], page }).items).toHaveLength(1)

    const academic = {
      academicRecordId: recordId,
      subjectId: studentId,
      courseCode: 'CSC3202',
      courseTitle: 'Software Engineering',
      credits: 3,
      letterGrade: 'A',
      gradePoint: 4,
      semester: 'Semester 1',
      academicYear: '2025/2026',
      attemptNumber: 1,
      resultStatus: 'PASSED',
      committedAt: now,
    }
    expect(pagedAdminAcademicRecordsSchema.parse({ items: [academic], page }).items).toHaveLength(1)
  })
})
