import type { StudentProject } from '../../features/student-projects/types/studentProjectTypes'
import { individualSkillsFixture, skillIds } from './skills.fixture'

const skillById = (skillId: string) =>
  individualSkillsFixture.find((skill) => skill.skillId === skillId)!

const initialStudentProjects: StudentProject[] = [
  {
    projectId: '660e8400-e29b-41d4-a716-446655440001',
    title: 'Accessible Internship Portal',
    description: 'A responsive portfolio project for structured internship application data.',
    repositoryUrl: 'https://github.com/example/accessible-internship-portal',
    demoUrl: null,
    startDate: '2026-01-10',
    endDate: '2026-05-15',
    skills: [skillById(skillIds.react), skillById(skillIds.typescript)],
    includeInCv: true,
    version: 2,
    createdAt: '2026-07-16T08:00:00Z',
    updatedAt: '2026-07-16T09:45:00Z',
  },
  {
    projectId: '660e8400-e29b-41d4-a716-446655440002',
    title: 'Academic Record Visualizer',
    description: null,
    repositoryUrl: null,
    demoUrl: 'https://example.test/academic-record-visualizer',
    startDate: '2025-09-01',
    endDate: null,
    skills: [skillById(skillIds.java), skillById(skillIds.springBoot)],
    includeInCv: false,
    version: 0,
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-15T08:00:00Z',
  },
]

let studentProjects = structuredClone(initialStudentProjects)
let projectSequence = 3

export function getStudentProjectsFixture() {
  return studentProjects
}

export function setStudentProjectsFixture(projects: StudentProject[]) {
  studentProjects = projects
}

export function nextStudentProjectId() {
  return `660e8400-e29b-41d4-a716-${String(projectSequence++).padStart(12, '0')}`
}

export function resetStudentProjectsMock() {
  studentProjects = structuredClone(initialStudentProjects)
  projectSequence = 3
}
