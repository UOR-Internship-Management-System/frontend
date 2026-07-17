import { cvPreviewRequestSchema } from '../schemas/cvBuilderSchemas'
import type {
  CvFreshness,
  CvFreshnessView,
  CvPreviewRequest,
  CvSection,
  CvSourceArea,
  CvVersion,
  CvVersionView,
} from '../types/cvBuilderTypes'

// Identity and contact information is always generated and is intentionally not a configurable section.
export const defaultCvSectionOrder: readonly CvSection[] = [
  'PROFESSIONAL_SUMMARY',
  'SKILLS',
  'EXPERIENCE',
  'PROJECTS',
  'CERTIFICATES',
  'AWARDS',
  'ACTIVITIES',
  'ACADEMIC_SUMMARY',
]

export const cvSectionLabels: Record<CvSection, string> = {
  PROFESSIONAL_SUMMARY: 'Professional summary',
  SKILLS: 'Skills',
  EXPERIENCE: 'Experience',
  PROJECTS: 'Projects',
  CERTIFICATES: 'Certificates',
  AWARDS: 'Awards',
  ACTIVITIES: 'Activities',
  ACADEMIC_SUMMARY: 'Academic summary',
}

export const cvSourceAreaLabels: Record<CvSourceArea, string> = {
  PROFILE: 'Profile and CV details',
  DECLARED_SKILLS: 'Declared skills',
  PROJECTS: 'Projects',
  ACADEMIC_RECORDS: 'Academic records',
}

export function mapCvPreviewRequest(
  sectionOrder: readonly CvSection[],
  selectedProjectIds: readonly string[],
): CvPreviewRequest {
  return cvPreviewRequestSchema.parse({
    sectionOrder: [...sectionOrder],
    includedProjectIds: sectionOrder.includes('PROJECTS') ? [...selectedProjectIds] : [],
  })
}

export function mapCvFreshness(value: CvFreshness): CvFreshnessView {
  const presentation = {
    NOT_SAVED: { title: 'No saved CV yet', tone: 'neutral' as const },
    CURRENT: { title: 'Your saved CV is current', tone: 'success' as const },
    OUTDATED: { title: 'Your saved CV needs an update', tone: 'warning' as const },
  }[value.status]

  return {
    ...value,
    ...presentation,
    changedAreaLabels: value.changedAreas.map((area) => cvSourceAreaLabels[area]),
    latestSavedAtLabel: value.latestSavedAt ? formatDateTime(value.latestSavedAt) : null,
  }
}

export function mapCvVersion(value: CvVersion): CvVersionView {
  return {
    ...value,
    savedAtLabel: formatDateTime(value.savedAt),
    generatedAtLabel: formatDateTime(value.generatedAt),
    fileSizeLabel: formatFileSize(value.pdfFile.fileSizeBytes),
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
