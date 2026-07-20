import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../mocks/server'
import { internshipManagementApi } from '../api/internshipManagementApi'
import { internshipManagementKeys } from '../hooks/internshipManagementQueryKeys'
import {
  internshipRequestCreateSchema,
  internshipRequestResponseSchema,
  internshipRequestUpdateSchema,
} from '../schemas/internshipSchemas'

const requestId = '33333333-3333-4333-8333-333333333333'
const companyId = '11111111-1111-4111-8111-111111111111'
const skillId = '44444444-4444-4444-8444-444444444444'
const requiredSkillId = '55555555-5555-4555-8555-555555555555'
const now = '2026-07-20T09:30:00Z'
const company = {
  companyId,
  name: 'Example Technologies',
  websiteUrl: null,
  contactPerson: null,
  contactEmail: null,
  contactPhone: null,
  notes: null,
  active: true,
  version: 1,
  createdAt: now,
  updatedAt: now,
}
const requiredSkill = {
  requiredSkillId,
  skillId,
  skillName: 'TypeScript',
  requiredCompetencyLevel: 'INTERMEDIATE' as const,
}
const internshipRequest = internshipRequestResponseSchema.parse({
  requestId,
  company,
  title: 'Software Engineering Intern',
  description: null,
  location: 'Matara',
  workMode: 'HYBRID',
  status: 'DRAFT',
  shortlistGuidanceValue: 12,
  notes: null,
  requiredSkills: [requiredSkill],
  version: 2,
  createdAt: now,
  updatedAt: now,
})

const page = <Item>(items: Item[], sort = 'createdAt,desc') => ({
  items,
  page: { page: 0, size: 20, totalElements: items.length, totalPages: items.length ? 1 : 0, sort },
})

describe('Internship request lifecycle data layer', () => {
  it('validates strict create and partial update contracts with unique required skills', () => {
    const create = {
      companyId,
      title: 'Software Engineering Intern',
      status: 'DRAFT' as const,
      requiredSkills: [{ skillId, requiredCompetencyLevel: 'INTERMEDIATE' as const }],
    }
    expect(internshipRequestCreateSchema.parse(create)).toEqual(create)
    expect(internshipRequestUpdateSchema.parse({ title: 'Updated role' })).toEqual({
      title: 'Updated role',
    })
    expect(() => internshipRequestUpdateSchema.parse({})).toThrow()
    expect(() =>
      internshipRequestCreateSchema.parse({
        ...create,
        requiredSkills: [...create.requiredSkills, ...create.requiredSkills],
      }),
    ).toThrow()
    expect(() => internshipRequestCreateSchema.parse({ ...create, unsupported: 3 })).toThrow()
  })

  it('constructs request list, detail, create, update, and cancellation calls', async () => {
    const calls: Array<{
      method: string
      search?: string
      ifMatch?: string | null
      body?: unknown
    }> = []
    server.use(
      http.get('/api/v1/admin/internship-requests', ({ request }) => {
        calls.push({ method: request.method, search: new URL(request.url).search })
        return HttpResponse.json(page([internshipRequest]))
      }),
      http.get('/api/v1/admin/internship-requests/:requestId', () =>
        HttpResponse.json(internshipRequest),
      ),
      http.post('/api/v1/admin/internship-requests', async ({ request }) => {
        calls.push({ method: request.method, body: await request.json() })
        return HttpResponse.json(internshipRequest, { status: 201 })
      }),
      http.patch('/api/v1/admin/internship-requests/:requestId', async ({ request }) => {
        calls.push({
          method: request.method,
          body: await request.json(),
          ifMatch: request.headers.get('If-Match'),
        })
        return HttpResponse.json({ ...internshipRequest, title: 'Updated role', version: 3 })
      }),
      http.delete('/api/v1/admin/internship-requests/:requestId', ({ request }) => {
        calls.push({ method: request.method, ifMatch: request.headers.get('If-Match') })
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const query = {
      page: 0,
      size: 20 as const,
      sort: 'createdAt,desc' as const,
      search: 'software',
      status: 'DRAFT' as const,
      companyId,
    }
    await internshipManagementApi.listInternshipRequests(query)
    await expect(internshipManagementApi.getInternshipRequest(requestId)).resolves.toEqual(
      internshipRequest,
    )
    await internshipManagementApi.createInternshipRequest({
      companyId,
      title: internshipRequest.title,
      status: 'DRAFT',
      requiredSkills: [{ skillId }],
    })
    await internshipManagementApi.updateInternshipRequest({
      requestId,
      version: 2,
      body: { title: 'Updated role' },
    })
    await internshipManagementApi.cancelInternshipRequest({ requestId, version: 3 })
    expect(calls).toEqual([
      {
        method: 'GET',
        search: `?page=0&size=20&sort=createdAt%2Cdesc&search=software&status=DRAFT&companyId=${companyId}`,
      },
      {
        method: 'POST',
        body: {
          companyId,
          title: internshipRequest.title,
          status: 'DRAFT',
          requiredSkills: [{ skillId }],
        },
      },
      { method: 'PATCH', body: { title: 'Updated role' }, ifMatch: '"2"' },
      { method: 'DELETE', ifMatch: '"3"' },
    ])
  })

  it('supports paged nested skill reads and versioned incremental mutations', async () => {
    const calls: Array<{
      method: string
      search?: string
      ifMatch?: string | null
      body?: unknown
    }> = []
    server.use(
      http.get('/api/v1/admin/internship-requests/:requestId/required-skills', ({ request }) => {
        calls.push({ method: request.method, search: new URL(request.url).search })
        return HttpResponse.json(page([requiredSkill], 'skillName,asc'))
      }),
      http.post(
        '/api/v1/admin/internship-requests/:requestId/required-skills',
        async ({ request }) => {
          calls.push({
            method: request.method,
            body: await request.json(),
            ifMatch: request.headers.get('If-Match'),
          })
          return HttpResponse.json(requiredSkill, { status: 201 })
        },
      ),
      http.delete(
        '/api/v1/admin/internship-requests/:requestId/required-skills/:requiredSkillId',
        ({ request }) => {
          calls.push({ method: request.method, ifMatch: request.headers.get('If-Match') })
          return new HttpResponse(null, { status: 204 })
        },
      ),
    )
    await internshipManagementApi.listRequiredSkills({ requestId, page: 0, size: 20 })
    await internshipManagementApi.addRequiredSkill({ requestId, version: 2, body: { skillId } })
    await internshipManagementApi.removeRequiredSkill({ requestId, requiredSkillId, version: 3 })
    expect(calls).toEqual([
      { method: 'GET', search: '?page=0&size=20' },
      { method: 'POST', body: { skillId }, ifMatch: '"2"' },
      { method: 'DELETE', ifMatch: '"3"' },
    ])
  })

  it('uses stable request and required-skill cache keys', () => {
    const query = { page: 0, size: 20 as const, sort: 'createdAt,desc' as const, search: '' }
    expect(internshipManagementKeys.requestList(query)).toEqual([
      'protected',
      'internship-management',
      'requests',
      'list',
      query,
    ])
    expect(internshipManagementKeys.requiredSkills({ requestId, page: 0, size: 20 })).toEqual([
      'protected',
      'internship-management',
      'requests',
      'detail',
      requestId,
      'required-skills',
      { requestId, page: 0, size: 20 },
    ])
  })
})
