import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../../../mocks/server'
import { categoryIds, clusterIds, skillIds } from '../../../mocks/fixtures/skills.fixture'
import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import {
  deduplicateCanonicalSkills,
  indexSkillTaxonomy,
  individualSkillSchema,
  pagedIndividualSkillsSchema,
  skillTaxonomyApi,
  skillTaxonomyKeys,
} from '../../../shared/skill-taxonomy'
import { studentSkillsApi } from '../api/studentSkillsApi'
import { useCreateDeclaredSkill } from '../hooks/useDeclaredSkillMutations'
import { studentSkillKeys } from '../hooks/studentSkillKeys'
import { studentDashboardKeys } from '../../student-dashboard/hooks/studentDashboardKeys'

describe('Student Skills taxonomy data', () => {
  it('strictly validates taxonomy identities and page metadata', () => {
    expect(() => individualSkillSchema.parse({ skillId: 'not-a-uuid', name: 'React' })).toThrow()
    expect(() =>
      pagedIndividualSkillsSchema.parse({
        items: [],
        page: { page: 0, size: 20, totalElements: 0, totalPages: 0, sort: 'name,asc' },
        unexpected: true,
      }),
    ).toThrow()
  })

  it('deduplicates cross-mapped skills by canonical skillId', () => {
    expect(
      deduplicateCanonicalSkills([
        { skillId: skillIds.typescript, name: 'TypeScript' },
        { skillId: skillIds.typescript, name: 'TypeScript' },
        { skillId: skillIds.react, name: 'React' },
      ]),
    ).toEqual([
      { skillId: skillIds.typescript, name: 'TypeScript' },
      { skillId: skillIds.react, name: 'React' },
    ])
  })

  it('indexes every canonical taxonomy path without duplicating skill identity', async () => {
    const taxonomy = await skillTaxonomyApi.getTree()
    const index = indexSkillTaxonomy(taxonomy)

    expect(index.skillsById.get(skillIds.python)?.name).toBe('Python')
    expect(index.pathsBySkillId.get(skillIds.python)).toEqual([
      expect.objectContaining({
        clusterName: 'Software Engineering',
        categoryName: 'Backend Development',
      }),
      expect.objectContaining({ clusterName: 'Data and AI', categoryName: 'Data Science' }),
    ])
  })

  it('maps encoded taxonomy filters to the paged API and keeps cross-mapped identities stable', async () => {
    const frontend = await skillTaxonomyApi.listSkills({
      page: 0,
      size: 10,
      sort: 'name,asc',
      search: 'Type',
      clusterId: clusterIds.software,
      categoryId: categoryIds.frontend,
    })
    const backend = await skillTaxonomyApi.listSkills({
      page: 0,
      size: 10,
      sort: 'name,asc',
      search: 'Type',
      clusterId: clusterIds.software,
      categoryId: categoryIds.backend,
    })

    expect(frontend.items).toEqual([
      { skillId: skillIds.typescript, name: 'TypeScript', description: 'Typed JavaScript.' },
    ])
    expect(backend.items[0]?.skillId).toBe(frontend.items[0]?.skillId)
    expect(frontend.page).toEqual(expect.objectContaining({ totalElements: 1, sort: 'name,asc' }))
  })

  it('rejects invalid server responses instead of exposing untyped data', async () => {
    server.use(
      http.get('/api/v1/skill-taxonomy/skills', () =>
        HttpResponse.json({
          items: [{ skillId: 'invalid', name: 'Unsafe' }],
          page: { page: 0, size: 20, totalElements: 1, totalPages: 1, sort: 'name,asc' },
        }),
      ),
    )

    await expect(
      skillTaxonomyApi.listSkills({ page: 0, size: 20, sort: 'name,asc' }),
    ).rejects.toThrow()
  })

  it('keeps every server-side taxonomy query parameter in its query key', () => {
    const base = { page: 0, size: 20, sort: 'name,asc' }
    expect(skillTaxonomyKeys.skills({ ...base, search: 'React' })).not.toEqual(
      skillTaxonomyKeys.skills({ ...base, search: 'Java' }),
    )
    expect(skillTaxonomyKeys.skills({ ...base, clusterId: clusterIds.software })).not.toEqual(
      skillTaxonomyKeys.skills({ ...base, categoryId: categoryIds.frontend }),
    )
  })

  it('sends exact create and competency-only update bodies with quoted If-Match', async () => {
    const requests: Array<{ method: string; body: unknown; ifMatch: string | null }> = []
    server.use(
      http.post('/api/v1/me/declared-skills', async ({ request }) => {
        requests.push({ method: request.method, body: await request.json(), ifMatch: null })
        return HttpResponse.json(
          {
            declaredSkillId: '88888888-8888-4888-8888-000000000001',
            skillId: skillIds.typescript,
            skillName: 'TypeScript',
            competencyLevel: 'BEGINNER',
            version: 0,
            createdAt: '2026-07-16T08:30:00Z',
            updatedAt: '2026-07-16T08:30:00Z',
          },
          { status: 201 },
        )
      }),
      http.patch('/api/v1/me/declared-skills/:id', async ({ request }) => {
        requests.push({
          method: request.method,
          body: await request.json(),
          ifMatch: request.headers.get('If-Match'),
        })
        return HttpResponse.json({
          declaredSkillId: '88888888-8888-4888-8888-000000000001',
          skillId: skillIds.typescript,
          skillName: 'TypeScript',
          competencyLevel: 'ADVANCED',
          version: 1,
          createdAt: '2026-07-16T08:30:00Z',
          updatedAt: '2026-07-16T09:30:00Z',
        })
      }),
    )

    const created = await studentSkillsApi.createDeclaredSkill({
      skillId: skillIds.typescript,
      competencyLevel: 'BEGINNER',
    })
    await studentSkillsApi.updateDeclaredSkill(
      created.declaredSkillId,
      { competencyLevel: 'ADVANCED' },
      created.version,
    )

    expect(requests).toEqual([
      {
        method: 'POST',
        body: { skillId: skillIds.typescript, competencyLevel: 'BEGINNER' },
        ifMatch: null,
      },
      { method: 'PATCH', body: { competencyLevel: 'ADVANCED' }, ifMatch: '"0"' },
    ])
    expect(formatIfMatchVersion(0)).toBe('"0"')
  })

  it('enforces duplicate, stale, missing-precondition, and 204 delete behavior', async () => {
    await expect(
      studentSkillsApi.createDeclaredSkill({
        skillId: skillIds.react,
        competencyLevel: 'ADVANCED',
      }),
    ).rejects.toEqual(expect.objectContaining({ status: 409, code: 'DUPLICATE_DECLARED_SKILL' }))

    const current = (
      await studentSkillsApi.listDeclaredSkills({
        page: 0,
        size: 20,
        sort: 'skillName,asc',
      })
    ).items[0]!
    await expect(
      studentSkillsApi.updateDeclaredSkill(
        current.declaredSkillId,
        { competencyLevel: 'ADVANCED' },
        current.version + 1,
      ),
    ).rejects.toEqual(expect.objectContaining({ status: 412 }))

    server.use(
      http.patch('/api/v1/me/declared-skills/:id', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Precondition required',
            status: 428,
            code: 'PRECONDITION_REQUIRED',
            message: 'If-Match is required.',
            correlationId: 'test-428',
          },
          { status: 428 },
        ),
      ),
    )
    await expect(
      studentSkillsApi.updateDeclaredSkill(
        current.declaredSkillId,
        { competencyLevel: 'ADVANCED' },
        current.version,
      ),
    ).rejects.toEqual(expect.objectContaining({ status: 428 }))

    server.resetHandlers()
    await expect(
      studentSkillsApi.deleteDeclaredSkill(current.declaredSkillId, current.version),
    ).resolves.toBeUndefined()
  })

  it('invalidates declared-skill and dashboard metrics after a successful mutation', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidation = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCreateDeclaredSkill(), { wrapper })

    await result.current.mutateAsync({
      skillId: skillIds.typescript,
      competencyLevel: 'ADVANCED',
    })
    expect(invalidation).toHaveBeenCalledWith({
      queryKey: studentSkillKeys.declared(),
      refetchType: 'active',
    })
    expect(invalidation).toHaveBeenCalledWith({
      queryKey: studentDashboardKeys.metrics(),
      refetchType: 'active',
    })
    queryClient.clear()
  })
})
