import type { IndividualSkill } from '../../student-skills/types/studentSkillTypes'
import type { PagedQuery, PagedResponse } from '../../../shared/types/pagination'

export type StudentProject = {
  projectId: string
  title: string
  description: string | null
  repositoryUrl: string | null
  demoUrl: string | null
  startDate: string | null
  endDate: string | null
  skills: IndividualSkill[]
  includeInCv: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export type StudentProjectFormValues = {
  title: string
  description: string
  repositoryUrl: string
  demoUrl: string
  startDate: string
  endDate: string
  skillIds: string[]
  includeInCv: boolean
}

export type StudentProjectCreateRequest = {
  title: string
  description: string | null
  repositoryUrl: string | null
  demoUrl: string | null
  startDate: string | null
  endDate: string | null
  skillIds: string[]
  includeInCv: boolean
}

export type StudentProjectUpdateRequest = Partial<StudentProjectCreateRequest>
export type StudentProjectQuery = PagedQuery
export type PagedStudentProjects = PagedResponse<StudentProject>

export type UpdateStudentProjectInput = {
  projectId: string
  request: StudentProjectUpdateRequest
  version: number
}

export type DeleteStudentProjectInput = { projectId: string; version: number }
