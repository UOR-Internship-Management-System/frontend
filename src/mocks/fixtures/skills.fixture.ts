import type { DeclaredSkill } from '../../features/student-skills/types/studentSkillTypes'
import type { IndividualSkill, SkillCategory, SkillCluster } from '../../shared/skill-taxonomy'

export const skillIds = {
  javascript: '11111111-1111-4111-8111-111111111111',
  typescript: '22222222-2222-4222-8222-222222222222',
  react: '33333333-3333-4333-8333-333333333333',
  java: '44444444-4444-4444-8444-444444444444',
  springBoot: '55555555-5555-4555-8555-555555555555',
  python: '66666666-6666-4666-8666-666666666666',
} as const

export const clusterIds = {
  software: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  data: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
} as const

export const categoryIds = {
  frontend: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  backend: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  dataScience: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
} as const

export const individualSkillsFixture: IndividualSkill[] = [
  { skillId: skillIds.javascript, name: 'JavaScript', description: 'Web programming language.' },
  { skillId: skillIds.typescript, name: 'TypeScript', description: 'Typed JavaScript.' },
  { skillId: skillIds.react, name: 'React', description: 'Component-based UI library.' },
  { skillId: skillIds.java, name: 'Java', description: 'General-purpose programming language.' },
  { skillId: skillIds.springBoot, name: 'Spring Boot', description: 'Java application framework.' },
  {
    skillId: skillIds.python,
    name: 'Python',
    description: 'General-purpose programming language.',
  },
]

export const skillCategoriesFixture: SkillCategory[] = [
  {
    categoryId: categoryIds.frontend,
    name: 'Frontend Development',
    description: 'Browser and user-interface development.',
  },
  {
    categoryId: categoryIds.backend,
    name: 'Backend Development',
    description: 'Server-side application development.',
  },
  {
    categoryId: categoryIds.dataScience,
    name: 'Data Science',
    description: 'Data analysis and machine learning.',
  },
]

export const skillClustersFixture: SkillCluster[] = [
  { clusterId: clusterIds.software, name: 'Software Engineering', description: null },
  { clusterId: clusterIds.data, name: 'Data and AI', description: null },
]

export const categoryClusterIds: Record<string, string> = {
  [categoryIds.frontend]: clusterIds.software,
  [categoryIds.backend]: clusterIds.software,
  [categoryIds.dataScience]: clusterIds.data,
}

export const categorySkillIds: Record<string, string[]> = {
  [categoryIds.frontend]: [skillIds.javascript, skillIds.typescript, skillIds.react],
  [categoryIds.backend]: [
    skillIds.javascript,
    skillIds.typescript,
    skillIds.java,
    skillIds.springBoot,
    skillIds.python,
  ],
  [categoryIds.dataScience]: [skillIds.python],
}

const initialDeclaredSkills: DeclaredSkill[] = [
  {
    declaredSkillId: '77777777-7777-4777-8777-777777777777',
    skillId: skillIds.react,
    skillName: 'React',
    competencyLevel: 'INTERMEDIATE',
    version: 1,
    createdAt: '2026-07-16T08:30:00Z',
    updatedAt: '2026-07-16T08:30:00Z',
  },
]

let declaredSkills = initialDeclaredSkills.map((item) => ({ ...item }))
let declaredSkillSequence = 800

export function getDeclaredSkillsFixture() {
  return declaredSkills
}

export function setDeclaredSkillsFixture(items: DeclaredSkill[]) {
  declaredSkills = items
}

export function nextDeclaredSkillId() {
  return `88888888-8888-4888-8888-${String(declaredSkillSequence++).padStart(12, '0')}`
}

export function resetStudentSkillsMock() {
  declaredSkills = initialDeclaredSkills.map((item) => ({ ...item }))
  declaredSkillSequence = 800
}
