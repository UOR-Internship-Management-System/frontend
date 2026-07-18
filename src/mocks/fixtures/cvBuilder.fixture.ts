import type { Cv, CvFreshness, CvPreview } from '../../features/cv-builder/types/cvBuilderTypes'
import {
  cvFreshnessSchema,
  cvPreviewSchema,
  cvSchema,
} from '../../features/cv-builder/schemas/cvBuilderSchemas'

export const cvFixtureIds = {
  preview: '70000000-0000-4000-8000-000000000001',
  cv: '50000000-0000-4000-8000-000000000004',
} as const

export type CvPreviewFailure = 'validation' | 'generation' | null
export type CvDownloadFailure = 'not-saved' | 'unavailable' | 'unauthorized' | null

const notSavedFreshness = cvFreshnessSchema.parse({
  status: 'NOT_SAVED',
  changedAreas: [],
  cvId: null,
  savedAt: null,
  evaluatedAt: '2026-07-21T08:00:00Z',
  message: 'No saved CV exists yet.',
})

export const currentFreshness = cvFreshnessSchema.parse({
  status: 'CURRENT',
  changedAreas: [],
  cvId: cvFixtureIds.cv,
  savedAt: '2026-07-21T08:02:00Z',
  evaluatedAt: '2026-07-21T08:03:00Z',
  message: 'The saved CV matches current source data.',
})

export const outdatedProfileFreshness = cvFreshnessSchema.parse({
  ...currentFreshness,
  status: 'OUTDATED',
  changedAreas: ['PROFILE'],
  message: 'Profile data changed after the CV was saved.',
})

export const outdatedSkillsProjectsFreshness = cvFreshnessSchema.parse({
  ...currentFreshness,
  status: 'OUTDATED',
  changedAreas: ['DECLARED_SKILLS', 'PROJECTS'],
  message: 'Declared skills or projects changed after the CV was saved.',
})

export const savedCv = cvSchema.parse({
  cvId: cvFixtureIds.cv,
  revision: 1,
  createdAt: '2026-07-21T08:02:00Z',
  generatedAt: '2026-07-21T08:01:30Z',
  savedAt: '2026-07-21T08:02:00Z',
  downloadUrl: '/me/cv/download',
  freshnessStatus: 'CURRENT',
  configuration: {
    includedExperienceIds: ['50000000-0000-4000-8000-000000000001'],
    includedProjectIds: ['660e8400-e29b-41d4-a716-446655440001'],
    includedCertificateIds: ['20000000-0000-4000-8000-000000000001'],
    includedAwardIds: ['30000000-0000-4000-8000-000000000001'],
    includedActivityIds: ['40000000-0000-4000-8000-000000000001'],
  },
  pdfFile: {
    fileName: 'student-cv.pdf',
    mediaType: 'application/pdf',
    fileSizeBytes: 184_320,
    generatedAt: '2026-07-21T08:01:30Z',
  },
})

type CvFixtureState = {
  freshness: CvFreshness
  previews: CvPreview[]
  cv: Cv | null
  previewFailure: CvPreviewFailure
  downloadFailure: CvDownloadFailure
  expireNextSave: boolean
}

const initialState: CvFixtureState = {
  freshness: notSavedFreshness,
  previews: [],
  cv: null,
  previewFailure: null,
  downloadFailure: null,
  expireNextSave: false,
}

let state = structuredClone(initialState)

export function getCvFixtureState() {
  return state
}

export function setCvFreshnessFixture(freshness: CvFreshness) {
  state.freshness = cvFreshnessSchema.parse(freshness)
}

export function setCvFixture(cv: Cv | null) {
  state.cv = cv === null ? null : cvSchema.parse(cv)
  if (state.cv) state.freshness = currentFreshness
}

export function setCvPreviewFailure(failure: CvPreviewFailure) {
  state.previewFailure = failure
}

export function setCvDownloadFailure(failure: CvDownloadFailure) {
  state.downloadFailure = failure
}

export function setCvExpireNextSave(expire: boolean) {
  state.expireNextSave = expire
}

export function storeCvPreview(preview: CvPreview) {
  const parsed = cvPreviewSchema.parse(preview)
  state.previews = [...state.previews.filter((item) => item.previewId !== parsed.previewId), parsed]
  return parsed
}

export function storeCv(cv: Cv) {
  const parsed = cvSchema.parse(cv)
  state.cv = parsed
  state.freshness = cvFreshnessSchema.parse({
    status: 'CURRENT',
    changedAreas: [],
    cvId: parsed.cvId,
    savedAt: parsed.savedAt,
    evaluatedAt: parsed.savedAt,
    message: 'The saved CV matches current source data.',
  })
  return parsed
}

export function resetCvBuilderMock() {
  state = structuredClone(initialState)
}
