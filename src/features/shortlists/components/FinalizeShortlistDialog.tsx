import { useEffect, useId, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import { useFinalizeShortlist } from '../hooks/useShortlists'
import type { Shortlist } from '../types/shortlistTypes'
import { ShortlistGuidanceWarning } from './ShortlistGuidanceWarning'

function finalizationErrorMessage(error: unknown) {
  const mapped = mapApiError(error, 'protected')

  if (mapped.status === 409 && mapped.code === 'SHORTLIST_GUIDANCE_ACKNOWLEDGEMENT_REQUIRED') {
    return {
      message:
        'The latest shortlist exceeds its guidance value. Review the refreshed guidance and explicitly acknowledge the warning before finalizing.',
      shouldRecover: true,
    }
  }

  if (mapped.status === 409) {
    return {
      message:
        'This shortlist can no longer be finalized from the current state. It may already have been finalized by another Admin. The latest state is being loaded.',
      shouldRecover: true,
    }
  }

  if (mapped.status === 412) {
    return {
      message:
        'This shortlist changed after the dialog was opened. The latest version is being loaded; review it before trying again.',
      shouldRecover: true,
    }
  }

  if (mapped.status === 428) {
    return {
      message:
        'The server requires the latest shortlist version. The current shortlist is being reloaded before another finalization attempt.',
      shouldRecover: true,
    }
  }

  if (mapped.status === 404) {
    return {
      message: 'This shortlist no longer exists or is no longer available.',
      shouldRecover: false,
      isMissing: true,
    }
  }

  if (mapped.status === 422) {
    return {
      message:
        'The shortlist could not be finalized. Confirm that it still contains at least one candidate and review the latest data.',
      shouldRecover: true,
    }
  }

  return {
    message: mapped.message,
    shouldRecover: false,
  }
}

export function FinalizeShortlistDialog({
  onClose,
  onMissingShortlist,
  onRecover,
  shortlist,
}: {
  onClose: () => void
  onMissingShortlist: () => void
  onRecover: () => Promise<unknown>
  shortlist: Shortlist
}) {
  const { notify } = useNotifications()
  const finalizeShortlist = useFinalizeShortlist()
  const acknowledgementDescriptionId = useId()
  const [acknowledged, setAcknowledged] = useState(false)
  const [finalizationNote, setFinalizationNote] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>()

  const acknowledgementRequired = shortlist.guidanceExceeded
  const hasCandidates = shortlist.selectedCandidateCount > 0
  const canSubmit =
    shortlist.status === 'DRAFT' && hasCandidates && (!acknowledgementRequired || acknowledged)

  useEffect(() => {
    if (acknowledgementRequired) {
      setAcknowledged(false)
    }
  }, [
    acknowledgementRequired,
    shortlist.guidanceValue,
    shortlist.selectedCandidateCount,
    shortlist.version,
  ])

  const submit = async () => {
    if (!canSubmit || finalizeShortlist.isPending) return

    setErrorMessage(undefined)

    try {
      const result = await finalizeShortlist.mutateAsync({
        shortlistId: shortlist.shortlistId,
        version: shortlist.version,
        body: {
          acknowledgeGuidanceWarning: acknowledgementRequired ? acknowledged : false,
          finalizationNote: finalizationNote.trim() || null,
        },
      })

      notify({
        tone: 'success',
        title: 'Shortlist finalized',
        message: `${result.selectedCandidateCount} candidate${
          result.selectedCandidateCount === 1 ? '' : 's'
        } finalized for ${shortlist.request.companyName}.`,
      })

      onClose()
    } catch (error) {
      const outcome = finalizationErrorMessage(error)
      setErrorMessage(outcome.message)

      if (outcome.isMissing) {
        onMissingShortlist()
        return
      }

      if (outcome.shouldRecover) {
        await onRecover()
      }
    }
  }

  return (
    <ConfirmDialog
      closeDisabled={finalizeShortlist.isPending}
      onClose={onClose}
      title="Finalize shortlist"
    >
      <div className="finalize-shortlist-dialog">
        <p>
          Finalizing makes candidate membership read-only. This action does not rank candidates or
          modify Student-owned information.
        </p>

        <ShortlistGuidanceWarning shortlist={shortlist} />

        {!hasCandidates ? (
          <p className="inline-alert" role="alert">
            Add at least one candidate before finalizing this shortlist.
          </p>
        ) : null}

        {acknowledgementRequired ? (
          <label className="shortlist-guidance-acknowledgement">
            <input
              aria-describedby={acknowledgementDescriptionId}
              checked={acknowledged}
              disabled={finalizeShortlist.isPending}
              onChange={(event) => setAcknowledged(event.target.checked)}
              type="checkbox"
            />
            <span>
              I acknowledge that the selected count exceeds the advisory guidance value and confirm
              that I want to finalize this manually reviewed shortlist.
            </span>
          </label>
        ) : null}

        {acknowledgementRequired ? (
          <p className="shortlist-guidance-acknowledgement-note" id={acknowledgementDescriptionId}>
            Acknowledgement is required only because guidance is exceeded. It does not change the
            selected candidates.
          </p>
        ) : null}

        <FormField htmlFor="shortlist-finalization-note" label="Finalization note (optional)">
          <textarea
            className="input"
            disabled={finalizeShortlist.isPending}
            id="shortlist-finalization-note"
            maxLength={1000}
            onChange={(event) => setFinalizationNote(event.target.value)}
            rows={4}
            value={finalizationNote}
          />
        </FormField>

        <p className="shortlist-character-count">{finalizationNote.length}/1000 characters</p>

        {errorMessage ? (
          <p className="inline-alert" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="modal-actions">
          <Button disabled={finalizeShortlist.isPending} onClick={onClose} variant="secondary">
            Continue reviewing
          </Button>
          <Button
            disabled={!canSubmit}
            isLoading={finalizeShortlist.isPending}
            onClick={() => void submit()}
          >
            Finalize shortlist
          </Button>
        </div>
      </div>
    </ConfirmDialog>
  )
}
