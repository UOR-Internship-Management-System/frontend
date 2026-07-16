import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../mocks/server'
import { categoryIds, clusterIds, skillIds } from '../../../mocks/fixtures/skills.fixture'
import { deduplicateCanonicalSkills } from '../mappers/skillMapper'
import { individualSkillSchema, pagedIndividualSkillsSchema } from '../schemas/studentSkillSchemas'
import { studentSkillsApi } from '../api/studentSkillsApi'

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

  it('maps encoded taxonomy filters to the paged API and keeps cross-mapped identities stable', async () => {
    const frontend = await studentSkillsApi.listSkills({
      page: 0,
      size: 10,
      sort: 'name,asc',
      search: 'Type',
      clusterId: clusterIds.software,
      categoryId: categoryIds.frontend,
    })
    const backend = await studentSkillsApi.listSkills({
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
      studentSkillsApi.listSkills({ page: 0, size: 20, sort: 'name,asc' }),
    ).rejects.toThrow()
  })
})
