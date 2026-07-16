export type StudentDashboardMetrics = {
  projectCount: number
  shortlistedInternshipCount: number
  declaredSkillCount: number
  officialCumulativeGpa: number | null
  lastUpdatedAt: string
}

export type StudentMetricCardProps = {
  label: string
  value: string
  description: string
  icon: string
}
