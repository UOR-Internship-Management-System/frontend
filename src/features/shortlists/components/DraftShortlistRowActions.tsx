import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import { candidateFilteringApi } from '../../candidate-filtering/api/candidateFilteringApi'
import { filteringSessionApi } from '../../candidate-filtering/api/filteringSessionApi'
import {
  defaultCandidateFilteringUrlState,
  serializeCandidateFilteringUrlState,
} from '../../candidate-filtering/hooks/useCandidateFilteringUrlState'
import { useDeleteShortlist, getShortlistMutationErrorMessage } from '../hooks/useShortlists'
import type { Shortlist } from '../types/shortlistTypes'

function buildFinalizeUrl(
  run: Awaited<ReturnType<typeof candidateFilteringApi.getRun>>,
  shortlistId: string,
) {
  const query = serializeCandidateFilteringUrlState({
    ...defaultCandidateFilteringUrlState,
    requestId: run.request.requestId,
    minGpa: run.criteria.runtimeGpaLowerBound ?? undefined,
    maxGpa: run.criteria.runtimeGpaUpperBound ?? undefined,
    additionalSkillIds: run.criteria.additionalSkillIds,
    matchMode: run.criteria.skillMatchMode,
    restoreShortlistId: shortlistId,
  })
  return `${routePaths.adminCandidateFiltering}?${query.toString()}`
}

/** The three actions available for a single Drafted shortlist row: view, resume, delete. */
export function DraftShortlistRowActions({
  onView,
  shortlist,
}: {
  onView: () => void
  shortlist: Shortlist
}) {
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const deleteShortlist = useDeleteShortlist()
  const [isResuming, setIsResuming] = useState(false)
  const [resumeError, setResumeError] = useState<string>()
  const [pendingFinalizeUrl, setPendingFinalizeUrl] = useState<string>()
  const [conflictRequestTitle, setConflictRequestTitle] = useState<string>()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const backToFinalize = async () => {
    if (!shortlist.filterRunId) {
      setResumeError('This draft has no associated filtering run to resume.')
      return
    }
    setResumeError(undefined)
    setIsResuming(true)
    try {
      const run = await candidateFilteringApi.getRun(shortlist.filterRunId)
      const finalizeUrl = buildFinalizeUrl(run, shortlist.shortlistId)

      let mySession: Awaited<ReturnType<typeof filteringSessionApi.getMine>> | undefined
      try {
        mySession = await filteringSessionApi.getMine()
      } catch (reason) {
        if (mapApiError(reason, 'protected').status !== 404) throw reason
      }

      if (mySession && mySession.internshipRequestId !== run.request.requestId) {
        setPendingFinalizeUrl(finalizeUrl)
        setConflictRequestTitle(`${run.request.companyName} · ${run.request.title}`)
        return
      }

      navigate(finalizeUrl)
    } catch (reason) {
      setResumeError(mapApiError(reason, 'protected').message)
    } finally {
      setIsResuming(false)
    }
  }

  const confirmResumeOverActiveSession = async () => {
    if (!pendingFinalizeUrl) return
    try {
      await filteringSessionApi.clearMine()
    } catch {
      // The session may already be gone; continuing to navigate is still correct.
    }
    const url = pendingFinalizeUrl
    setPendingFinalizeUrl(undefined)
    setConflictRequestTitle(undefined)
    navigate(url)
  }

  const confirmDelete = async () => {
    try {
      await deleteShortlist.mutateAsync({
        shortlistId: shortlist.shortlistId,
        version: shortlist.version,
      })
      notify({
        tone: 'success',
        title: 'Draft removed',
        message: `The draft for ${shortlist.request.title} was deleted.`,
      })
      setDeleteOpen(false)
    } catch (reason) {
      notify({
        tone: 'error',
        title: 'Unable to delete draft',
        message: getShortlistMutationErrorMessage(reason),
      })
    }
  }

  return (
    <>
      <span className="m3-list-item-trailing sl-draft-actions">
        <Button
          icon={<span className="material-symbols-outlined">visibility</span>}
          onClick={onView}
          size="sm"
          variant="outlined"
        >
          View shortlist
        </Button>
        <Button
          disabled={isResuming}
          icon={<span className="material-symbols-outlined">undo</span>}
          isLoading={isResuming}
          onClick={() => void backToFinalize()}
          size="sm"
          variant="outlined"
        >
          Back to finalize shortlist
        </Button>
        <Button
          icon={<span className="material-symbols-outlined">delete</span>}
          onClick={() => setDeleteOpen(true)}
          size="sm"
          variant="danger"
        >
          Delete
        </Button>
      </span>

      {resumeError ? (
        <p className="inline-alert" role="alert">
          {resumeError}
        </p>
      ) : null}

      {pendingFinalizeUrl ? (
        <ConfirmDialog
          onClose={() => setPendingFinalizeUrl(undefined)}
          title="Active filtering session in progress"
        >
          <p>
            You have an unfinished Candidate Filtering session for a different internship request.
            {conflictRequestTitle
              ? ` Continuing to "${conflictRequestTitle}" will discard it.`
              : ' Continuing will discard it.'}
          </p>
          <div className="modal-actions">
            <Button onClick={() => setPendingFinalizeUrl(undefined)} variant="outlined">
              Keep current session
            </Button>
            <Button onClick={() => void confirmResumeOverActiveSession()} variant="danger">
              Discard it and continue
            </Button>
          </div>
        </ConfirmDialog>
      ) : null}

      {deleteOpen ? (
        <ConfirmDialog
          closeDisabled={deleteShortlist.isPending}
          onClose={() => setDeleteOpen(false)}
          title="Delete drafted shortlist"
        >
          <p>
            Remove the draft for <strong>{shortlist.request.title}</strong> (
            {shortlist.request.companyName})? This cannot be undone; its filtering run is deleted
            too.
          </p>
          <div className="modal-actions">
            <Button
              disabled={deleteShortlist.isPending}
              onClick={() => setDeleteOpen(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              isLoading={deleteShortlist.isPending}
              onClick={() => void confirmDelete()}
              variant="danger"
            >
              Delete
            </Button>
          </div>
        </ConfirmDialog>
      ) : null}
    </>
  )
}
