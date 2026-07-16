import { http, HttpResponse } from 'msw'
import type {
  IndividualSkill,
  SkillCategory,
} from '../../features/student-skills/types/studentSkillTypes'
import {
  categoryClusterIds,
  categorySkillIds,
  individualSkillsFixture,
  skillCategoriesFixture,
  skillClustersFixture,
} from '../fixtures/skills.fixture'

const apiBase = '/api/v1'

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
]
