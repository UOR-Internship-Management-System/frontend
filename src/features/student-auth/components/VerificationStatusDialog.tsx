import { useEffect, useRef } from 'react'
import { Button } from '../../../shared/components/ui/Button'

type VerificationStatusDialogProps = {
  isOpen: boolean
  status: 'loading' | 'success' | 'failure'
  message?: string
  onClose: () => void
}

export function VerificationStatusDialog({
  isOpen,
  onClose,
  status,
}: VerificationStatusDialogProps) {
  const dialogRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null
    window.setTimeout(() => dialogRef.current?.focus(), 0)

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && status === 'failure') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [isOpen, onClose, status])

  if (!isOpen) {
    return null
  }

  const content = {
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
  }[status]

  return (
    <div className="modal-backdrop app-modal-overlay active">
      <section
        aria-describedby="verification-status-description"
        aria-labelledby="verification-status-title"
        aria-live="polite"
        aria-modal="true"
        className="modal-card card verification-modal-card"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
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
        <h2 id="verification-status-title">{content.title}</h2>
        <p id="verification-status-description">{content.body}</p>
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
