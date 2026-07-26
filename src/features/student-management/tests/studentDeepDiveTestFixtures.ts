import {
  adminLatestCvSchema,
  adminStudentDetailSchema,
  pagedAdminAcademicRecordsSchema,
  pagedAdminDeclaredSkillsSchema,
  pagedAdminStudentProjectsSchema,
} from '../schemas/studentManagementSchemas'

export const deepDiveStudentId = '11111111-1111-4111-8111-111111111111'
const recordId = '22222222-2222-4222-8222-222222222222'
const secondaryId = '33333333-3333-4333-8333-333333333333'
const now = '2026-07-20T09:30:00Z'
const page = { page: 0, size: 20, totalElements: 1, totalPages: 1, sort: 'createdAt,desc' }

export const deepDiveDetailFixture = adminStudentDetailSchema.parse({
  student: {
    studentId: deepDiveStudentId,
    indexNumber: 'SC/2022/12345',
    fullName: 'Asha Silva',
    universityEmail: 'asha@dcs.ruh.ac.lk',
    degreeProgram: 'B.Sc. in Computer Science',
    academicBatch: '2022',
    currentLevel: 3,
    officialGpa: null,
  },
  profile: {
    studentId: deepDiveStudentId,
    fullName: 'Asha Silva',
    indexNumber: 'SC/2022/12345',
    universityEmail: 'asha@dcs.ruh.ac.lk',
    degreeProgramme: 'B.Sc. in Computer Science',
    studentLevel: 3,
    cohortYear: 2022,
    personalEmail: 'asha.silva@example.com',
    headline: 'Software engineering undergraduate',
    summary: 'Interested in dependable full-stack systems.',
    phone: '+94 77 123 4567',
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
        location: 'Colombo',
        startDate: '2026-01-01',
        endDate: null,
        currentRole: true,
        description: 'Built accessible administrative interfaces.',
        cvInclude: true,
        version: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
    certificates: [
      {
        id: secondaryId,
        title: 'Web Accessibility Foundations',
        issuer: 'Open Learning',
        issueDate: '2025-10-10',
        credentialUrl: 'https://example.com/credentials/asha',
        cvInclude: true,
        evidence: null,
        version: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
    awards: [
      {
        id: recordId,
        title: 'Faculty Project Award',
        issuer: 'University of Ruhuna',
        awardDate: '2025-11-15',
        description: 'Recognized for a dependable offline-first design.',
        cvInclude: true,
        version: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
    activities: [
      {
        id: secondaryId,
        activityName: 'Computer Science Society',
        roleTitle: 'Committee Member',
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        description: 'Supported technical learning sessions.',
        cvInclude: true,
        version: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
  },
  latestCv: {
    availability: 'NOT_SAVED',
    cvId: null,
    revision: null,
    generatedAt: null,
    savedAt: null,
    freshnessStatus: null,
    fileName: null,
    fileSizeBytes: null,
    downloadUrl: null,
  },
})

export const deepDiveLatestCvFixture = adminLatestCvSchema.parse(deepDiveDetailFixture.latestCv)

export const deepDiveAvailableCvFixture = adminLatestCvSchema.parse({
  availability: 'AVAILABLE',
  cvId: '44444444-4444-4444-8444-444444444444',
  revision: 3,
  generatedAt: now,
  savedAt: now,
  freshnessStatus: 'CURRENT',
  fileName: 'Asha_Silva_CV.pdf',
  fileSizeBytes: 184320,
  downloadUrl: `/admin/students/${deepDiveStudentId}/latest-cv/download`,
})

export const deepDiveSkillsFixture = pagedAdminDeclaredSkillsSchema.parse({
  items: [
    {
      declaredSkillId: recordId,
      skillId: secondaryId,
      skillName: 'TypeScript',
      competencyLevel: 'ADVANCED',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  ],
  page,
})

export const deepDiveProjectsFixture = pagedAdminStudentProjectsSchema.parse({
  items: [
    {
      projectId: recordId,
      title: 'CV Management System',
      description: 'A deterministic internship candidate filtering system.',
      repositoryUrl: 'https://github.com/example/cv-management',
      demoUrl: null,
      startDate: '2026-01-01',
      endDate: null,
      skills: [{ skillId: secondaryId, name: 'TypeScript', description: null }],
      includeInCv: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  ],
  page,
})

export const deepDiveAcademicsFixture = pagedAdminAcademicRecordsSchema.parse({
  items: [
    {
      academicRecordId: recordId,
      subjectId: secondaryId,
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
    },
  ],
  page: { ...page, sort: 'academicYear,desc' },
})
