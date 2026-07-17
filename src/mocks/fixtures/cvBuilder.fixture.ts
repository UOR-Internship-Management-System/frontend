import type {
  CvFreshness,
  CvPreview,
  CvVersion,
} from '../../features/cv-builder/types/cvBuilderTypes'
import {
  cvFreshnessSchema,
  cvPreviewSchema,
  cvVersionSchema,
} from '../../features/cv-builder/schemas/cvBuilderSchemas'

export const cvFixtureIds = {
  preview: '70000000-0000-4000-8000-000000000001',
  version: '50000000-0000-4000-8000-000000000004',
} as const

export type CvPreviewFailure = 'validation' | 'generation' | null
export type CvDownloadFailure = 'not-saved' | 'unavailable' | 'unauthorized' | null

const notSavedFreshness = cvFreshnessSchema.parse({
  status: 'NOT_SAVED',
  changedAreas: [],
  latestSavedCvVersionId: null,
  latestSavedAt: null,
  evaluatedAt: '2026-07-21T08:00:00Z',
  message: 'No saved CV version exists yet.',
})

export const currentFreshness = cvFreshnessSchema.parse({
  status: 'CURRENT',
  changedAreas: [],
  latestSavedCvVersionId: cvFixtureIds.version,
  latestSavedAt: '2026-07-21T08:02:00Z',
  evaluatedAt: '2026-07-21T08:03:00Z',
  message: 'The latest saved CV matches current source data.',
})

export const outdatedProfileFreshness = cvFreshnessSchema.parse({
  status: 'OUTDATED',
  changedAreas: ['PROFILE'],
  latestSavedCvVersionId: cvFixtureIds.version,
  latestSavedAt: '2026-07-21T08:02:00Z',
  evaluatedAt: '2026-07-21T09:00:00Z',
  message: 'Profile data changed after the latest CV was saved.',
})

export const outdatedSkillsProjectsFreshness = cvFreshnessSchema.parse({
  status: 'OUTDATED',
  changedAreas: ['DECLARED_SKILLS', 'PROJECTS'],
  latestSavedCvVersionId: cvFixtureIds.version,
  latestSavedAt: '2026-07-21T08:02:00Z',
  evaluatedAt: '2026-07-21T09:00:00Z',
  message: 'Declared skills or projects changed after the latest CV was saved.',
})

export const savedCvVersion = cvVersionSchema.parse({
  cvVersionId: cvFixtureIds.version,
  versionNumber: 4,
  versionLabel: 'Version 4',
  latest: true,
  createdAt: '2026-07-21T08:02:00Z',
  generatedAt: '2026-07-21T08:01:30Z',
  savedAt: '2026-07-21T08:02:00Z',
  downloadUrl: `/me/cv/versions/${cvFixtureIds.version}/download`,
  freshnessStatus: 'CURRENT',
  pdfFile: {
    fileName: 'cv-version-4.pdf',
    mediaType: 'application/pdf',
    fileSizeBytes: 184_320,
    generatedAt: '2026-07-21T08:01:30Z',
  },
})

type CvFixtureState = {
  freshness: CvFreshness
  previews: CvPreview[]
  versions: CvVersion[]
  previewFailure: CvPreviewFailure
  downloadFailure: CvDownloadFailure
  expireNextSave: boolean
}

const initialState: CvFixtureState = {
  freshness: notSavedFreshness,
  previews: [],
  versions: [],
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

export function setCvVersionsFixture(versions: CvVersion[]) {
  state.versions = versions.map((version) => cvVersionSchema.parse(version))
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

export function storeCvVersion(version: CvVersion) {
  const parsed = cvVersionSchema.parse(version)
  state.versions = [parsed, ...state.versions.map((item) => ({ ...item, latest: false }))]
  state.freshness = cvFreshnessSchema.parse({
    status: 'CURRENT',
    changedAreas: [],
    latestSavedCvVersionId: parsed.cvVersionId,
    latestSavedAt: parsed.savedAt,
    evaluatedAt: parsed.savedAt,
    message: 'The latest saved CV matches current source data.',
  })
  return parsed
}

export function resetCvBuilderMock() {
  state = structuredClone(initialState)
}
