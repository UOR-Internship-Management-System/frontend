import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CvPreviewPanel, buildPreviewDocument } from '../components/CvPreviewPanel'
import { cvPreviewSchema } from '../schemas/cvBuilderSchemas'
import { sanitizeCvHtml } from '../utils/sanitizeCvHtml'

const preview = cvPreviewSchema.parse({
  previewId: '70000000-0000-4000-8000-000000000001',
  htmlPreview:
    '<article class="ats-cv"><h1>Student</h1><script>window.parent.location="https://example.test"</script></article>',
  freshness: {
    status: 'NOT_SAVED',
    changedAreas: [],
    cvId: null,
    savedAt: null,
    evaluatedAt: '2026-07-21T08:00:00Z',
    message: 'No saved CV exists.',
  },
  configuration: {
    includedExperienceIds: [],
    includedProjectIds: [],
    includedCertificateIds: [],
    includedAwardIds: [],
    includedActivityIds: [],
  },
  generatedAt: '2026-07-21T08:00:00Z',
  expiresAt: '2026-07-21T08:15:00Z',
})

describe('CV preview security boundary', () => {
  it('isolates backend HTML in a capability-free iframe with a restrictive CSP', () => {
    const view = render(
      <CvPreviewPanel
        dirty={false}
        expired={false}
        isPending={false}
        onRetry={() => undefined}
        preview={preview}
      />,
    )
    const frame = view.getByTitle('Generated CV visual preview')

    expect(frame).toHaveAttribute('sandbox', '')
    expect(frame).not.toHaveAttribute('allow')
    expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer')
    expect(frame.getAttribute('srcdoc')).toContain("default-src 'none'")
    expect(frame.getAttribute('srcdoc')).toContain("form-action 'none'")
    expect(view.container.querySelector('.ats-cv')).toBeNull()
  })

  it('keeps the static preview policy free of script, same-origin, form, popup, and download capabilities', () => {
    const documentSource = buildPreviewDocument('<article>Safe output</article>')
    expect(documentSource).toContain("connect-src 'none'")
    expect(documentSource).toContain("frame-src 'none'")
    expect(documentSource).not.toContain('allow-scripts')
    expect(documentSource).not.toContain('allow-same-origin')
  })

  it('allow-lists ATS markup and removes active or unsupported content before srcDoc assembly', () => {
    const sanitized = sanitizeCvHtml(`
      <article class="ats-cv" style="position:fixed" onclick="alert(1)">
        <h1>Safe heading</h1><p>Safe paragraph</p><ul><li>Safe item</li></ul>
        <a href="https://example.test/profile">Safe link</a>
        <a href="&#x6a;avascript:alert(1)">Unsafe link</a>
        <img src="x" onerror="alert(1)">
        <script>alert(1)</script><form><input></form><iframe srcdoc="bad"></iframe>
        <svg><script>alert(1)</script></svg><math><mi>x</mi></math>
      </article>
    `)

    expect(sanitized).toContain('<article class="ats-cv">')
    expect(sanitized).toContain('<h1>Safe heading</h1>')
    expect(sanitized).toContain('href="https://example.test/profile"')
    expect(sanitized).not.toMatch(
      /script|onclick|onerror|javascript:|<form|<iframe|<img|<svg|<math/i,
    )
    expect(sanitized).not.toContain('style=')
  })
})
