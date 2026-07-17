import { afterEach, describe, expect, it, vi } from 'vitest'
import { cvBuilderApi } from '../api/cvBuilderApi'
import { cvBuilderKeys } from '../hooks/cvBuilderKeys'
import {
  cvFreshnessSchema,
  cvPreviewRequestSchema,
  cvPreviewSchema,
  cvVersionCreateRequestSchema,
  cvVersionSchema,
  pagedCvVersionsSchema,
} from '../schemas/cvBuilderSchemas'
import {
  cvSourceAreaLabels,
  defaultCvSectionOrder,
  mapCvFreshness,
  mapCvPreviewRequest,
  mapCvVersion,
} from '../mappers/cvMapper'

const previewId = '70000000-0000-4000-8000-000000000001'
const versionId = '50000000-0000-4000-8000-000000000004'
const projectId = '60000000-0000-4000-8000-000000000001'

const freshness = {
  status: 'OUTDATED' as const,
  changedAreas: ['PROFILE', 'PROJECTS'] as const,
  latestSavedCvVersionId: versionId,
  latestSavedAt: '2026-07-21T07:30:00Z',
  evaluatedAt: '2026-07-21T08:00:00Z',
  message: 'Source data changed.',
}

const preview = {
  previewId,
  htmlPreview: '<article><h1>Sample Student</h1></article>',
  latexSource: '\\documentclass{article}',
  freshness,
  configuration: {
    sectionOrder: ['PROFESSIONAL_SUMMARY', 'SKILLS', 'PROJECTS'] as const,
    includedProjectIds: [projectId],
  },
  generatedAt: '2026-07-21T08:00:00Z',
  expiresAt: '2026-07-21T08:15:00Z',
}

const version = {
  cvVersionId: versionId,
  versionNumber: 4,
  versionLabel: 'Version 4',
  latest: true,
  createdAt: '2026-07-21T08:02:00Z',
  generatedAt: '2026-07-21T08:01:30Z',
  savedAt: '2026-07-21T08:02:00Z',
  downloadUrl: `/me/cv/versions/${versionId}/download`,
  freshnessStatus: 'CURRENT' as const,
  pdfFile: {
    fileName: 'cv-version-4.pdf',
    mediaType: 'application/pdf' as const,
    fileSizeBytes: 184_320,
    generatedAt: '2026-07-21T08:01:30Z',
  },
}

describe('CV Builder transport validation', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('accepts all controlled sections and source areas with valid preview data', () => {
    expect(cvPreviewSchema.parse(preview)).toEqual(preview)
    expect(defaultCvSectionOrder).toHaveLength(8)
    expect(Object.keys(cvSourceAreaLabels)).toEqual([
      'PROFILE',
      'DECLARED_SKILLS',
      'PROJECTS',
      'ACADEMIC_RECORDS',
    ])
  })

  it('rejects duplicate sections, duplicate projects, unknown fields, and unsafe download URLs', () => {
    expect(() =>
      cvPreviewRequestSchema.parse({
        sectionOrder: ['SKILLS', 'SKILLS'],
        includedProjectIds: [projectId, projectId],
      }),
    ).toThrow()
    expect(() => cvVersionCreateRequestSchema.parse({ previewId, notes: 'not allowed' })).toThrow()
    expect(() =>
      cvVersionSchema.parse({ ...version, downloadUrl: 'javascript:alert(1)' }),
    ).toThrow()
    expect(() => cvVersionSchema.parse({ ...version, freshnessStatus: 'NOT_SAVED' })).toThrow()
  })

  it('enforces freshness cross-field states', () => {
    expect(
      cvFreshnessSchema.parse({
        status: 'NOT_SAVED',
        changedAreas: [],
        latestSavedCvVersionId: null,
        latestSavedAt: null,
        evaluatedAt: freshness.evaluatedAt,
        message: 'No saved CV exists.',
      }).status,
    ).toBe('NOT_SAVED')
    expect(() => cvFreshnessSchema.parse({ ...freshness, changedAreas: [] })).toThrow()
    expect(() =>
      cvFreshnessSchema.parse({ ...freshness, status: 'CURRENT', changedAreas: ['PROFILE'] }),
    ).toThrow()
  })

  it('maps configuration, freshness, version labels, and excludes project IDs with the section', () => {
    expect(mapCvPreviewRequest(['SKILLS'], [projectId])).toEqual({
      sectionOrder: ['SKILLS'],
      includedProjectIds: [],
    })
    expect(mapCvFreshness(cvFreshnessSchema.parse(freshness))).toMatchObject({
      title: 'Your saved CV needs an update',
      changedAreaLabels: ['Profile and CV details', 'Projects'],
    })
    expect(mapCvVersion(cvVersionSchema.parse(version))).toMatchObject({
      versionLabel: 'Version 4',
      fileSizeLabel: '180.0 KB',
    })
  })

  it('validates version pages and stable query keys', () => {
    const page = {
      items: [version],
      page: { page: 0, size: 20, totalElements: 1, totalPages: 1, sort: 'savedAt,desc' },
    }
    expect(pagedCvVersionsSchema.parse(page)).toEqual(page)
    expect(cvBuilderKeys.versionList({ page: 0, size: 20, sort: 'savedAt,desc' })).toEqual([
      'protected',
      'cv-builder',
      'versions',
      'list',
      { page: 0, size: 20, sort: 'savedAt,desc' },
    ])
  })

  it('uses exact JSON paths, query parameters, and a previewId-only save body', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(freshness))
      .mockResolvedValueOnce(Response.json(preview))
      .mockResolvedValueOnce(Response.json(version, { status: 201 }))
      .mockResolvedValueOnce(
        Response.json({
          items: [version],
          page: { page: 1, size: 10, totalElements: 11, totalPages: 2, sort: 'savedAt,desc' },
        }),
      )
      .mockResolvedValueOnce(Response.json(version))
    vi.stubGlobal('fetch', fetchMock)

    await cvBuilderApi.getFreshness()
    await cvBuilderApi.createPreview(cvPreviewRequestSchema.parse(preview.configuration))
    await cvBuilderApi.saveVersion(previewId)
    await cvBuilderApi.listVersions({ page: 1, size: 10, sort: 'savedAt,desc' })
    await cvBuilderApi.getVersion(versionId)

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/me/cv/source-freshness',
      '/api/v1/me/cv/preview',
      '/api/v1/me/cv/versions',
      '/api/v1/me/cv/versions?page=1&size=10&sort=savedAt%2Cdesc',
      `/api/v1/me/cv/versions/${versionId}`,
    ])
    expect(JSON.parse(fetchMock.mock.calls[2]?.[1]?.body as string)).toEqual({ previewId })
  })
})
