import {
  studentProjectCreateSchema,
  studentProjectUpdateSchema,
} from '../schemas/studentProjectSchemas'
import type {
  StudentProject,
  StudentProjectCreateRequest,
  StudentProjectFormValues,
  StudentProjectUpdateRequest,
} from '../types/studentProjectTypes'

const requestFields = [
  'title',
  'description',
  'repositoryUrl',
  'demoUrl',
  'startDate',
  'endDate',
  'skillIds',
  'includeInCv',
] as const

function nullable(value: string) {
  const normalized = value.trim()
  return normalized || null
}

export function mapStudentProjectToForm(project: StudentProject): StudentProjectFormValues {
  return {
    title: project.title,
    description: project.description ?? '',
    repositoryUrl: project.repositoryUrl ?? '',
    demoUrl: project.demoUrl ?? '',
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
    skillIds: project.skills.map((skill) => skill.skillId),
    includeInCv: project.includeInCv,
  }
}

export function mapStudentProjectCreateRequest(
  values: StudentProjectFormValues,
): StudentProjectCreateRequest {
  return studentProjectCreateSchema.parse({
    title: values.title.trim(),
    description: nullable(values.description),
    repositoryUrl: nullable(values.repositoryUrl),
    demoUrl: nullable(values.demoUrl),
    startDate: nullable(values.startDate),
    endDate: nullable(values.endDate),
    skillIds: [...values.skillIds],
    includeInCv: values.includeInCv,
  })
}

export function mapStudentProjectUpdateRequest(
  values: StudentProjectFormValues,
  baseline: StudentProjectFormValues,
): StudentProjectUpdateRequest {
  const current = mapStudentProjectCreateRequest(values)
  const previous = mapStudentProjectCreateRequest(baseline)
  const request: StudentProjectUpdateRequest = {}

  for (const field of requestFields) {
    const changed =
      field === 'skillIds'
        ? current.skillIds.length !== previous.skillIds.length ||
          current.skillIds.some((value, index) => value !== previous.skillIds[index])
        : current[field] !== previous[field]
    if (changed) {
      Object.assign(request, { [field]: current[field] })
    }
  }

  return studentProjectUpdateSchema.parse(request)
}
