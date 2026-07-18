import { routePaths } from '../../config/routePaths'

export type StudentNavigationItem = {
  label: string
  route: string
  icon: string
}

export const studentNavigation: readonly StudentNavigationItem[] = [
  {
    label: 'Dashboard',
    route: routePaths.studentDashboard,
    icon: 'dashboard',
  },
  {
    label: 'Profile',
    route: routePaths.studentProfile,
    icon: 'person',
  },
  {
    label: 'Skills',
    route: routePaths.studentSkills,
    icon: 'psychology',
  },
  {
    label: 'Projects',
    route: routePaths.studentProjects,
    icon: 'folder_copy',
  },
  {
    label: 'CV Builder',
    route: routePaths.studentCvBuilder,
    icon: 'description',
  },
  {
    label: 'Academic Records',
    route: routePaths.studentAcademicRecords,
    icon: 'school',
  },
]
