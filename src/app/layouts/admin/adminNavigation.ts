import { routePaths } from '../../config/routePaths'

export type AdminNavigationItem = {
  label: string
  route: string
  icon: string
}

export const adminNavigation: readonly AdminNavigationItem[] = [
  { label: 'Dashboard', route: routePaths.adminDashboard, icon: 'dashboard' },
  { label: 'Academic Ledger', route: routePaths.adminAcademicLedger, icon: 'table_view' },
  { label: 'Registered Students', route: routePaths.adminStudents, icon: 'groups' },
  { label: 'Internship Management', route: routePaths.adminInternships, icon: 'business_center' },
  {
    label: 'Candidate Filtering',
    route: routePaths.adminCandidateFiltering,
    icon: 'filter_alt',
  },
]
