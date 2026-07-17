import { useNotifications } from '../../../app/providers/NotificationProvider'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { Button } from '../../../shared/components/ui/Button'
import { SectionCard } from '../../../shared/components/layout/SectionCard'

export function LatexOutputPanel({ latexSource }: { latexSource?: string | null }) {
  const { notify } = useNotifications()

  const copyLatex = async () => {
    if (!latexSource) return
    try {
      await navigator.clipboard.writeText(latexSource)
      notify({
        tone: 'success',
        title: 'LaTeX copied',
        message: 'The preview source is on your clipboard.',
      })
    } catch {
      notify({
        tone: 'error',
        title: 'Copy failed',
        message: 'Select the LaTeX text and copy it manually.',
      })
    }
  }

  return (
    <SectionCard aria-labelledby="latex-output-title" className="s5-latex-panel">
      <div className="s5-section-heading">
        <div>
          <h2 id="latex-output-title">LaTeX output</h2>
          <p>Read-only source from the same server-confirmed preview.</p>
        </div>
        <Button disabled={!latexSource} onClick={() => void copyLatex()} variant="secondary">
          Copy LaTeX
        </Button>
      </div>
      {latexSource ? (
        <pre aria-label="Generated LaTeX source" className="s5-latex-output" tabIndex={0}>
          <code>{latexSource}</code>
        </pre>
      ) : (
        <EmptyState message="Generate a preview to inspect its LaTeX source." />
      )}
    </SectionCard>
  )
}
