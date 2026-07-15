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
]
