import { http, HttpResponse } from 'msw'
import {
  cvFreshnessSchema,
  cvPreviewRequestSchema,
  cvPreviewSchema,
  cvSaveRequestSchema,
  cvSchema,
} from '../../features/cv-builder/schemas/cvBuilderSchemas'
import {
  cvFixtureIds,
  getCvFixtureState,
  storeCv,
  storeCvPreview,
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
    return HttpResponse.json(
      storeCvPreview(
        cvPreviewSchema.parse({
          previewId: cvFixtureIds.preview,
          htmlPreview:
            '<article class="ats-cv"><h1>Sample Student</h1><section><h2>Skills</h2><p>React, TypeScript</p></section></article>',
          freshness: state.freshness,
          configuration: parsed.data,
          generatedAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + 15 * 60_000).toISOString(),
        }),
      ),
    )
  }),
  http.get(`${apiBase}/me/cv`, () => {
    const cv = getCvFixtureState().cv
    return cv
      ? HttpResponse.json(cvSchema.parse(cv), { headers: { ETag: `"${cv.revision}"` } })
      : HttpResponse.json(problem(404, 'CV_NOT_SAVED', 'No saved CV exists.'), { status: 404 })
  }),
  http.put(`${apiBase}/me/cv`, async ({ request }) => {
    const state = getCvFixtureState()
    const parsed = cvSaveRequestSchema.safeParse(await request.json())
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
    const revision = (state.cv?.revision ?? 0) + 1
    const cv = storeCv(
      cvSchema.parse({
        cvId: state.cv?.cvId ?? cvFixtureIds.cv,
        revision,
        createdAt: state.cv?.createdAt ?? now,
        generatedAt: preview.generatedAt,
        savedAt: now,
        downloadUrl: '/me/cv/download',
        freshnessStatus: 'CURRENT',
        configuration: preview.configuration,
        pdfFile: {
          fileName: 'student-cv.pdf',
          mediaType: 'application/pdf',
          fileSizeBytes: 184_320,
          generatedAt: preview.generatedAt,
        },
      }),
    )
    return HttpResponse.json(cv, {
      status: revision === 1 ? 201 : 200,
      headers: { ETag: `"${revision}"` },
    })
  }),
  http.get(`${apiBase}/me/cv/download`, () => {
    const state = getCvFixtureState()
    if (state.downloadFailure) return downloadProblem(state.downloadFailure)
    return state.cv ? pdfResponse(state.cv.pdfFile.fileName) : downloadProblem('not-saved')
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
