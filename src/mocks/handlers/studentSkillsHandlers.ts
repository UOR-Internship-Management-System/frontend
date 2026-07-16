import { http, HttpResponse } from 'msw'
import {
  declaredSkillCreateSchema,
  declaredSkillUpdateSchema,
} from '../../features/student-skills/schemas/studentSkillSchemas'
import type {
  IndividualSkill,
  SkillCategory,
} from '../../features/student-skills/types/studentSkillTypes'
import {
  categoryClusterIds,
  categorySkillIds,
  getDeclaredSkillsFixture,
  individualSkillsFixture,
  nextDeclaredSkillId,
  setDeclaredSkillsFixture,
  skillCategoriesFixture,
  skillClustersFixture,
} from '../fixtures/skills.fixture'

const apiBase = '/api/v1'
const inaccessibleDeclaredSkillId = '99999999-9999-4999-8999-999999999999'

function problem(
  status: number,
  code: string,
  message: string,
  fieldErrors?: Array<{ field: string; code: string; message: string }>,
) {
  return {
    type: `https://uor-cv-system/errors/${code.toLowerCase().replaceAll('_', '-')}`,
    title:
      status === 422
        ? 'Validation failed'
        : status === 412
          ? 'Precondition failed'
          : status === 428
            ? 'Precondition required'
            : 'Request failed',
    status,
    code,
    message,
    correlationId: `mock-skill-${status}`,
    ...(fieldErrors ? { fieldErrors } : {}),
  }
}

function versionFailure(request: Request, version: number) {
  const ifMatch = request.headers.get('If-Match')
  if (!ifMatch) {
    return HttpResponse.json(
      problem(428, 'PRECONDITION_REQUIRED', 'A quoted If-Match version is required.'),
      { status: 428 },
    )
  }
  if (ifMatch !== `"${version}"`) {
    return HttpResponse.json(problem(412, 'STALE_VERSION', 'The declaration changed.'), {
      status: 412,
    })
  }
  return null
}

function page<T>(request: Request, values: T[], defaultSort: string, label: (value: T) => string) {
  const url = new URL(request.url)
  const pageNumber = Math.max(0, Number(url.searchParams.get('page') ?? 0))
  const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') ?? 20)))
  const sort = url.searchParams.get('sort') ?? defaultSort
  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
  const direction = sort.endsWith(',desc') ? -1 : 1
  const filtered = values
    .filter((value) => !search || label(value).toLowerCase().includes(search))
    .sort((left, right) => label(left).localeCompare(label(right)) * direction)

  return {
    items: filtered.slice(pageNumber * size, pageNumber * size + size),
    page: {
      page: pageNumber,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      sort,
    },
  }
}

function categoriesForCluster(clusterId: string | null): SkillCategory[] {
  return skillCategoriesFixture.filter(
    (category) => !clusterId || categoryClusterIds[category.categoryId] === clusterId,
  )
}

function skillsForFilters(clusterId: string | null, categoryId: string | null): IndividualSkill[] {
  const categories = categoriesForCluster(clusterId).filter(
    (category) => !categoryId || category.categoryId === categoryId,
  )
  const allowedIds = new Set(
    categories.flatMap((category) => categorySkillIds[category.categoryId] ?? []),
  )
  return individualSkillsFixture.filter((skill) => allowedIds.has(skill.skillId))
}

function taxonomyTree() {
  return {
    clusters: skillClustersFixture.map((cluster) => ({
      ...cluster,
      categories: categoriesForCluster(cluster.clusterId).map((category) => ({
        ...category,
        skills: individualSkillsFixture.filter((skill) =>
          categorySkillIds[category.categoryId]?.includes(skill.skillId),
        ),
      })),
    })),
  }
}

export const studentSkillsHandlers = [
  http.get(`${apiBase}/skill-taxonomy`, () => HttpResponse.json(taxonomyTree())),
  http.get(`${apiBase}/skill-taxonomy/clusters`, ({ request }) =>
    HttpResponse.json(page(request, [...skillClustersFixture], 'name,asc', (item) => item.name)),
  ),
  http.get(`${apiBase}/skill-taxonomy/categories`, ({ request }) => {
    const url = new URL(request.url)
    return HttpResponse.json(
      page(
        request,
        categoriesForCluster(url.searchParams.get('clusterId')),
        'name,asc',
        (item) => item.name,
      ),
    )
  }),
  http.get(`${apiBase}/skill-taxonomy/skills`, ({ request }) => {
    const url = new URL(request.url)
    return HttpResponse.json(
      page(
        request,
        skillsForFilters(url.searchParams.get('clusterId'), url.searchParams.get('categoryId')),
        'name,asc',
        (item) => item.name,
      ),
    )
  }),
  http.get(`${apiBase}/me/declared-skills`, ({ request }) =>
    HttpResponse.json(
      page(request, [...getDeclaredSkillsFixture()], 'skillName,asc', (item) => item.skillName),
    ),
  ),
  http.post(`${apiBase}/me/declared-skills`, async ({ request }) => {
    const parsed = declaredSkillCreateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json(
        problem(422, 'VALIDATION_FAILED', 'Select a valid taxonomy skill and competency level.'),
        { status: 422 },
      )
    }

    const skill = individualSkillsFixture.find((item) => item.skillId === parsed.data.skillId)
    if (!skill) {
      return HttpResponse.json(
        problem(422, 'INVALID_TAXONOMY_SKILL', 'The selected taxonomy skill is unavailable.', [
          {
            field: 'skillId',
            code: 'INVALID_TAXONOMY_SKILL',
            message: 'Select an available skill.',
          },
        ]),
        { status: 422 },
      )
    }
    if (getDeclaredSkillsFixture().some((item) => item.skillId === skill.skillId)) {
      return HttpResponse.json(
        problem(409, 'DUPLICATE_DECLARED_SKILL', 'This skill is already declared.'),
        { status: 409 },
      )
    }

    const now = new Date().toISOString()
    const created = {
      declaredSkillId: nextDeclaredSkillId(),
      skillId: skill.skillId,
      skillName: skill.name,
      competencyLevel: parsed.data.competencyLevel,
      version: 0,
      createdAt: now,
      updatedAt: now,
    }
    setDeclaredSkillsFixture([...getDeclaredSkillsFixture(), created])
    return HttpResponse.json(created, { status: 201 })
  }),
  http.patch(`${apiBase}/me/declared-skills/:declaredSkillId`, async ({ params, request }) => {
    if (params.declaredSkillId === inaccessibleDeclaredSkillId) {
      return HttpResponse.json(
        problem(403, 'FORBIDDEN', 'The declaration is not owned by this Student.'),
        { status: 403 },
      )
    }
    const index = getDeclaredSkillsFixture().findIndex(
      (item) => item.declaredSkillId === params.declaredSkillId,
    )
    if (index < 0) {
      return HttpResponse.json(problem(404, 'NOT_FOUND', 'The declaration no longer exists.'), {
        status: 404,
      })
    }
    const previous = getDeclaredSkillsFixture()[index]!
    const failure = versionFailure(request, previous.version)
    if (failure) return failure
    const parsed = declaredSkillUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json(
        problem(422, 'VALIDATION_FAILED', 'Select a valid competency level.', [
          { field: 'competencyLevel', code: 'INVALID_LEVEL', message: 'Select a valid level.' },
        ]),
        { status: 422 },
      )
    }
    const updated = {
      ...previous,
      competencyLevel: parsed.data.competencyLevel,
      version: previous.version + 1,
      updatedAt: new Date().toISOString(),
    }
    const items = [...getDeclaredSkillsFixture()]
    items[index] = updated
    setDeclaredSkillsFixture(items)
    return HttpResponse.json(updated)
  }),
  http.delete(`${apiBase}/me/declared-skills/:declaredSkillId`, ({ params, request }) => {
    if (params.declaredSkillId === inaccessibleDeclaredSkillId) {
      return HttpResponse.json(
        problem(403, 'FORBIDDEN', 'The declaration is not owned by this Student.'),
        { status: 403 },
      )
    }
    const declaration = getDeclaredSkillsFixture().find(
      (item) => item.declaredSkillId === params.declaredSkillId,
    )
    if (!declaration) {
      return HttpResponse.json(problem(404, 'NOT_FOUND', 'The declaration no longer exists.'), {
        status: 404,
      })
    }
    const failure = versionFailure(request, declaration.version)
    if (failure) return failure
    setDeclaredSkillsFixture(
      getDeclaredSkillsFixture().filter(
        (item) => item.declaredSkillId !== declaration.declaredSkillId,
      ),
    )
    return new HttpResponse(null, { status: 204 })
  }),
]
