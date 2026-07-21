import { http, HttpResponse } from 'msw'
import type {
  ApiCandidateFilteringCandidateResponse,
  ApiCandidateFilteringCriteriaRequest,
  ApiCandidateFilteringRunResponse,
  ApiCompanyRequest,
  ApiCompanyResponse,
  ApiCompanyUpdateRequest,
  ApiExportJobResponse,
  ApiInternshipRequestCreateRequest,
  ApiInternshipRequestResponse,
  ApiInternshipRequestUpdateRequest,
  ApiInternshipRequiredSkillRequest,
  ApiInternshipRequiredSkillResponse,
  ApiShortlistCandidateRequest,
  ApiShortlistCandidateResponse,
  ApiShortlistCreateRequest,
  ApiShortlistFinalizeRequest,
  ApiShortlistResponse,
} from '../../shared/api/generated/cvManagementApi.types'
import { individualSkillsFixture } from '../fixtures/skills.fixture'
import {
  sprint78CandidatesFixture,
  sprint78CompaniesFixture,
  sprint78FilterRunsFixture,
  sprint78InternshipRequestsFixture,
  sprint78ShortlistCandidatesFixture,
  sprint78ShortlistsFixture,
} from '../fixtures/sprint78.fixture'
import {
  deepDiveStudentId,
  studentDeepDiveAcademicsFixture,
  studentDeepDiveFixture,
  studentDeepDiveProjectsFixture,
  studentDeepDiveSkillsFixture,
} from '../fixtures/studentDeepDive.fixture'

const apiBase = '/api/v1'
const mockTimestamp = '2026-07-21T10:00:00+05:30'

let companies: ApiCompanyResponse[] = []
let internshipRequests: ApiInternshipRequestResponse[] = []
let filterRuns: ApiCandidateFilteringRunResponse[] = []
let shortlists: ApiShortlistResponse[] = []
let shortlistCandidates: Record<string, ApiShortlistCandidateResponse[]> = {}
const exportJobs = new Map<string, ApiExportJobResponse>()
let companySequence = 1
let requestSequence = 1
let requiredSkillSequence = 1
let filterRunSequence = 1
let shortlistSequence = 1
let exportSequence = 1

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function resetSprint78Mocks() {
  companies = clone(sprint78CompaniesFixture)
  internshipRequests = clone(sprint78InternshipRequestsFixture)
  filterRuns = clone(sprint78FilterRunsFixture)
  shortlists = clone(sprint78ShortlistsFixture)
  shortlistCandidates = Object.fromEntries(
    Object.entries(sprint78ShortlistCandidatesFixture).map(([shortlistId, candidates]) => [
      shortlistId,
      clone(candidates),
    ]),
  )
  exportJobs.clear()
  companySequence = 1
  requestSequence = 1
  requiredSkillSequence = 1
  filterRunSequence = 1
  shortlistSequence = 1
  exportSequence = 1
}

resetSprint78Mocks()

const sprint78StudentIds = [
  deepDiveStudentId,
  ...sprint78CandidatesFixture.map((candidate) => candidate.studentId),
]

function mockId(prefix: string, sequence: number) {
  return `${prefix}000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`
}

function page<T>(items: T[], request: Request, defaultSort: string) {
  const url = new URL(request.url)
  const pageNumber = Number(
    url.searchParams.get('page') ?? url.searchParams.get('candidatePage') ?? 0,
  )
  const size = Number(url.searchParams.get('size') ?? url.searchParams.get('candidateSize') ?? 20)
  const sort = url.searchParams.get('sort') ?? defaultSort
  return {
    items: items.slice(pageNumber * size, pageNumber * size + size),
    page: {
      page: pageNumber,
      size,
      totalElements: items.length,
      totalPages: items.length ? Math.ceil(items.length / size) : 0,
      sort,
    },
  }
}

function problem(status: number, code: string, message: string) {
  return HttpResponse.json(
    {
      type: 'about:blank',
      title: status === 404 ? 'Not found' : 'Request could not be completed',
      status,
      code,
      message,
      correlationId: `mock-${code.toLowerCase()}`,
    },
    { status },
  )
}

function versionProblem(request: Request, version: number) {
  const ifMatch = request.headers.get('If-Match')
  if (!ifMatch) {
    return problem(428, 'PRECONDITION_REQUIRED', 'Refresh the record and try again.')
  }
  if (ifMatch !== `"${version}"`) {
    return problem(412, 'STALE_VERSION', 'This record changed. Refresh it before trying again.')
  }
  return null
}

function requestSummary(request: ApiInternshipRequestResponse) {
  return {
    requestId: request.requestId,
    companyId: request.company.companyId,
    companyName: request.company.name,
    title: request.title,
    status: request.status,
    shortlistGuidanceValue: request.shortlistGuidanceValue,
  }
}

function requiredSkill(
  input: ApiInternshipRequiredSkillRequest,
): ApiInternshipRequiredSkillResponse {
  const skill = individualSkillsFixture.find((item) => item.skillId === input.skillId)
  return {
    requiredSkillId: mockId('f9', requiredSkillSequence++),
    skillId: input.skillId,
    skillName: skill?.name ?? 'Declared skill',
    requiredCompetencyLevel: input.requiredCompetencyLevel ?? null,
  }
}

function filteredCandidates(run: ApiCandidateFilteringRunResponse) {
  const selectedSkillIds = [...run.criteria.requestSkillIds, ...run.criteria.additionalSkillIds]
  return sprint78CandidatesFixture.filter((candidate) => {
    const gpa = candidate.officialGpa
    if (
      run.criteria.runtimeGpaLowerBound !== null &&
      (gpa === null || gpa < run.criteria.runtimeGpaLowerBound)
    ) {
      return false
    }
    if (
      run.criteria.runtimeGpaUpperBound !== null &&
      (gpa === null || gpa > run.criteria.runtimeGpaUpperBound)
    ) {
      return false
    }
    if (!selectedSkillIds.length) return true
    const declaredIds = new Set(candidate.matchingDeclaredSkills.map((skill) => skill.skillId))
    return run.criteria.skillMatchMode === 'AND'
      ? selectedSkillIds.every((skillId) => declaredIds.has(skillId))
      : selectedSkillIds.some((skillId) => declaredIds.has(skillId))
  })
}

function shortlistCandidate(
  candidate: ApiCandidateFilteringCandidateResponse,
  note: string | null,
) {
  return {
    studentId: candidate.studentId,
    indexNumber: candidate.indexNumber,
    fullName: candidate.fullName,
    officialGpa: candidate.officialGpa,
    gpaAvailabilityStatus: candidate.gpaAvailabilityStatus,
    hasLatestSavedCv: candidate.hasLatestSavedCv,
    hasExistingActiveShortlist: true,
    existingActiveShortlistCount: candidate.existingActiveShortlistCount + 1,
    selectedAt: mockTimestamp,
    selectionNote: note,
  } satisfies ApiShortlistCandidateResponse
}

function refreshShortlist(shortlistId: string) {
  const index = shortlists.findIndex((item) => item.shortlistId === shortlistId)
  if (index < 0) return null
  const current = shortlists[index]
  const selectedCandidateCount = shortlistCandidates[shortlistId]?.length ?? 0
  const guidanceExceeded =
    current.guidanceValue !== null && selectedCandidateCount > current.guidanceValue
  const updated: ApiShortlistResponse = {
    ...current,
    selectedCandidateCount,
    guidanceExceeded,
    guidanceWarning: guidanceExceeded
      ? 'The selected candidate count is above the request guidance value.'
      : null,
    version: current.version + 1,
    updatedAt: mockTimestamp,
  }
  shortlists[index] = updated
  return updated
}

function newExportJob(shortlistId: string, type: 'summary' | 'bulk') {
  const exportJobId = mockId('90', exportSequence++)
  const shortlist = shortlists.find((item) => item.shortlistId === shortlistId)
  const totalCandidateCount = shortlist?.selectedCandidateCount ?? 0
  const job: ApiExportJobResponse = {
    exportJobId,
    shortlistId,
    exportType: type === 'summary' ? 'SHORTLIST_SUMMARY_CSV' : 'BULK_LATEST_CV_ZIP',
    format: type === 'summary' ? 'CSV' : 'ZIP',
    status: 'QUEUED',
    totalCandidateCount,
    includedFileCount: 0,
    missingCvCount: 0,
    missingCvStudents: [],
    warnings: [],
    downloadReady: false,
    downloadUrl: null,
    createdAt: mockTimestamp,
    startedAt: null,
    completedAt: null,
    expiresAt: null,
    failureCode: null,
    failureMessage: null,
  }
  exportJobs.set(exportJobId, job)
  return job
}

function studentDetail(studentId: string) {
  if (studentId === deepDiveStudentId) return clone(studentDeepDiveFixture)
  const candidate = sprint78CandidatesFixture.find((item) => item.studentId === studentId)
  if (!candidate) return null
  const detail = clone(studentDeepDiveFixture)
  const email = `${candidate.indexNumber.replace(/[^a-z0-9]/gi, '').toLowerCase()}@dcs.ruh.ac.lk`
  detail.student = {
    ...detail.student,
    studentId,
    indexNumber: candidate.indexNumber,
    fullName: candidate.fullName,
    universityEmail: email,
    officialGpa: candidate.officialGpa,
  }
  detail.profile = {
    ...detail.profile,
    studentId,
    indexNumber: candidate.indexNumber,
    fullName: candidate.fullName,
    universityEmail: email,
  }
  detail.latestCv = candidate.hasLatestSavedCv
    ? { ...detail.latestCv, downloadUrl: `/admin/students/${studentId}/latest-cv/download` }
    : {
        availability: 'NOT_SAVED',
        cvId: null,
        revision: null,
        generatedAt: null,
        savedAt: null,
        freshnessStatus: null,
        fileName: null,
        fileSizeBytes: null,
        downloadUrl: null,
      }
  return detail
}

export const sprint78Handlers = [
  http.get(`${apiBase}/admin/students/:studentId`, ({ params }) => {
    const detail = studentDetail(String(params.studentId))
    return detail
      ? HttpResponse.json(detail)
      : problem(404, 'STUDENT_NOT_FOUND', 'The Student was not found.')
  }),

  http.get(`${apiBase}/admin/students/:studentId/declared-skills`, ({ params, request }) => {
    const studentId = String(params.studentId)
    const detail = studentDetail(studentId)
    if (!detail) return problem(404, 'STUDENT_NOT_FOUND', 'The Student was not found.')
    const candidate = sprint78CandidatesFixture.find((item) => item.studentId === studentId)
    return HttpResponse.json(
      page(
        candidate?.matchingDeclaredSkills ?? studentDeepDiveSkillsFixture,
        request,
        'createdAt,desc',
      ),
    )
  }),

  http.get(`${apiBase}/admin/students/:studentId/projects`, ({ params, request }) =>
    studentDetail(String(params.studentId))
      ? HttpResponse.json(page(studentDeepDiveProjectsFixture, request, 'createdAt,desc'))
      : problem(404, 'STUDENT_NOT_FOUND', 'The Student was not found.'),
  ),

  ...sprint78StudentIds.map((studentId) =>
    http.get(`${apiBase}/admin/students/${studentId}/academic-records`, ({ request }) =>
      HttpResponse.json(page(studentDeepDiveAcademicsFixture, request, 'academicYear,desc')),
    ),
  ),

  http.get(`${apiBase}/admin/students/:studentId/latest-cv`, ({ params }) => {
    const detail = studentDetail(String(params.studentId))
    return detail
      ? HttpResponse.json(detail.latestCv)
      : problem(404, 'STUDENT_NOT_FOUND', 'The Student was not found.')
  }),

  http.get(`${apiBase}/admin/companies`, ({ request }) => {
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const active = url.searchParams.get('active')
    const items = companies.filter(
      (company) =>
        (!search ||
          `${company.name} ${company.contactPerson ?? ''}`.toLowerCase().includes(search)) &&
        (!active || !['true', 'false'].includes(active) || String(company.active) === active),
    )
    return HttpResponse.json(page(items, request, 'name,asc'))
  }),

  http.get(`${apiBase}/admin/companies/:companyId`, ({ params }) => {
    const company = companies.find((item) => item.companyId === String(params.companyId))
    return company
      ? HttpResponse.json(company)
      : problem(404, 'COMPANY_NOT_FOUND', 'The company was not found.')
  }),

  http.post(`${apiBase}/admin/companies`, async ({ request }) => {
    const body = (await request.json()) as ApiCompanyRequest
    const company: ApiCompanyResponse = {
      companyId: mockId('a9', companySequence++),
      name: body.name,
      websiteUrl: body.websiteUrl ?? null,
      contactPerson: body.contactPerson ?? null,
      contactEmail: body.contactEmail ?? null,
      contactPhone: body.contactPhone ?? null,
      notes: body.notes ?? null,
      active: true,
      version: 0,
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
    }
    companies.unshift(company)
    return HttpResponse.json(company, { status: 201 })
  }),

  http.patch(`${apiBase}/admin/companies/:companyId`, async ({ params, request }) => {
    const index = companies.findIndex((item) => item.companyId === String(params.companyId))
    if (index < 0) return problem(404, 'COMPANY_NOT_FOUND', 'The company was not found.')
    const precondition = versionProblem(request, companies[index].version)
    if (precondition) return precondition
    const body = (await request.json()) as ApiCompanyUpdateRequest
    const company: ApiCompanyResponse = {
      ...companies[index],
      ...body,
      websiteUrl: body.websiteUrl === undefined ? companies[index].websiteUrl : body.websiteUrl,
      contactPerson:
        body.contactPerson === undefined ? companies[index].contactPerson : body.contactPerson,
      contactEmail:
        body.contactEmail === undefined ? companies[index].contactEmail : body.contactEmail,
      contactPhone:
        body.contactPhone === undefined ? companies[index].contactPhone : body.contactPhone,
      notes: body.notes === undefined ? companies[index].notes : body.notes,
      version: companies[index].version + 1,
      updatedAt: mockTimestamp,
    }
    companies[index] = company
    internshipRequests = internshipRequests.map((item) =>
      item.company.companyId === company.companyId ? { ...item, company } : item,
    )
    return HttpResponse.json(company)
  }),

  http.delete(`${apiBase}/admin/companies/:companyId`, ({ params, request }) => {
    const index = companies.findIndex((item) => item.companyId === String(params.companyId))
    if (index < 0) return problem(404, 'COMPANY_NOT_FOUND', 'The company was not found.')
    const precondition = versionProblem(request, companies[index].version)
    if (precondition) return precondition
    companies[index] = {
      ...companies[index],
      active: false,
      version: companies[index].version + 1,
      updatedAt: mockTimestamp,
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${apiBase}/admin/internship-requests`, ({ request }) => {
    const url = new URL(request.url)
    const companyId = url.searchParams.get('companyId')
    const status = url.searchParams.get('status')
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const items = internshipRequests.filter(
      (item) =>
        (!companyId || item.company.companyId === companyId) &&
        (!status || item.status === status) &&
        (!search || `${item.title} ${item.company.name}`.toLowerCase().includes(search)),
    )
    return HttpResponse.json(page(items, request, 'createdAt,desc'))
  }),

  http.get(`${apiBase}/admin/internship-requests/:requestId`, ({ params }) => {
    const item = internshipRequests.find(
      (request) => request.requestId === String(params.requestId),
    )
    return item
      ? HttpResponse.json(item)
      : problem(404, 'INTERNSHIP_REQUEST_NOT_FOUND', 'The internship request was not found.')
  }),

  http.post(`${apiBase}/admin/internship-requests`, async ({ request }) => {
    const body = (await request.json()) as ApiInternshipRequestCreateRequest
    const company = companies.find((item) => item.companyId === body.companyId && item.active)
    if (!company) return problem(422, 'ACTIVE_COMPANY_REQUIRED', 'Select an active company.')
    const item: ApiInternshipRequestResponse = {
      requestId: mockId('b9', requestSequence++),
      company,
      title: body.title,
      description: body.description ?? null,
      location: body.location ?? null,
      workMode: body.workMode ?? null,
      status: body.status,
      shortlistGuidanceValue: body.shortlistGuidanceValue ?? null,
      notes: body.notes ?? null,
      requiredSkills: body.requiredSkills.map(requiredSkill),
      version: 0,
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
    }
    internshipRequests.unshift(item)
    return HttpResponse.json(item, { status: 201 })
  }),

  http.patch(`${apiBase}/admin/internship-requests/:requestId`, async ({ params, request }) => {
    const index = internshipRequests.findIndex(
      (item) => item.requestId === String(params.requestId),
    )
    if (index < 0)
      return problem(404, 'INTERNSHIP_REQUEST_NOT_FOUND', 'The internship request was not found.')
    const current = internshipRequests[index]
    const precondition = versionProblem(request, current.version)
    if (precondition) return precondition
    const body = (await request.json()) as ApiInternshipRequestUpdateRequest
    const company = body.companyId
      ? companies.find((item) => item.companyId === body.companyId && item.active)
      : current.company
    if (!company) return problem(422, 'ACTIVE_COMPANY_REQUIRED', 'Select an active company.')
    const updated: ApiInternshipRequestResponse = {
      ...current,
      ...body,
      company,
      description: body.description === undefined ? current.description : body.description,
      location: body.location === undefined ? current.location : body.location,
      workMode: body.workMode === undefined ? current.workMode : body.workMode,
      shortlistGuidanceValue:
        body.shortlistGuidanceValue === undefined
          ? current.shortlistGuidanceValue
          : body.shortlistGuidanceValue,
      notes: body.notes === undefined ? current.notes : body.notes,
      requiredSkills: body.requiredSkills
        ? body.requiredSkills.map(requiredSkill)
        : current.requiredSkills,
      version: current.version + 1,
      updatedAt: mockTimestamp,
    }
    internshipRequests[index] = updated
    return HttpResponse.json(updated)
  }),

  http.delete(`${apiBase}/admin/internship-requests/:requestId`, ({ params, request }) => {
    const index = internshipRequests.findIndex(
      (item) => item.requestId === String(params.requestId),
    )
    if (index < 0)
      return problem(404, 'INTERNSHIP_REQUEST_NOT_FOUND', 'The internship request was not found.')
    const precondition = versionProblem(request, internshipRequests[index].version)
    if (precondition) return precondition
    internshipRequests[index] = {
      ...internshipRequests[index],
      status: 'CANCELLED',
      version: internshipRequests[index].version + 1,
      updatedAt: mockTimestamp,
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(
    `${apiBase}/admin/internship-requests/:requestId/required-skills`,
    ({ params, request }) => {
      const item = internshipRequests.find(
        (request) => request.requestId === String(params.requestId),
      )
      return item
        ? HttpResponse.json(page(item.requiredSkills, request, 'skillName,asc'))
        : problem(404, 'INTERNSHIP_REQUEST_NOT_FOUND', 'The internship request was not found.')
    },
  ),

  http.post(
    `${apiBase}/admin/internship-requests/:requestId/required-skills`,
    async ({ params, request }) => {
      const index = internshipRequests.findIndex(
        (item) => item.requestId === String(params.requestId),
      )
      if (index < 0)
        return problem(404, 'INTERNSHIP_REQUEST_NOT_FOUND', 'The internship request was not found.')
      const precondition = versionProblem(request, internshipRequests[index].version)
      if (precondition) return precondition
      const skill = requiredSkill((await request.json()) as ApiInternshipRequiredSkillRequest)
      internshipRequests[index] = {
        ...internshipRequests[index],
        requiredSkills: [...internshipRequests[index].requiredSkills, skill],
        version: internshipRequests[index].version + 1,
        updatedAt: mockTimestamp,
      }
      return HttpResponse.json(skill, { status: 201 })
    },
  ),

  http.delete(
    `${apiBase}/admin/internship-requests/:requestId/required-skills/:requiredSkillId`,
    ({ params, request }) => {
      const index = internshipRequests.findIndex(
        (item) => item.requestId === String(params.requestId),
      )
      if (index < 0)
        return problem(404, 'INTERNSHIP_REQUEST_NOT_FOUND', 'The internship request was not found.')
      const precondition = versionProblem(request, internshipRequests[index].version)
      if (precondition) return precondition
      internshipRequests[index] = {
        ...internshipRequests[index],
        requiredSkills: internshipRequests[index].requiredSkills.filter(
          (skill) => skill.requiredSkillId !== String(params.requiredSkillId),
        ),
        version: internshipRequests[index].version + 1,
        updatedAt: mockTimestamp,
      }
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.post(`${apiBase}/admin/candidate-filtering/runs`, async ({ request }) => {
    const body = (await request.json()) as ApiCandidateFilteringCriteriaRequest
    const internshipRequest = internshipRequests.find((item) => item.requestId === body.requestId)
    if (!internshipRequest) {
      return problem(404, 'INTERNSHIP_REQUEST_NOT_FOUND', 'The internship request was not found.')
    }
    const run: ApiCandidateFilteringRunResponse = {
      filterRunId: mockId('c9', filterRunSequence++),
      request: requestSummary(internshipRequest),
      criteria: {
        requestId: body.requestId,
        runtimeGpaLowerBound: body.runtimeGpaLowerBound ?? null,
        runtimeGpaUpperBound: body.runtimeGpaUpperBound ?? null,
        requestSkillIds: body.requestSkillIds ?? [],
        additionalSkillIds: body.additionalSkillIds ?? [],
        skillMatchMode: body.skillMatchMode,
      },
      candidateCount: 0,
      createdAt: mockTimestamp,
    }
    run.candidateCount = filteredCandidates(run).length
    filterRuns.unshift(run)
    return HttpResponse.json(run, { status: 201 })
  }),

  http.get(`${apiBase}/admin/candidate-filtering/runs/:filterRunId`, ({ params }) => {
    const run = filterRuns.find((item) => item.filterRunId === String(params.filterRunId))
    return run
      ? HttpResponse.json(run)
      : problem(404, 'FILTER_RUN_NOT_FOUND', 'The filtering run was not found.')
  }),

  http.get(
    `${apiBase}/admin/candidate-filtering/runs/:filterRunId/candidates`,
    ({ params, request }) => {
      const run = filterRuns.find((item) => item.filterRunId === String(params.filterRunId))
      if (!run) return problem(404, 'FILTER_RUN_NOT_FOUND', 'The filtering run was not found.')
      const url = new URL(request.url)
      const search = (url.searchParams.get('search') ?? '').toLowerCase()
      const items = filteredCandidates(run).filter(
        (candidate) =>
          !search ||
          `${candidate.indexNumber} ${candidate.fullName}`.toLowerCase().includes(search),
      )
      return HttpResponse.json(page(items, request, 'officialGpa,desc'))
    },
  ),

  http.get(`${apiBase}/admin/shortlists`, ({ request }) => {
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const status = url.searchParams.get('status')
    const companyId = url.searchParams.get('companyId')
    const items = shortlists.filter(
      (item) =>
        (!status || item.status === status) &&
        (!companyId || item.request.companyId === companyId) &&
        (!search ||
          `${item.name ?? ''} ${item.request.companyName} ${item.request.title}`
            .toLowerCase()
            .includes(search)),
    )
    return HttpResponse.json(page(items, request, 'updatedAt,desc'))
  }),

  http.get(`${apiBase}/admin/shortlists/:shortlistId`, ({ params, request }) => {
    const shortlistId = String(params.shortlistId)
    const shortlist = shortlists.find((item) => item.shortlistId === shortlistId)
    if (!shortlist) return problem(404, 'SHORTLIST_NOT_FOUND', 'The shortlist was not found.')
    const search = (new URL(request.url).searchParams.get('candidateSearch') ?? '').toLowerCase()
    const candidates = (shortlistCandidates[shortlistId] ?? []).filter(
      (candidate) =>
        !search || `${candidate.indexNumber} ${candidate.fullName}`.toLowerCase().includes(search),
    )
    return HttpResponse.json({
      shortlist,
      candidates: page(candidates, request, 'officialGpa,desc'),
    })
  }),

  http.post(`${apiBase}/admin/shortlists`, async ({ request }) => {
    const body = (await request.json()) as ApiShortlistCreateRequest
    const internshipRequest = internshipRequests.find((item) => item.requestId === body.requestId)
    if (!internshipRequest) {
      return problem(404, 'INTERNSHIP_REQUEST_NOT_FOUND', 'The internship request was not found.')
    }
    if (shortlists.some((item) => item.request.requestId === body.requestId)) {
      return problem(409, 'ACTIVE_SHORTLIST_EXISTS', 'This request already has a shortlist.')
    }
    const shortlist: ApiShortlistResponse = {
      shortlistId: mockId('e9', shortlistSequence++),
      request: requestSummary(internshipRequest),
      filterRunId: body.filterRunId ?? null,
      name: body.name ?? null,
      status: 'DRAFT',
      guidanceValue: internshipRequest.shortlistGuidanceValue,
      selectedCandidateCount: 0,
      guidanceExceeded: false,
      guidanceWarning: null,
      version: 0,
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
      finalizedAt: null,
    }
    shortlists.unshift(shortlist)
    shortlistCandidates[shortlist.shortlistId] = []
    return HttpResponse.json(shortlist, { status: 201 })
  }),

  http.post(`${apiBase}/admin/shortlists/:shortlistId/candidates`, async ({ params, request }) => {
    const shortlistId = String(params.shortlistId)
    const shortlist = shortlists.find((item) => item.shortlistId === shortlistId)
    if (!shortlist) return problem(404, 'SHORTLIST_NOT_FOUND', 'The shortlist was not found.')
    if (shortlist.status !== 'DRAFT')
      return problem(409, 'SHORTLIST_FINALIZED', 'Finalized shortlists are read-only.')
    const precondition = versionProblem(request, shortlist.version)
    if (precondition) return precondition
    const body = (await request.json()) as ApiShortlistCandidateRequest
    const current = shortlistCandidates[shortlistId] ?? []
    const currentIds = new Set(current.map((candidate) => candidate.studentId))
    const additions = sprint78CandidatesFixture
      .filter(
        (candidate) =>
          body.studentIds.includes(candidate.studentId) && !currentIds.has(candidate.studentId),
      )
      .map((candidate) => shortlistCandidate(candidate, body.note ?? null))
    shortlistCandidates[shortlistId] = [...current, ...additions]
    const updated = refreshShortlist(shortlistId)!
    return HttpResponse.json({
      shortlistId,
      addedCount: additions.length,
      alreadyPresentCount: body.studentIds.length - additions.length,
      removedCount: 0,
      selectedCandidateCount: updated.selectedCandidateCount,
      guidanceExceeded: updated.guidanceExceeded,
      version: updated.version,
    })
  }),

  http.delete(
    `${apiBase}/admin/shortlists/:shortlistId/candidates/:studentId`,
    ({ params, request }) => {
      const shortlistId = String(params.shortlistId)
      const shortlist = shortlists.find((item) => item.shortlistId === shortlistId)
      if (!shortlist) return problem(404, 'SHORTLIST_NOT_FOUND', 'The shortlist was not found.')
      if (shortlist.status !== 'DRAFT')
        return problem(409, 'SHORTLIST_FINALIZED', 'Finalized shortlists are read-only.')
      const precondition = versionProblem(request, shortlist.version)
      if (precondition) return precondition
      const current = shortlistCandidates[shortlistId] ?? []
      const remaining = current.filter(
        (candidate) => candidate.studentId !== String(params.studentId),
      )
      shortlistCandidates[shortlistId] = remaining
      const updated = refreshShortlist(shortlistId)!
      return HttpResponse.json({
        shortlistId,
        addedCount: 0,
        alreadyPresentCount: 0,
        removedCount: current.length - remaining.length,
        selectedCandidateCount: updated.selectedCandidateCount,
        guidanceExceeded: updated.guidanceExceeded,
        version: updated.version,
      })
    },
  ),

  http.post(`${apiBase}/admin/shortlists/:shortlistId/finalize`, async ({ params, request }) => {
    const shortlistId = String(params.shortlistId)
    const index = shortlists.findIndex((item) => item.shortlistId === shortlistId)
    if (index < 0) return problem(404, 'SHORTLIST_NOT_FOUND', 'The shortlist was not found.')
    const current = shortlists[index]
    if (current.status !== 'DRAFT')
      return problem(409, 'SHORTLIST_FINALIZED', 'The shortlist is already finalized.')
    const precondition = versionProblem(request, current.version)
    if (precondition) return precondition
    const body = (await request.json()) as ApiShortlistFinalizeRequest
    if (current.guidanceExceeded && !body.acknowledgeGuidanceWarning) {
      return problem(
        409,
        'GUIDANCE_ACKNOWLEDGEMENT_REQUIRED',
        'Acknowledge the guidance warning before finalizing.',
      )
    }
    const finalizedAt = mockTimestamp
    const updated: ApiShortlistResponse = {
      ...current,
      status: 'FINALIZED',
      version: current.version + 1,
      finalizedAt,
      updatedAt: finalizedAt,
    }
    shortlists[index] = updated
    return HttpResponse.json({
      shortlistId,
      status: 'FINALIZED',
      selectedCandidateCount: updated.selectedCandidateCount,
      guidanceValue: updated.guidanceValue,
      guidanceExceeded: updated.guidanceExceeded,
      guidanceAcknowledged: !updated.guidanceExceeded || body.acknowledgeGuidanceWarning,
      version: updated.version,
      finalizedAt,
    })
  }),

  http.post(`${apiBase}/admin/exports/shortlists/:shortlistId`, ({ params }) =>
    HttpResponse.json(newExportJob(String(params.shortlistId), 'summary'), {
      status: 202,
      headers: { 'Retry-After': '1' },
    }),
  ),

  http.post(`${apiBase}/admin/exports/shortlists/:shortlistId/bulk-cvs`, ({ params }) =>
    HttpResponse.json(newExportJob(String(params.shortlistId), 'bulk'), {
      status: 202,
      headers: { 'Retry-After': '1' },
    }),
  ),

  http.get(`${apiBase}/admin/exports/:exportJobId`, ({ params }) => {
    const exportJobId = String(params.exportJobId)
    const current = exportJobs.get(exportJobId)
    if (!current) return problem(404, 'EXPORT_JOB_NOT_FOUND', 'The export job was not found.')
    const candidates = shortlistCandidates[current.shortlistId] ?? []
    const missingCvStudents =
      current.exportType === 'BULK_LATEST_CV_ZIP'
        ? candidates
            .filter((candidate) => !candidate.hasLatestSavedCv)
            .map((candidate) => ({
              studentId: candidate.studentId,
              indexNumber: candidate.indexNumber,
              fullName: candidate.fullName,
              reasonCode: 'LATEST_CV_NOT_SAVED' as const,
              message: 'No latest saved CV is available.',
            }))
        : []
    const completed: ApiExportJobResponse = {
      ...current,
      status: 'COMPLETED',
      includedFileCount:
        current.exportType === 'SHORTLIST_SUMMARY_CSV'
          ? 1
          : current.totalCandidateCount - missingCvStudents.length,
      missingCvCount: missingCvStudents.length,
      missingCvStudents,
      warnings: missingCvStudents.length
        ? [
            {
              code: 'MISSING_CVS',
              message: 'Some Students do not have a latest saved CV and were omitted.',
            },
          ]
        : [],
      downloadReady: true,
      downloadUrl:
        current.exportType === 'SHORTLIST_SUMMARY_CSV'
          ? `/admin/exports/${exportJobId}/download`
          : `/admin/exports/${exportJobId}/bulk-cvs/download`,
      startedAt: '2026-07-21T10:00:01+05:30',
      completedAt: '2026-07-21T10:00:02+05:30',
      expiresAt: '2026-07-22T10:00:02+05:30',
    }
    exportJobs.set(exportJobId, completed)
    return HttpResponse.json(completed)
  }),

  http.get(
    `${apiBase}/admin/exports/:exportJobId/download`,
    () =>
      new HttpResponse('indexNumber,fullName\nSC/2022/12347,Nethmi Wijesinghe', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="shortlist-summary.csv"',
        },
      }),
  ),

  http.get(
    `${apiBase}/admin/exports/:exportJobId/bulk-cvs/download`,
    () =>
      new HttpResponse('mock-zip-content', {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="latest-saved-cvs.zip"',
        },
      }),
  ),

  http.get(`${apiBase}/admin/students/:studentId/latest-cv/download`, ({ params }) => {
    const detail = studentDetail(String(params.studentId))
    if (!detail) return problem(404, 'STUDENT_NOT_FOUND', 'The Student was not found.')
    if (detail.latestCv.availability !== 'AVAILABLE') {
      return problem(404, 'LATEST_CV_NOT_SAVED', 'No latest saved CV is available.')
    }
    return new HttpResponse('mock-pdf-content', {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${detail.latestCv.fileName ?? 'student-latest-cv.pdf'}"`,
      },
    })
  }),
]
