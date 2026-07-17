import { http, HttpResponse } from 'msw'
import {
  cvFreshnessSchema,
  cvPreviewRequestSchema,
  cvPreviewSchema,
  cvVersionCreateRequestSchema,
  cvVersionSchema,
  pagedCvVersionsSchema,
} from '../../features/cv-builder/schemas/cvBuilderSchemas'
import {
  cvFixtureIds,
  getCvFixtureState,
  storeCvPreview,
  storeCvVersion,
} from '../fixtures/cvBuilder.fixture'

const apiBase = '/api/v1'

function problem(status: number, code: string, message: string) {
  return {
    type: `https://uor-cv-system/errors/${code.toLowerCase().replaceAll('_', '-')}`,
    title: status === 422 ? 'Invalid CV configuration' : 'CV request failed',
    status,
    code,
    message,
    correlationId: `mock-cv-${status}`,
  }
}

export const cvBuilderHandlers = [
  http.get(`${apiBase}/me/cv/source-freshness`, () =>
    HttpResponse.json(cvFreshnessSchema.parse(getCvFixtureState().freshness)),
  ),
  http.post(`${apiBase}/me/cv/preview`, async ({ request }) => {
    const state = getCvFixtureState()
    const parsed = cvPreviewRequestSchema.safeParse(await request.json())
    if (!parsed.success || state.previewFailure === 'validation') {
      return HttpResponse.json(
        problem(422, 'INVALID_CV_CONFIGURATION', 'Review the selected CV sections and projects.'),
        { status: 422 },
      )
    }
    if (state.previewFailure === 'generation') {
      return HttpResponse.json(
        problem(503, 'CV_GENERATION_FAILED', 'The CV service could not generate a preview.'),
        { status: 503 },
      )
    }

    const now = new Date()
    const preview = storeCvPreview(
      cvPreviewSchema.parse({
        previewId: cvFixtureIds.preview,
        htmlPreview:
          '<article class="ats-cv"><h1>Sample Student</h1><section><h2>Skills</h2><p>React, TypeScript</p></section></article>',
        latexSource:
          '\\documentclass[11pt]{article}\n\\begin{document}\nSample Student\n\\section*{Skills} React, TypeScript\n\\end{document}',
        freshness: state.freshness,
        configuration: parsed.data,
        generatedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 15 * 60_000).toISOString(),
      }),
    )
    return HttpResponse.json(preview)
  }),
  http.post(`${apiBase}/me/cv/versions`, async ({ request }) => {
    const state = getCvFixtureState()
    const parsed = cvVersionCreateRequestSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json(
        problem(422, 'INVALID_CV_CONFIGURATION', 'Use a valid preview ID.'),
        {
          status: 422,
        },
      )
    }
    const preview = state.previews.find((item) => item.previewId === parsed.data.previewId)
    if (!preview || state.expireNextSave || Date.parse(preview.expiresAt) <= Date.now()) {
      state.expireNextSave = false
      return HttpResponse.json(
        problem(409, 'CV_PREVIEW_EXPIRED', 'The preview expired and must be regenerated.'),
        { status: 409 },
      )
    }

    const now = new Date().toISOString()
    const versionNumber = state.versions.length + 1
    const version = storeCvVersion(
      cvVersionSchema.parse({
        cvVersionId: cvFixtureIds.version,
        versionNumber,
        versionLabel: `Version ${versionNumber}`,
        latest: true,
        createdAt: now,
        generatedAt: preview.generatedAt,
        savedAt: now,
        downloadUrl: `/me/cv/versions/${cvFixtureIds.version}/download`,
        freshnessStatus: 'CURRENT',
        pdfFile: {
          fileName: `cv-version-${versionNumber}.pdf`,
          mediaType: 'application/pdf',
          fileSizeBytes: 184_320,
          generatedAt: preview.generatedAt,
        },
      }),
    )
    return HttpResponse.json(version, { status: 201 })
  }),
  http.get(`${apiBase}/me/cv/versions`, ({ request }) => {
    const state = getCvFixtureState()
    const url = new URL(request.url)
    const page = Math.max(0, Number(url.searchParams.get('page') ?? 0))
    const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') ?? 20)))
    const sort = url.searchParams.get('sort') ?? 'savedAt,desc'
    const values = [...state.versions].sort((left, right) =>
      right.savedAt.localeCompare(left.savedAt),
    )
    return HttpResponse.json(
      pagedCvVersionsSchema.parse({
        items: values.slice(page * size, page * size + size),
        page: {
          page,
          size,
          totalElements: values.length,
          totalPages: Math.ceil(values.length / size),
          sort,
        },
      }),
    )
  }),
  http.get(`${apiBase}/me/cv/versions/:cvVersionId`, ({ params }) => {
    const version = getCvFixtureState().versions.find(
      (item) => item.cvVersionId === String(params.cvVersionId),
    )
    return version
      ? HttpResponse.json(cvVersionSchema.parse(version))
      : HttpResponse.json(problem(404, 'CV_NOT_FOUND', 'The CV version was not found.'), {
          status: 404,
        })
  }),
  http.get(`${apiBase}/me/cv/versions/:cvVersionId/download`, ({ params }) => {
    const version = getCvFixtureState().versions.find(
      (item) => item.cvVersionId === String(params.cvVersionId),
    )
    return version ? pdfResponse(version.pdfFile.fileName) : downloadProblem('not-saved')
  }),
  http.get(`${apiBase}/me/cv/latest/download`, () => {
    const state = getCvFixtureState()
    if (state.downloadFailure) return downloadProblem(state.downloadFailure)
    const latest = state.versions.find((version) => version.latest)
    return latest ? pdfResponse(latest.pdfFile.fileName) : downloadProblem('not-saved')
  }),
]

function pdfResponse(filename: string) {
  return new HttpResponse(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': '8',
    },
  })
}

function downloadProblem(failure: 'not-saved' | 'unavailable' | 'unauthorized') {
  if (failure === 'unauthorized') {
    return HttpResponse.json(problem(401, 'UNAUTHORIZED', 'Authentication is required.'), {
      status: 401,
    })
  }
  if (failure === 'unavailable') {
    return HttpResponse.json(problem(503, 'CV_FILE_UNAVAILABLE', 'The PDF is unavailable.'), {
      status: 503,
    })
  }
  return HttpResponse.json(problem(404, 'CV_NOT_SAVED', 'No saved CV exists.'), { status: 404 })
}
