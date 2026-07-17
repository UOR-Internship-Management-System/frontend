import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CvPreviewPanel, buildPreviewDocument } from '../components/CvPreviewPanel'
import { cvPreviewSchema } from '../schemas/cvBuilderSchemas'

const preview = cvPreviewSchema.parse({
  previewId: '70000000-0000-4000-8000-000000000001',
  htmlPreview:
    '<article class="ats-cv"><h1>Student</h1><script>window.parent.location="https://example.test"</script></article>',
  latexSource: '\\documentclass{article}',
  freshness: {
    status: 'NOT_SAVED',
    changedAreas: [],
    latestSavedCvVersionId: null,
    latestSavedAt: null,
    evaluatedAt: '2026-07-21T08:00:00Z',
    message: 'No saved CV exists.',
  },
  configuration: { sectionOrder: ['SKILLS'], includedProjectIds: [] },
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
})
