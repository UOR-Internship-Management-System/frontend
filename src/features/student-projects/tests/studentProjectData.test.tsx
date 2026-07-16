import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { skillIds } from '../../../mocks/fixtures/skills.fixture'
import { getStudentProjectsFixture } from '../../../mocks/fixtures/studentProjects.fixture'
import { server } from '../../../mocks/server'
import { studentProjectsApi } from '../api/studentProjectsApi'
import { useCreateProject } from '../hooks/useProjectMutations'
import { studentProjectKeys } from '../hooks/studentProjectKeys'
import {
  mapStudentProjectCreateRequest,
  mapStudentProjectToForm,
  mapStudentProjectUpdateRequest,
} from '../mappers/studentProjectMapper'
import {
  pagedStudentProjectsSchema,
  studentProjectFormSchema,
  studentProjectSchema,
} from '../schemas/studentProjectSchemas'
import type { StudentProjectFormValues } from '../types/studentProjectTypes'

const projectForm: StudentProjectFormValues = {
  title: '  Portfolio API  ',
  description: '  Contract-driven portfolio project.  ',
  repositoryUrl: 'https://github.com/example/portfolio-api',
  demoUrl: '',
  startDate: '2026-01-10',
  endDate: '2026-05-15',
  skillIds: [skillIds.typescript, skillIds.springBoot],
  includeInCv: true,
}

describe('Student Project data', () => {
  it('strictly validates nullable responses, normalized skills, and page metadata', () => {
    expect(studentProjectSchema.parse(getStudentProjectsFixture()[0])).toBeTruthy()
    expect(() =>
      studentProjectSchema.parse({ ...getStudentProjectsFixture()[0], unexpected: true }),
    ).toThrow()
    expect(() =>
      studentProjectSchema.parse({
        ...getStudentProjectsFixture()[0],
        skills: [
          getStudentProjectsFixture()[0]!.skills[0],
          getStudentProjectsFixture()[0]!.skills[0],
        ],
      }),
    ).toThrow('Project skills must have unique canonical identities.')
    expect(() =>
      pagedStudentProjectsSchema.parse({
        items: [],
        page: { page: 0, size: 0, totalElements: 0, totalPages: 0, sort: 'title,asc' },
      }),
    ).toThrow()
  })

  it('rejects unsafe URLs, duplicate taxonomy identities, and reversed dates', () => {
    expect(
      studentProjectFormSchema.safeParse({ ...projectForm, repositoryUrl: 'javascript:alert(1)' })
        .success,
    ).toBe(false)
    expect(
      studentProjectFormSchema.safeParse({
        ...projectForm,
        skillIds: [skillIds.react, skillIds.react],
      }).success,
    ).toBe(false)
    const result = studentProjectFormSchema.safeParse({
      ...projectForm,
      startDate: '2026-05-16',
      endDate: '2026-05-15',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toEqual(expect.objectContaining({ path: ['endDate'] }))
  })

  it('normalizes create values and maps only changed PATCH fields', () => {
    const created = mapStudentProjectCreateRequest(projectForm)
    expect(created).toEqual({
      title: 'Portfolio API',
      description: 'Contract-driven portfolio project.',
      repositoryUrl: 'https://github.com/example/portfolio-api',
      demoUrl: null,
      startDate: '2026-01-10',
      endDate: '2026-05-15',
      skillIds: [skillIds.typescript, skillIds.springBoot],
      includeInCv: true,
    })

    expect(
      mapStudentProjectUpdateRequest(
        { ...projectForm, description: '', skillIds: [], includeInCv: false },
        projectForm,
      ),
    ).toEqual({ description: null, skillIds: [], includeInCv: false })
    expect(() => mapStudentProjectUpdateRequest(projectForm, projectForm)).toThrow(
      'Change at least one project field.',
    )
  })

  it('supports paged search/detail and returns normalized skill mappings on create', async () => {
    const page = await studentProjectsApi.list({
      page: 0,
      size: 10,
      sort: 'title,asc',
      search: 'React',
    })
    expect(page.items).toHaveLength(1)
    expect(page.page).toEqual(expect.objectContaining({ totalElements: 1, sort: 'title,asc' }))

    const detail = await studentProjectsApi.get(page.items[0]!.projectId)
    expect(mapStudentProjectToForm(detail).skillIds).toEqual([skillIds.react, skillIds.typescript])

    const created = await studentProjectsApi.create(mapStudentProjectCreateRequest(projectForm))
    expect(created.skills).toEqual([
      expect.objectContaining({ skillId: skillIds.typescript, name: 'TypeScript' }),
      expect.objectContaining({ skillId: skillIds.springBoot, name: 'Spring Boot' }),
    ])
  })

  it('sends exact partial update bodies and quoted If-Match headers, then accepts 204 delete', async () => {
    const current = getStudentProjectsFixture()[0]!
    const requests: Array<{ method: string; body?: unknown; ifMatch: string | null }> = []
    server.use(
      http.patch('/api/v1/me/projects/:projectId', async ({ request }) => {
        requests.push({
          method: request.method,
          body: await request.json(),
          ifMatch: request.headers.get('If-Match'),
        })
        return HttpResponse.json({
          ...current,
          description: null,
          skills: [],
          version: current.version + 1,
        })
      }),
      http.delete('/api/v1/me/projects/:projectId', ({ request }) => {
        requests.push({ method: request.method, ifMatch: request.headers.get('If-Match') })
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const updated = await studentProjectsApi.update(
      current.projectId,
      { description: null, skillIds: [] },
      current.version,
    )
    await expect(
      studentProjectsApi.delete(updated.projectId, updated.version),
    ).resolves.toBeUndefined()

    expect(requests).toEqual([
      {
        method: 'PATCH',
        body: { description: null, skillIds: [] },
        ifMatch: `"${current.version}"`,
      },
      { method: 'DELETE', ifMatch: `"${current.version + 1}"` },
    ])
  })

  it('surfaces 404, 412, 422, and 428 project failures', async () => {
    await expect(studentProjectsApi.get('aaaaaaaa-0000-4000-8000-000000000000')).rejects.toEqual(
      expect.objectContaining({ status: 404 }),
    )

    const current = getStudentProjectsFixture()[0]!
    await expect(
      studentProjectsApi.update(
        current.projectId,
        { description: 'Stale change' },
        current.version + 1,
      ),
    ).rejects.toEqual(expect.objectContaining({ status: 412 }))
    await expect(
      studentProjectsApi.create({
        ...mapStudentProjectCreateRequest(projectForm),
        skillIds: ['aaaaaaaa-0000-4000-8000-000000000000'],
      }),
    ).rejects.toEqual(expect.objectContaining({ status: 422 }))

    server.use(
      http.patch('/api/v1/me/projects/:projectId', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Precondition required',
            status: 428,
            code: 'PRECONDITION_REQUIRED',
            message: 'If-Match is required.',
            correlationId: 'test-project-428',
          },
          { status: 428 },
        ),
      ),
    )
    await expect(
      studentProjectsApi.update(current.projectId, { title: 'Changed' }, current.version),
    ).rejects.toEqual(expect.objectContaining({ status: 428 }))
  })

  it('invalidates project data after a successful mutation', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidation = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCreateProject(), { wrapper })

    await result.current.mutateAsync(mapStudentProjectCreateRequest(projectForm))
    expect(invalidation).toHaveBeenCalledWith({ queryKey: studentProjectKeys.all })
    queryClient.clear()
  })
})
