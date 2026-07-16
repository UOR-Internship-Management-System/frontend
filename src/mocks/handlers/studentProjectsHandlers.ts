import { http, HttpResponse } from 'msw'
import {
  studentProjectCreateSchema,
  studentProjectSchema,
  studentProjectUpdateSchema,
} from '../../features/student-projects/schemas/studentProjectSchemas'
import type { StudentProject } from '../../features/student-projects/types/studentProjectTypes'
import { individualSkillsFixture } from '../fixtures/skills.fixture'
import {
  getStudentProjectsFixture,
  nextStudentProjectId,
  setStudentProjectsFixture,
} from '../fixtures/studentProjects.fixture'

const apiBase = '/api/v1'
const inaccessibleProjectId = '99999999-9999-4999-8999-999999999999'

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
    correlationId: `mock-project-${status}`,
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
    return HttpResponse.json(problem(412, 'STALE_VERSION', 'The project changed.'), {
      status: 412,
    })
  }
  return null
}

function selectedSkills(skillIds: string[]) {
  return skillIds.map((skillId) =>
    individualSkillsFixture.find((skill) => skill.skillId === skillId),
  )
}

function validateSkillIds(skillIds: string[]) {
  const skills = selectedSkills(skillIds)
  return skills.every(Boolean) ? (skills as StudentProject['skills']) : null
}

function projectSearchText(project: StudentProject) {
  return [project.title, project.description ?? '', ...project.skills.map((skill) => skill.name)]
    .join(' ')
    .toLowerCase()
}

function sortedProjects(request: Request) {
  const url = new URL(request.url)
  const page = Math.max(0, Number(url.searchParams.get('page') ?? 0))
  const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') ?? 20)))
  const sort = url.searchParams.get('sort') ?? 'updatedAt,desc'
  const [field, direction = 'asc'] = sort.split(',')
  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
  const allowedField = field === 'title' || field === 'startDate' ? field : 'updatedAt'
  const multiplier = direction === 'desc' ? -1 : 1
  const values = [...getStudentProjectsFixture()]
    .filter((project) => !search || projectSearchText(project).includes(search))
    .sort((left, right) => {
      const leftValue = left[allowedField] ?? ''
      const rightValue = right[allowedField] ?? ''
      return leftValue.localeCompare(rightValue) * multiplier
    })

  return {
    items: values.slice(page * size, page * size + size),
    page: {
      page,
      size,
      totalElements: values.length,
      totalPages: Math.ceil(values.length / size),
      sort,
    },
  }
}

function findOwnedProject(projectId: string) {
  if (projectId === inaccessibleProjectId) {
    return HttpResponse.json(
      problem(403, 'FORBIDDEN', 'The project is not owned by this Student.'),
      {
        status: 403,
      },
    )
  }
  const project = getStudentProjectsFixture().find((item) => item.projectId === projectId)
  if (!project) {
    return HttpResponse.json(problem(404, 'NOT_FOUND', 'The project no longer exists.'), {
      status: 404,
    })
  }
  return project
}

function validationFailure() {
  return HttpResponse.json(
    problem(422, 'INVALID_PROJECT', 'Review the project fields and date range.', [
      {
        field: 'endDate',
        code: 'INVALID_DATE_RANGE',
        message: 'End date cannot be before start date.',
      },
    ]),
    { status: 422 },
  )
}

export const studentProjectsHandlers = [
  http.get(`${apiBase}/me/projects`, ({ request }) => HttpResponse.json(sortedProjects(request))),
  http.post(`${apiBase}/me/projects`, async ({ request }) => {
    const parsed = studentProjectCreateSchema.safeParse(await request.json())
    if (!parsed.success) return validationFailure()
    const skills = validateSkillIds(parsed.data.skillIds)
    if (!skills) return validationFailure()
    const now = new Date().toISOString()
    const created: StudentProject = {
      projectId: nextStudentProjectId(),
      title: parsed.data.title,
      description: parsed.data.description,
      repositoryUrl: parsed.data.repositoryUrl,
      demoUrl: parsed.data.demoUrl,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      skills,
      includeInCv: parsed.data.includeInCv,
      version: 0,
      createdAt: now,
      updatedAt: now,
    }
    setStudentProjectsFixture([...getStudentProjectsFixture(), created])
    return HttpResponse.json(created, { status: 201 })
  }),
  http.get(`${apiBase}/me/projects/:projectId`, ({ params }) => {
    const project = findOwnedProject(String(params.projectId))
    return project instanceof HttpResponse ? project : HttpResponse.json(project)
  }),
  http.patch(`${apiBase}/me/projects/:projectId`, async ({ params, request }) => {
    const found = findOwnedProject(String(params.projectId))
    if (found instanceof HttpResponse) return found
    const failure = versionFailure(request, found.version)
    if (failure) return failure
    const parsed = studentProjectUpdateSchema.safeParse(await request.json())
    if (!parsed.success) return validationFailure()

    const { skillIds, ...fields } = parsed.data
    const skills = skillIds === undefined ? found.skills : validateSkillIds(skillIds)
    if (!skills) return validationFailure()
    const candidate = studentProjectSchema.safeParse({
      ...found,
      ...fields,
      skills,
      version: found.version + 1,
      updatedAt: new Date().toISOString(),
    })
    if (!candidate.success) return validationFailure()

    setStudentProjectsFixture(
      getStudentProjectsFixture().map((project) =>
        project.projectId === candidate.data.projectId ? candidate.data : project,
      ),
    )
    return HttpResponse.json(candidate.data)
  }),
  http.delete(`${apiBase}/me/projects/:projectId`, ({ params, request }) => {
    const found = findOwnedProject(String(params.projectId))
    if (found instanceof HttpResponse) return found
    const failure = versionFailure(request, found.version)
    if (failure) return failure
    setStudentProjectsFixture(
      getStudentProjectsFixture().filter((project) => project.projectId !== found.projectId),
    )
    return new HttpResponse(null, { status: 204 })
  }),
]
