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
import { getDeclaredSkillsFixture, individualSkillsFixture } from '../fixtures/skills.fixture'
import { getStudentProjectsFixture } from '../fixtures/studentProjects.fixture'
import { getStudentProfileMockState } from './studentHandlers'

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
        problem(422, 'INVALID_CV_CONFIGURATION', 'Review the selected CV records.'),
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
    const profileState = getStudentProfileMockState()
    const projects = getStudentProjectsFixture()
    const skills = getDeclaredSkillsFixture()

    const htmlParts: string[] = []
    htmlParts.push(`<article class="ats-cv">`)
    htmlParts.push(`<h1>${profileState.profile.fullName}</h1>`)
    htmlParts.push(`<p>${profileState.profile.universityEmail} | ${profileState.profile.phone}</p>`)

    if (profileState.profile.summary) {
      htmlParts.push(`<section><h2>Profile</h2><p>${profileState.profile.summary}</p></section>`)
    }

    if (parsed.data.includedExperienceIds.length > 0) {
      const selectedExp = profileState.experience.filter((e) =>
        parsed.data.includedExperienceIds.includes(e.id),
      )
      htmlParts.push(`<section><h2>Experience</h2>`)
      for (const exp of selectedExp) {
        htmlParts.push(`<article><h3>${exp.positionTitle}</h3><p>${exp.organization}</p></article>`)
      }
      htmlParts.push(`</section>`)
    }

    if (parsed.data.includedProjectIds.length > 0) {
      const selectedProj = projects.filter((p) =>
        parsed.data.includedProjectIds.includes(p.projectId),
      )
      htmlParts.push(`<section><h2>Projects</h2>`)
      for (const proj of selectedProj) {
        htmlParts.push(`<article><h3>${proj.title}</h3><p>${proj.description}</p></article>`)
      }
      htmlParts.push(`</section>`)
    }

    // Temporarily including all skills in the preview mock since cvInclude is removed.
    const includedSkills = skills
    if (includedSkills.length > 0) {
      htmlParts.push(`<section><h2>Skills</h2><p>`)
      htmlParts.push(
        includedSkills
          .map((s) => individualSkillsFixture.find((i) => i.skillId === s.skillId)?.name ?? '')
          .join(', '),
      )
      htmlParts.push(`</p></section>`)
    }

    if (parsed.data.includedCertificateIds.length > 0) {
      const selectedCert = profileState.certificates.filter((c) =>
        parsed.data.includedCertificateIds.includes(c.id),
      )
      htmlParts.push(`<section><h2>Certificates</h2><ul>`)
      for (const cert of selectedCert) {
        htmlParts.push(`<li>${cert.title} - ${cert.issuer}</li>`)
      }
      htmlParts.push(`</ul></section>`)
    }

    if (parsed.data.includedAwardIds.length > 0) {
      const selectedAward = profileState.awards.filter((a) =>
        parsed.data.includedAwardIds.includes(a.id),
      )
      htmlParts.push(`<section><h2>Awards</h2><ul>`)
      for (const aw of selectedAward) {
        htmlParts.push(`<li>${aw.title} - ${aw.issuer}</li>`)
      }
      htmlParts.push(`</ul></section>`)
    }

    if (parsed.data.includedActivityIds.length > 0) {
      const selectedAct = profileState.activities.filter((a) =>
        parsed.data.includedActivityIds.includes(a.id),
      )
      htmlParts.push(`<section><h2>Activities</h2><ul>`)
      for (const act of selectedAct) {
        htmlParts.push(`<li>${act.roleTitle} - ${act.activityName}</li>`)
      }
      htmlParts.push(`</ul></section>`)
    }

    htmlParts.push(`</article>`)
    const dynamicHtml = htmlParts.join('')

    return HttpResponse.json(
      storeCvPreview(
        cvPreviewSchema.parse({
          previewId: cvFixtureIds.preview,
          htmlPreview: dynamicHtml,
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
