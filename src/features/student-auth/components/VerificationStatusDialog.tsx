import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'

type VerificationStatusDialogProps = {
  isOpen: boolean
  status: 'loading' | 'success' | 'failure'
  message?: string
  onClose: () => void
}

const statusContent = {
  loading: {
    title: 'Your details are verifying ...',
    body: 'Please wait while we check your index number and university email.',
  },
  success: {
    title: 'Your details are verified ..',
    body: 'Continue with the OTP sent to your university email.',
  },
  failure: {
    title: 'Verification issue',
    body: 'There is an issue with your entered details. Please consider them again and try again.',
  },
} as const

export function VerificationStatusDialog({
  isOpen,
  message,
  onClose,
  status,
}: VerificationStatusDialogProps) {
  if (!isOpen) return null

  const content = statusContent[status]
  const description = message?.trim() || content.body
  const canClose = status === 'failure'

  return (
    <Modal description={description} onClose={canClose ? onClose : undefined} title={content.title}>
      <div className="verification-modal-card">
        <div
          aria-atomic="true"
          aria-live="polite"
          className={`verification-state verification-state-${status}`}
          key={status}
          role="status"
        >
          <div className={`status-icon status-icon-${status}`} aria-hidden="true">
            {status === 'loading' ? (
              <span className="app-spinner" />
            ) : (
              <span className="material-symbols-outlined">
                {status === 'success' ? 'check_circle' : 'error'}
              </span>
            )}
          </div>
          <span className="visually-hidden">
            {content.title} {description}
          </span>
        </div>

        {canClose ? (
          <div className="form-actions">
            <Button onClick={onClose} variant="secondary">
              Check Details
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
