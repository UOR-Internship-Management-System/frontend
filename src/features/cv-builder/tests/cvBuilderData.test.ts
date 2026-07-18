import { afterEach, describe, expect, it, vi } from 'vitest'
import { cvBuilderApi } from '../api/cvBuilderApi'
import { cvBuilderKeys } from '../hooks/cvBuilderKeys'
import {
  cvFreshnessSchema,
  cvPreviewRequestSchema,
  cvPreviewSchema,
  cvSaveRequestSchema,
  cvSchema,
} from '../schemas/cvBuilderSchemas'
import {
  emptyCvRecordSelections,
  mapCv,
  mapCvFreshness,
  mapCvPreviewRequest,
} from '../mappers/cvMapper'

const previewId = '70000000-0000-4000-8000-000000000001'
const cvId = '50000000-0000-4000-8000-000000000004'
const projectId = '60000000-0000-4000-8000-000000000001'
const experienceId = '50000000-0000-4000-8000-000000000001'
const certificateId = '20000000-0000-4000-8000-000000000001'
const awardId = '30000000-0000-4000-8000-000000000001'
const activityId = '40000000-0000-4000-8000-000000000001'

const freshness = {
  status: 'OUTDATED' as const,
  changedAreas: ['PROFILE', 'PROJECTS'] as const,
  cvId,
  savedAt: '2026-07-21T07:30:00Z',
  evaluatedAt: '2026-07-21T08:00:00Z',
  message: 'Source data changed.',
}

const configuration = {
  includedExperienceIds: [experienceId],
  includedProjectIds: [projectId],
  includedCertificateIds: [certificateId],
  includedAwardIds: [awardId],
  includedActivityIds: [activityId],
}

const preview = {
  previewId,
  htmlPreview: '<article><h1>Sample Student</h1></article>',
  freshness,
  configuration,
  generatedAt: '2026-07-21T08:00:00Z',
  expiresAt: '2026-07-21T08:15:00Z',
}

const cv = {
  cvId,
  revision: 4,
  createdAt: '2026-07-21T08:02:00Z',
  generatedAt: '2026-07-21T08:01:30Z',
  savedAt: '2026-07-21T08:02:00Z',
  downloadUrl: '/me/cv/download',
  freshnessStatus: 'CURRENT' as const,
  configuration,
  pdfFile: {
    fileName: 'student-cv.pdf',
    mediaType: 'application/pdf' as const,
    fileSizeBytes: 184_320,
    generatedAt: '2026-07-21T08:01:30Z',
  },
}

describe('CV Builder transport validation', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('accepts the fixed-order record-selection contract and public preview without LaTeX', () => {
    expect(cvPreviewSchema.parse(preview)).toEqual(preview)
    expect(Object.keys(emptyCvRecordSelections)).toEqual([
      'includedExperienceIds',
      'includedProjectIds',
      'includedCertificateIds',
      'includedAwardIds',
      'includedActivityIds',
    ])
    expect(preview).not.toHaveProperty('latexSource')
  })

  it('rejects duplicate record IDs and unknown fields', () => {
    expect(() =>
      cvPreviewRequestSchema.parse({
        ...configuration,
        includedProjectIds: [projectId, projectId],
      }),
    ).toThrow()
    expect(() => cvPreviewRequestSchema.parse({ ...configuration, optionalSections: {} })).toThrow()
    expect(() => cvSaveRequestSchema.parse({ previewId, notes: 'not allowed' })).toThrow()
    expect(() => cvSchema.parse({ ...cv, downloadUrl: 'javascript:alert(1)' })).toThrow()
  })

  it('enforces freshness cross-field states', () => {
    expect(
      cvFreshnessSchema.parse({
        status: 'NOT_SAVED',
        changedAreas: [],
        cvId: null,
        savedAt: null,
        evaluatedAt: freshness.evaluatedAt,
        message: 'No saved CV exists.',
      }).status,
    ).toBe('NOT_SAVED')
    expect(() => cvFreshnessSchema.parse({ ...freshness, changedAreas: [] })).toThrow()
  })

  it('maps sorted record selections, freshness, and active CV labels', () => {
    expect(
      mapCvPreviewRequest({
        ...configuration,
        includedProjectIds: ['60000000-0000-4000-8000-000000000002', projectId],
      }),
    ).toEqual({
      ...configuration,
      includedProjectIds: [projectId, '60000000-0000-4000-8000-000000000002'],
    })
    expect(mapCvFreshness(cvFreshnessSchema.parse(freshness))).toMatchObject({
      title: 'Your saved CV needs an update',
      changedAreaLabels: ['Profile and CV details', 'Projects'],
    })
    expect(mapCv(cvSchema.parse(cv))).toMatchObject({ revision: 4, fileSizeLabel: '180.0 KB' })
    expect(cvBuilderKeys.current()).toEqual(['protected', 'cv-builder', 'current'])
  })

  it('uses the replacement endpoints and optimistic-concurrency headers', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(freshness))
      .mockResolvedValueOnce(Response.json(preview))
      .mockResolvedValueOnce(Response.json(cv))
      .mockResolvedValueOnce(Response.json(cv, { status: 201 }))
      .mockResolvedValueOnce(Response.json({ ...cv, revision: 5 }))
    vi.stubGlobal('fetch', fetchMock)

    await cvBuilderApi.getFreshness()
    await cvBuilderApi.createPreview(cvPreviewRequestSchema.parse(configuration))
    await cvBuilderApi.getCurrent()
    await cvBuilderApi.saveCurrent(previewId, null)
    await cvBuilderApi.saveCurrent(previewId, 4)

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/me/cv/source-freshness',
      '/api/v1/me/cv/preview',
      '/api/v1/me/cv',
      '/api/v1/me/cv',
      '/api/v1/me/cv',
    ])
    expect(new Headers(fetchMock.mock.calls[3]?.[1]?.headers).get('If-None-Match')).toBe('*')
    expect(new Headers(fetchMock.mock.calls[4]?.[1]?.headers).get('If-Match')).toBe('"4"')
  })
})
