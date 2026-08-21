import { describe, expect, it } from 'vitest'
import { candidateFilteringApi } from '../../features/candidate-filtering/api/candidateFilteringApi'
import { internshipManagementApi } from '../../features/internship-management/api/internshipManagementApi'
import { shortlistsApi } from '../../features/shortlists/api/shortlistsApi'
import { studentManagementApi } from '../../features/student-management/api/studentManagementApi'
import { sprint78Ids } from '../fixtures/sprint78.fixture'
import { deepDiveStudentId } from '../fixtures/studentDeepDive.fixture'

describe('Sprint 7-8 development handlers', () => {
  it('loads every Student Deep-Dive section without a backend server', async () => {
    const [detail, skills, projects, academics, latestCv] = await Promise.all([
      studentManagementApi.getStudentDetail(deepDiveStudentId),
      studentManagementApi.listDeclaredSkills(deepDiveStudentId, {
        page: 0,
        size: 20,
        search: '',
      }),
      studentManagementApi.listProjects(deepDiveStudentId, {
        page: 0,
        size: 20,
        search: '',
      }),
      studentManagementApi.listAcademicRecords(deepDiveStudentId, {
        page: 0,
        size: 20,
        sort: 'academicYear,desc',
        search: '',
        courseCode: '',
      }),
      studentManagementApi.getLatestCv(deepDiveStudentId),
    ])

    expect(detail.student.fullName).toBe('Asha Silva')
    expect(skills.items).toHaveLength(1)
    expect(projects.items).toHaveLength(1)
    expect(academics.items).toHaveLength(1)
    expect(latestCv.availability).toBe('AVAILABLE')
  })

  it('persists company and internship request CRUD mutations', async () => {
    const initial = await internshipManagementApi.listCompanies({
      page: 0,
      size: 20,
      sort: 'name,asc',
      search: '',
    })
    expect(initial.items.length).toBeGreaterThan(0)

    const createdCompany = await internshipManagementApi.createCompany({
      name: 'CRUD Test Company',
      websiteUrl: 'https://crud.example.test',
      contactPerson: 'Test Contact',
      contactEmail: 'contact@crud.example.test',
      contactPhone: null,
    })
    const updatedCompany = await internshipManagementApi.updateCompany({
      companyId: createdCompany.companyId,
      version: createdCompany.version,
      body: { notes: 'Updated through the stateful development API.' },
    })
    expect(updatedCompany.notes).toContain('stateful')

    const createdRequest = await internshipManagementApi.createInternshipRequest({
      companyId: createdCompany.companyId,
      title: 'CRUD Engineering Intern',
      description: null,
      shortlistGuidanceValue: 2,
      requiredSkills: [],
    })
    expect(
      (await internshipManagementApi.getInternshipRequest(createdRequest.requestId)).title,
    ).toBe('CRUD Engineering Intern')

    await internshipManagementApi.deleteInternshipRequest({
      requestId: createdRequest.requestId,
      version: createdRequest.version,
    })
    await expect(
      internshipManagementApi.getInternshipRequest(createdRequest.requestId),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('runs filtering and persists shortlist removal and finalization', async () => {
    const run = await candidateFilteringApi.createRun({
      requestId: sprint78Ids.requests.frontend,
      runtimeGpaLowerBound: 3,
      runtimeGpaUpperBound: 4,
      requestSkillIds: [],
      additionalSkillIds: [],
      skillMatchMode: 'AND',
    })
    const candidates = await candidateFilteringApi.listCandidates({
      filterRunId: run.filterRunId,
      page: 0,
      size: 20,
      search: '',
      sort: 'officialGpa,desc',
    })
    expect(candidates.items.length).toBeGreaterThan(0)

    const shortlistId = sprint78Ids.shortlists.frontendDraft
    const initial = await shortlistsApi.getShortlistDetail({
      shortlistId,
      candidatePage: 0,
      candidateSize: 20,
      candidateSearch: '',
      candidateSort: 'officialGpa,desc',
    })
    const removedStudentId = initial.candidates.items[0].studentId
    const mutation = await shortlistsApi.removeCandidate({
      shortlistId,
      studentId: removedStudentId,
      version: initial.shortlist.version,
    })
    expect(mutation.removedCount).toBe(1)

    const finalized = await shortlistsApi.finalize({
      shortlistId,
      version: mutation.version,
      body: { acknowledgeGuidanceWarning: false, finalizationNote: null },
    })
    expect(finalized.status).toBe('FINALIZED')
  })
})
