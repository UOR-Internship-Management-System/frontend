import { Button } from '../../../shared/components/ui/Button'

type VerificationStatusDialogProps = {
  isOpen: boolean
  status: 'loading' | 'success' | 'failure'
  message?: string
  onClose: () => void
}

export function VerificationStatusDialog({
  isOpen,
  message,
  onClose,
  status,
}: VerificationStatusDialogProps) {
  if (!isOpen) {
    return null
  }

  const content = {
    loading: {
      title: 'Verifying your details',
      body: 'Your details are verifying. Please wait while we check your index number and university email.',
    },
    success: {
      title: 'Details verified',
      body: 'Your details are verified. Continue with the OTP sent to your university email.',
    },
    failure: {
      title: 'Verification failed',
      body:
        message ?? 'There is an issue with your entered details. Please check them and try again.',
    },
  }[status]

  return (
    <div className="modal-backdrop">
      <section aria-live="polite" aria-modal="true" className="modal-card card" role="dialog">
        <div className={`status-icon status-icon-${status}`} aria-hidden="true">
          {status === 'loading' ? '...' : status === 'success' ? 'OK' : '!'}
        </div>
        <h2>{content.title}</h2>
        <p>{content.body}</p>
        {status === 'failure' ? (
          <div className="form-actions">
            <Button onClick={onClose} variant="secondary">
              Check Details
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
