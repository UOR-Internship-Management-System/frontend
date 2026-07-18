import { cvPreviewRequestSchema } from '../schemas/cvBuilderSchemas'
import type {
  Cv,
  CvFreshness,
  CvFreshnessView,
  CvPreviewRequest,
  CvSourceArea,
  CvView,
} from '../types/cvBuilderTypes'

export type CvRecordSelections = CvPreviewRequest

export const emptyCvRecordSelections: CvRecordSelections = {
  includedExperienceIds: [],
  includedProjectIds: [],
  includedCertificateIds: [],
  includedAwardIds: [],
  includedActivityIds: [],
}

export const cvSelectionKeys = Object.freeze(
  Object.keys(emptyCvRecordSelections) as (keyof CvRecordSelections)[],
)

export const cvSourceAreaLabels: Record<CvSourceArea, string> = {
  PROFILE: 'Profile and CV details',
  DECLARED_SKILLS: 'Declared skills',
  PROJECTS: 'Projects',
  ACADEMIC_RECORDS: 'Academic records',
}

export function mapCvPreviewRequest(selections: CvRecordSelections): CvPreviewRequest {
  return cvPreviewRequestSchema.parse(
    Object.fromEntries(cvSelectionKeys.map((key) => [key, [...new Set(selections[key])].sort()])),
  )
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
    savedAtLabel: value.savedAt ? formatDateTime(value.savedAt) : null,
  }
}

export function mapCv(value: Cv): CvView {
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
