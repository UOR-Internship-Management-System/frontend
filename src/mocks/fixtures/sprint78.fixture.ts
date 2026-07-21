import type {
  ApiCandidateFilteringCandidateResponse,
  ApiCandidateFilteringRunResponse,
  ApiCompanyResponse,
  ApiInternshipRequestResponse,
  ApiShortlistCandidateResponse,
  ApiShortlistResponse,
} from '../../shared/api/generated/cvManagementApi.types'
import { skillIds } from './skills.fixture'

export const sprint78Ids = {
  companies: {
    acme: 'a1000000-0000-4000-8000-000000000001',
    orbit: 'a1000000-0000-4000-8000-000000000002',
    legacy: 'a1000000-0000-4000-8000-000000000003',
    test1: 'a1000000-0000-4000-8000-000000000004',
    test2: 'a1000000-0000-4000-8000-000000000005',
  },

  requests: {
    frontend: 'b1000000-0000-4000-8000-000000000001',
    backend: 'b1000000-0000-4000-8000-000000000002',
    data: 'b1000000-0000-4000-8000-000000000003',
  },

  filterRuns: {
    frontend: 'c1000000-0000-4000-8000-000000000001',
  },

  students: {
    ayesha: 'd1000000-0000-4000-8000-000000000001',
    kasun: 'd1000000-0000-4000-8000-000000000002',
    nethmi: 'd1000000-0000-4000-8000-000000000003',
    ravindu: 'd1000000-0000-4000-8000-000000000004',
    imesha: 'd1000000-0000-4000-8000-000000000005',
  },

  shortlists: {
    frontendDraft:
      'e1000000-0000-4000-8000-000000000001',

    backendFinalized:
      'e1000000-0000-4000-8000-000000000002',
  },

  requiredSkills: {
    frontendReact:
      'f1000000-0000-4000-8000-000000000001',

    frontendTypeScript:
      'f1000000-0000-4000-8000-000000000002',

    backendJava:
      'f1000000-0000-4000-8000-000000000003',

    backendSpring:
      'f1000000-0000-4000-8000-000000000004',

    dataPython:
      'f1000000-0000-4000-8000-000000000005',
  },
} as const

export const sprint78CompaniesFixture: ApiCompanyResponse[] =
  [
    {
      companyId: sprint78Ids.companies.acme,
      name: 'Acme Digital Labs',
      websiteUrl: 'https://acme.example.com',
      contactPerson: 'Nadeesha Fernando',
      contactEmail: 'nadeesha@acme.example.com',
      contactPhone: '+94 11 234 5678',
      notes:
        'Primary frontend and product-engineering internship partner.',
      active: true,
      version: 2,
      createdAt: '2026-07-01T08:30:00+05:30',
      updatedAt: '2026-07-19T14:15:00+05:30',
    },
    {
      companyId: sprint78Ids.companies.orbit,
      name: 'Orbit Systems',
      websiteUrl: 'https://orbit.example.com',
      contactPerson: 'Tharindu Silva',
      contactEmail: 'tharindu@orbit.example.com',
      contactPhone: '+94 77 555 0102',
      notes:
        'Backend, cloud, and data-platform internship partner.',
      active: true,
      version: 1,
      createdAt: '2026-07-03T09:00:00+05:30',
      updatedAt: '2026-07-18T10:45:00+05:30',
    },
    {
      companyId: sprint78Ids.companies.legacy,
      name: 'Legacy Manufacturing IT',
      websiteUrl: null,
      contactPerson: 'Malini Perera',
      contactEmail: 'malini@legacy.example.com',
      contactPhone: null,
      notes:
        'Inactive record retained for historical internship requests.',
      active: false,
      version: 4,
      createdAt: '2026-06-20T11:00:00+05:30',
      updatedAt: '2026-07-15T16:20:00+05:30',
    },
    {
      companyId: sprint78Ids.companies.test1,
      name: 'Alpha Test Corp',
      websiteUrl: 'https://alpha-test.example.com',
      contactPerson: 'Alpha Rep',
      contactEmail: 'hr@alpha-test.example.com',
      contactPhone: '+94 11 111 1111',
      notes: 'Test company for UI verification.',
      active: true,
      version: 1,
      createdAt: '2026-07-21T08:00:00+05:30',
      updatedAt: '2026-07-21T08:00:00+05:30',
    },
    {
      companyId: sprint78Ids.companies.test2,
      name: 'Beta Test LLC',
      websiteUrl: 'https://beta-test.example.com',
      contactPerson: 'Beta Rep',
      contactEmail: 'hr@beta-test.example.com',
      contactPhone: '+94 11 222 2222',
      notes: 'Second test company for pagination and spacing verification.',
      active: true,
      version: 1,
      createdAt: '2026-07-21T08:05:00+05:30',
      updatedAt: '2026-07-21T08:05:00+05:30',
    },
  ]

export const sprint78InternshipRequestsFixture: ApiInternshipRequestResponse[] =
  [
    {
      requestId: sprint78Ids.requests.frontend,
      company: sprint78CompaniesFixture[0],
      title: 'Frontend Engineering Intern',
      description:
        'Build accessible React interfaces for internal product teams.',
      location: 'Colombo',
      workMode: 'HYBRID',
      status: 'ACTIVE',
      shortlistGuidanceValue: 2,
      notes: 'Manual candidate selection only.',
      requiredSkills: [
        {
          requiredSkillId:
            sprint78Ids.requiredSkills.frontendReact,
          skillId: skillIds.react,
          skillName: 'React',
          requiredCompetencyLevel: 'INTERMEDIATE',
        },
        {
          requiredSkillId:
            sprint78Ids.requiredSkills.frontendTypeScript,
          skillId: skillIds.typescript,
          skillName: 'TypeScript',
          requiredCompetencyLevel: 'INTERMEDIATE',
        },
      ],
      version: 3,
      createdAt: '2026-07-10T09:00:00+05:30',
      updatedAt: '2026-07-20T08:40:00+05:30',
    },
    {
      requestId: sprint78Ids.requests.backend,
      company: sprint78CompaniesFixture[1],
      title: 'Backend Engineering Intern',
      description:
        'Contribute to Spring Boot services and API integrations.',
      location: 'Galle',
      workMode: 'REMOTE',
      status: 'ACTIVE',
      shortlistGuidanceValue: 3,
      notes: null,
      requiredSkills: [
        {
          requiredSkillId:
            sprint78Ids.requiredSkills.backendJava,
          skillId: skillIds.java,
          skillName: 'Java',
          requiredCompetencyLevel: 'INTERMEDIATE',
        },
        {
          requiredSkillId:
            sprint78Ids.requiredSkills.backendSpring,
          skillId: skillIds.springBoot,
          skillName: 'Spring Boot',
          requiredCompetencyLevel: 'BEGINNER',
        },
      ],
      version: 1,
      createdAt: '2026-07-12T13:30:00+05:30',
      updatedAt: '2026-07-18T12:10:00+05:30',
    },
    {
      requestId: sprint78Ids.requests.data,
      company: sprint78CompaniesFixture[1],
      title: 'Data Platform Intern',
      description:
        'Support data ingestion, validation, and reporting workflows.',
      location: 'Matara',
      workMode: 'ONSITE',
      status: 'ACTIVE',
      shortlistGuidanceValue: 4,
      notes:
        'This request has no shortlist and can be used to test draft creation.',
      requiredSkills: [
        {
          requiredSkillId:
            sprint78Ids.requiredSkills.dataPython,
          skillId: skillIds.python,
          skillName: 'Python',
          requiredCompetencyLevel: 'BEGINNER',
        },
      ],
      version: 1,
      createdAt: '2026-07-14T10:00:00+05:30',
      updatedAt: '2026-07-20T07:30:00+05:30',
    },
  ]

function declaredSkill(
  declaredSkillId: string,
  skillId: string,
  skillName: string,
  competencyLevel:
    | 'BEGINNER'
    | 'INTERMEDIATE'
    | 'ADVANCED',
) {
  return {
    declaredSkillId,
    skillId,
    skillName,
    competencyLevel,
    version: 1,
    createdAt: '2026-07-01T08:00:00+05:30',
    updatedAt: '2026-07-18T08:00:00+05:30',
  }
}

export const sprint78CandidatesFixture: ApiCandidateFilteringCandidateResponse[] =
  [
    {
      studentId: sprint78Ids.students.ayesha,
      indexNumber: 'SC/2022/12345',
      fullName: 'Ayesha Perera',
      officialGpa: 3.82,
      gpaAvailabilityStatus: 'AVAILABLE',
      matchingDeclaredSkills: [
        declaredSkill(
          'a2000000-0000-4000-8000-000000000001',
          skillIds.react,
          'React',
          'ADVANCED',
        ),
        declaredSkill(
          'a2000000-0000-4000-8000-000000000002',
          skillIds.typescript,
          'TypeScript',
          'INTERMEDIATE',
        ),
      ],
      declaredSkillCount: 4,
      hasLatestSavedCv: true,
      hasExistingActiveShortlist: true,
      existingActiveShortlistCount: 1,
    },
    {
      studentId: sprint78Ids.students.kasun,
      indexNumber: 'SC/2022/12346',
      fullName: 'Kasun Jayasinghe',
      officialGpa: 3.61,
      gpaAvailabilityStatus: 'AVAILABLE',
      matchingDeclaredSkills: [
        declaredSkill(
          'a2000000-0000-4000-8000-000000000003',
          skillIds.react,
          'React',
          'INTERMEDIATE',
        ),
        declaredSkill(
          'a2000000-0000-4000-8000-000000000004',
          skillIds.javascript,
          'JavaScript',
          'ADVANCED',
        ),
      ],
      declaredSkillCount: 3,
      hasLatestSavedCv: true,
      hasExistingActiveShortlist: true,
      existingActiveShortlistCount: 1,
    },
    {
      studentId: sprint78Ids.students.nethmi,
      indexNumber: 'SC/2022/12347',
      fullName: 'Nethmi Wijesinghe',
      officialGpa: 3.45,
      gpaAvailabilityStatus: 'AVAILABLE',
      matchingDeclaredSkills: [
        declaredSkill(
          'a2000000-0000-4000-8000-000000000005',
          skillIds.java,
          'Java',
          'ADVANCED',
        ),
        declaredSkill(
          'a2000000-0000-4000-8000-000000000006',
          skillIds.springBoot,
          'Spring Boot',
          'INTERMEDIATE',
        ),
      ],
      declaredSkillCount: 4,
      hasLatestSavedCv: true,
      hasExistingActiveShortlist: true,
      existingActiveShortlistCount: 1,
    },
    {
      studentId: sprint78Ids.students.ravindu,
      indexNumber: 'SC/2022/12348',
      fullName: 'Ravindu Fernando',
      officialGpa: 3.18,
      gpaAvailabilityStatus: 'AVAILABLE',
      matchingDeclaredSkills: [
        declaredSkill(
          'a2000000-0000-4000-8000-000000000007',
          skillIds.python,
          'Python',
          'INTERMEDIATE',
        ),
      ],
      declaredSkillCount: 2,
      hasLatestSavedCv: false,
      hasExistingActiveShortlist: false,
      existingActiveShortlistCount: 0,
    },
    {
      studentId: sprint78Ids.students.imesha,
      indexNumber: 'SC/2022/12349',
      fullName: 'Imesha Gunawardena',
      officialGpa: null,
      gpaAvailabilityStatus: 'NOT_AVAILABLE',
      matchingDeclaredSkills: [
        declaredSkill(
          'a2000000-0000-4000-8000-000000000008',
          skillIds.python,
          'Python',
          'BEGINNER',
        ),
      ],
      declaredSkillCount: 1,
      hasLatestSavedCv: false,
      hasExistingActiveShortlist: false,
      existingActiveShortlistCount: 0,
    },
  ]

export const sprint78FilterRunsFixture: ApiCandidateFilteringRunResponse[] =
  [
    {
      filterRunId: sprint78Ids.filterRuns.frontend,
      request: {
        requestId: sprint78Ids.requests.frontend,
        companyId: sprint78Ids.companies.acme,
        companyName: 'Acme Digital Labs',
        title: 'Frontend Engineering Intern',
        status: 'ACTIVE',
        shortlistGuidanceValue: 2,
      },
      criteria: {
        requestId: sprint78Ids.requests.frontend,
        runtimeGpaLowerBound: 3.2,
        runtimeGpaUpperBound: 4,
        requestSkillIds: [skillIds.react],
        additionalSkillIds: [],
        skillMatchMode: 'AND',
      },
      candidateCount: 2,
      createdAt: '2026-07-20T09:00:00+05:30',
    },
  ]

export const sprint78ShortlistCandidatesFixture: Record<
  string,
  ApiShortlistCandidateResponse[]
> = {
  [sprint78Ids.shortlists.frontendDraft]: [
    {
      studentId: sprint78Ids.students.ayesha,
      indexNumber: 'SC/2022/12345',
      fullName: 'Ayesha Perera',
      officialGpa: 3.82,
      gpaAvailabilityStatus: 'AVAILABLE',
      hasLatestSavedCv: true,
      hasExistingActiveShortlist: true,
      existingActiveShortlistCount: 1,
      selectedAt: '2026-07-20T09:10:00+05:30',
      selectionNote: null,
    },
    {
      studentId: sprint78Ids.students.kasun,
      indexNumber: 'SC/2022/12346',
      fullName: 'Kasun Jayasinghe',
      officialGpa: 3.61,
      gpaAvailabilityStatus: 'AVAILABLE',
      hasLatestSavedCv: true,
      hasExistingActiveShortlist: true,
      existingActiveShortlistCount: 1,
      selectedAt: '2026-07-20T09:11:00+05:30',
      selectionNote: null,
    },
    {
      studentId: sprint78Ids.students.ravindu,
      indexNumber: 'SC/2022/12348',
      fullName: 'Ravindu Fernando',
      officialGpa: 3.18,
      gpaAvailabilityStatus: 'AVAILABLE',
      hasLatestSavedCv: false,
      hasExistingActiveShortlist: true,
      existingActiveShortlistCount: 1,
      selectedAt: '2026-07-20T09:12:00+05:30',
      selectionNote: 'Selected after manual review.',
    },
  ],

  [sprint78Ids.shortlists.backendFinalized]: [
    {
      studentId: sprint78Ids.students.nethmi,
      indexNumber: 'SC/2022/12347',
      fullName: 'Nethmi Wijesinghe',
      officialGpa: 3.45,
      gpaAvailabilityStatus: 'AVAILABLE',
      hasLatestSavedCv: true,
      hasExistingActiveShortlist: true,
      existingActiveShortlistCount: 1,
      selectedAt: '2026-07-19T11:30:00+05:30',
      selectionNote: null,
    },
  ],
}

export const sprint78ShortlistsFixture: ApiShortlistResponse[] =
  [
    {
      shortlistId:
        sprint78Ids.shortlists.frontendDraft,

      request: {
        requestId: sprint78Ids.requests.frontend,
        companyId: sprint78Ids.companies.acme,
        companyName: 'Acme Digital Labs',
        title: 'Frontend Engineering Intern',
        status: 'ACTIVE',
        shortlistGuidanceValue: 2,
      },

      filterRunId:
        sprint78Ids.filterRuns.frontend,

      name: 'Acme Frontend Candidates',
      status: 'DRAFT',
      guidanceValue: 2,
      selectedCandidateCount: 3,
      guidanceExceeded: true,
      guidanceWarning:
        'The selected candidate count is above the request guidance value.',
      version: 5,
      createdAt: '2026-07-20T09:05:00+05:30',
      updatedAt: '2026-07-20T09:12:00+05:30',
      finalizedAt: null,
    },
    {
      shortlistId:
        sprint78Ids.shortlists.backendFinalized,

      request: {
        requestId: sprint78Ids.requests.backend,
        companyId: sprint78Ids.companies.orbit,
        companyName: 'Orbit Systems',
        title: 'Backend Engineering Intern',
        status: 'ACTIVE',
        shortlistGuidanceValue: 3,
      },

      filterRunId: null,
      name: 'Orbit Backend Final Selection',
      status: 'FINALIZED',
      guidanceValue: 3,
      selectedCandidateCount: 1,
      guidanceExceeded: false,
      guidanceWarning: null,
      version: 2,
      createdAt: '2026-07-19T11:00:00+05:30',
      updatedAt: '2026-07-19T12:00:00+05:30',
      finalizedAt: '2026-07-19T12:00:00+05:30',
    },
  ]
