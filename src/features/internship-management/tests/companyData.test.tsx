import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../mocks/server'
import { internshipManagementApi } from '../api/internshipManagementApi'
import { getCompanyMutationErrorMessage } from '../hooks/useCompanies'
import { internshipManagementKeys } from '../hooks/internshipManagementQueryKeys'
import { parseCompaniesUrlState, serializeCompaniesUrlState } from '../hooks/useCompaniesUrlState'
import {
  companyRequestSchema,
  companyResponseSchema,
  companyUpdateRequestSchema,
} from '../schemas/internshipSchemas'

const companyId = '11111111-1111-4111-8111-111111111111'
const now = '2026-07-20T09:30:00Z'
const company = companyResponseSchema.parse({
  companyId,
  name: 'Example Technologies',
  websiteUrl: 'https://example.com',
  contactPerson: 'HR Coordinator',
  contactEmail: 'hr@example.com',
  contactPhone: '+94 11 234 5678',
  notes: null,
  active: true,
  version: 3,
  createdAt: now,
  updatedAt: now,
})

describe('Company metadata data layer', () => {
  it('strictly validates create, partial update, and response contracts', () => {
    expect(companyRequestSchema.parse({ name: 'Example Technologies' })).toEqual({
      name: 'Example Technologies',
    })
    expect(companyUpdateRequestSchema.parse({ active: true })).toEqual({ active: true })
    expect(() => companyUpdateRequestSchema.parse({})).toThrow()
    expect(() => companyResponseSchema.parse({ ...company, unsupported: 'enabled' })).toThrow()
    expect(() =>
      companyRequestSchema.parse({ name: 'Unsafe', websiteUrl: 'javascript:alert(1)' }),
    ).toThrow()
  })

  it('parses and serializes prefixed URL state with an omitted all-status filter', () => {
    const selected = companyId
    const parsed = parseCompaniesUrlState(
      new URLSearchParams(
        `companySearch=Tech&companyActive=false&companySort=updatedAt%2Cdesc&companyPage=2&companySize=50&companyId=${selected}`,
      ),
    )
    expect(parsed).toEqual({
      page: 2,
      size: 50,
      sort: 'updatedAt,desc',
      search: 'Tech',
      active: false,
      selectedCompanyId: selected,
    })
    expect(serializeCompaniesUrlState(parsed).toString()).toContain('companyActive=false')
    expect(serializeCompaniesUrlState({ ...parsed, active: undefined }).toString()).not.toContain(
      'companyActive',
    )
    expect(parseCompaniesUrlState(new URLSearchParams('companySize=7&companyId=bad'))).toEqual(
      expect.objectContaining({ size: 20, selectedCompanyId: undefined }),
    )
  })

  it('constructs list/detail/create/update/deactivate requests with concurrency headers', async () => {
    const requests: Array<{
      method: string
      search?: string
      ifMatch?: string | null
      body?: unknown
    }> = []
    server.use(
      http.get('/api/v1/admin/companies', ({ request }) => {
        requests.push({ method: request.method, search: new URL(request.url).search })
        return HttpResponse.json({
          items: [company],
          page: { page: 0, size: 20, totalElements: 1, totalPages: 1, sort: 'name,asc' },
        })
      }),
      http.get('/api/v1/admin/companies/:companyId', () => HttpResponse.json(company)),
      http.post('/api/v1/admin/companies', async ({ request }) => {
        requests.push({ method: request.method, body: await request.json() })
        return HttpResponse.json(company, { status: 201 })
      }),
      http.patch('/api/v1/admin/companies/:companyId', async ({ request }) => {
        requests.push({
          method: request.method,
          body: await request.json(),
          ifMatch: request.headers.get('If-Match'),
        })
        return HttpResponse.json({ ...company, name: 'Updated Technologies', version: 4 })
      }),
      http.delete('/api/v1/admin/companies/:companyId', ({ request }) => {
        requests.push({ method: request.method, ifMatch: request.headers.get('If-Match') })
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const query = { page: 0, size: 20 as const, sort: 'name,asc' as const, search: '' }
    await internshipManagementApi.listCompanies(query)
    await expect(internshipManagementApi.getCompany(companyId)).resolves.toEqual(company)
    await internshipManagementApi.createCompany({ name: company.name })
    await internshipManagementApi.updateCompany({
      companyId,
      version: 3,
      body: { name: 'Updated Technologies' },
    })
    await internshipManagementApi.deactivateCompany({ companyId, version: 4 })

    expect(requests).toEqual([
      { method: 'GET', search: '?page=0&size=20&sort=name%2Casc' },
      { method: 'POST', body: { name: company.name } },
      { method: 'PATCH', body: { name: 'Updated Technologies' }, ifMatch: '"3"' },
      { method: 'DELETE', ifMatch: '"4"' },
    ])
    expect(internshipManagementKeys.companyList(query)).toEqual([
      'protected',
      'internship-management',
      'companies',
      'list',
      query,
    ])
  })

  it('maps concurrency and linked-request failures to safe recovery messages', () => {
    expect(getCompanyMutationErrorMessage({ status: 412, title: 'Stale' })).toContain('changed')
    expect(getCompanyMutationErrorMessage({ status: 428, title: 'Precondition' })).toContain(
      'Reload',
    )
    expect(getCompanyMutationErrorMessage({ status: 409, title: 'Linked' })).toContain(
      'active internship request',
    )
  })
})
