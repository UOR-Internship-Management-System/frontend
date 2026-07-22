import { useEffect, useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { useInternshipRequest } from '../../internship-management/hooks/useInternshipRequests'
import { useCreateCandidateFilteringRun } from '../hooks/useCandidateFiltering'
import { candidateFilteringCriteriaRequestSchema } from '../schemas/candidateFilteringSchemas'
import type { CandidateFilteringUrlState } from '../types/candidateFilteringTypes'
import { DeclaredSkillFilterPanel } from './DeclaredSkillFilterPanel'
import { InternshipRequestSelectorModal } from './InternshipRequestSelectorModal'
import { RuntimeGpaFilterPanel } from './RuntimeGpaFilterPanel'

export function CandidateSelectionPanel({
  state,
  updateState,
}: {
  state: CandidateFilteringUrlState
  updateState: (patch: Partial<CandidateFilteringUrlState>) => void
}) {
  const [formError, setFormError] = useState<string>()
  const [requestSelectorOpen, setRequestSelectorOpen] = useState(false)
  const initializedRequestRef = useRef<string | undefined>(undefined)
  const selectedRequest = useInternshipRequest(state.requestId ?? null)
  const createRun = useCreateCandidateFilteringRun()
  const filteringRequestRef = useRef(0)
  const filteringTimeoutRef = useRef<number | undefined>(undefined)
  const lastCriteriaRef = useRef<string | undefined>(undefined)

  useEffect(
    () => () => {
      if (filteringTimeoutRef.current !== undefined) {
        window.clearTimeout(filteringTimeoutRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    const request = selectedRequest.data
    if (!request || initializedRequestRef.current === request.requestId) return
    initializedRequestRef.current = request.requestId
    updateState({ requestSkillIds: request.requiredSkills.map((skill) => skill.skillId) })
  }, [selectedRequest.data, updateState])

  useEffect(() => {
    if (!selectedRequest.data || initializedRequestRef.current !== selectedRequest.data.requestId) {
      return
    }

    const criteria = {
      requestId: state.requestId,
      runtimeGpaLowerBound: state.minGpa,
      runtimeGpaUpperBound: state.maxGpa,
      requestSkillIds: state.requestSkillIds,
      additionalSkillIds: state.additionalSkillIds,
      skillMatchMode: state.matchMode,
    }
    const criteriaKey = JSON.stringify(criteria)
    if (lastCriteriaRef.current === criteriaKey) return
    lastCriteriaRef.current = criteriaKey
    if (filteringTimeoutRef.current !== undefined) {
      window.clearTimeout(filteringTimeoutRef.current)
      filteringTimeoutRef.current = undefined
    }

    const parsed = candidateFilteringCriteriaRequestSchema.safeParse(criteria)

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Review the filtering criteria.')
      return
    }

    const requestNumber = filteringRequestRef.current + 1
    filteringRequestRef.current = requestNumber
    filteringTimeoutRef.current = window.setTimeout(() => {
      filteringTimeoutRef.current = undefined
      setFormError(undefined)
      void createRun
        .mutateAsync(parsed.data)
        .then((run) => {
          if (filteringRequestRef.current === requestNumber) {
            updateState({ runId: run.filterRunId, candidatePage: 0 })
          }
        })
        .catch((reason: unknown) => {
          if (filteringRequestRef.current === requestNumber) {
            setFormError(mapApiError(reason, 'protected').message)
          }
        })
    }, 250)

  }, [
    createRun,
    selectedRequest.data,
    state.additionalSkillIds,
    state.matchMode,
    state.maxGpa,
    state.minGpa,
    state.requestId,
    state.requestSkillIds,
    updateState,
  ])

  const requestError = selectedRequest.error
  const mappedRequestError = requestError ? mapApiError(requestError, 'protected') : null

  return (
    <aside className="candidate-filtering-sidebar" aria-label="Candidate filtering controls">
      <SectionCard aria-labelledby="request-context-title" className="candidate-request-card">
        <div className="candidate-sidebar-heading">
          <div>
            <h2 id="request-context-title">Internship Request Context</h2>
            <p>Choose the active placement context before defining runtime criteria.</p>
          </div>
          {selectedRequest.data ? <StatusBadge tone="success">Active</StatusBadge> : null}
        </div>

        <Button className="btn-full-sidebar" icon={<span className="material-symbols-outlined">assignment_ind</span>} onClick={() => setRequestSelectorOpen(true)}>Select Internship Request</Button>

        {mappedRequestError ? (
          <ErrorState
            correlationId={mappedRequestError.correlationId}
            message={mappedRequestError.message}
            onAction={() => void selectedRequest.refetch()}
            title="Selected request unavailable"
          />
        ) : selectedRequest.data ? (
          <div className="candidate-request-context-summary">
            <div>
              <span>Active placement target</span>
              <strong>{selectedRequest.data.company.name}</strong>
            </div>
            <div>
              <span>Assigned role context</span>
              <strong>{selectedRequest.data.title}</strong>
            </div>
            <div>
              <span>Shortlist guidance</span>
              <strong>
                {selectedRequest.data.shortlistGuidanceValue === null
                  ? 'Not set'
                  : `${selectedRequest.data.shortlistGuidanceValue} candidates`}
              </strong>
            </div>
          </div>
        ) : (
          <div className="candidate-request-context-empty">
            No request selected. Filtering remains disabled until an Admin chooses one explicitly.
          </div>
        )}
      </SectionCard>

      <SectionCard aria-labelledby="filtering-panel-title" className="candidate-criteria-card">
        <div className="candidate-selection-panel">
          <div className="candidate-sidebar-heading">
            <div>
              <h2 id="filtering-panel-title">Filtering Panel</h2>
            </div>
          </div>

          <RuntimeGpaFilterPanel
            disabled={createRun.isPending || !selectedRequest.data}
            error={formError?.includes('GPA') ? formError : undefined}
            maxGpa={state.maxGpa}
            minGpa={state.minGpa}
            onMaxGpaChange={(maxGpa) => updateState({ maxGpa })}
            onMinGpaChange={(minGpa) => updateState({ minGpa })}
          />

          <DeclaredSkillFilterPanel
            additionalSkillIds={state.additionalSkillIds}
            disabled={!selectedRequest.data || createRun.isPending}
            onAdditionalSkillIdsChange={(additionalSkillIds) => updateState({ additionalSkillIds })}
            onRequestSkillIdsChange={(requestSkillIds) => updateState({ requestSkillIds })}
            requestSkillIds={state.requestSkillIds}
            requestSkills={selectedRequest.data?.requiredSkills ?? []}
          />

          <fieldset
            className="filtering-match-mode"
            disabled={createRun.isPending || !selectedRequest.data}
          >
            <legend>Skill matching logic</legend>
            <div
              aria-checked={state.matchMode === 'AND'}
              aria-label="Toggle technical skill matching logic mode"
              className="logic-switch-wrapper"
              onClick={() => updateState({ matchMode: state.matchMode === 'AND' ? 'OR' : 'AND' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  updateState({ matchMode: state.matchMode === 'AND' ? 'OR' : 'AND' })
                }
              }}
              role="switch"
              tabIndex={0}
            >
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Matching logic</span>
              <div className="logic-switch-axis" aria-hidden="true">
                <div className="logic-switch-handle">{state.matchMode}</div>
              </div>
            </div>
            <p className="active-logic-text">
              {state.matchMode === 'AND'
                ? 'All selected skills must be declared.'
                : 'One or more selected skills may be declared.'}
            </p>
          </fieldset>

          {formError && !formError.includes('GPA') ? (
            <div className="inline-alert" role="alert">
              {formError}
            </div>
          ) : null}

          <p aria-live="polite" className="candidate-filtering-live-status">
            {createRun.isPending ? 'Updating deterministic results…' : ''}
          </p>
        </div>
      </SectionCard>

      {requestSelectorOpen ? (
        <InternshipRequestSelectorModal
          currentRequest={selectedRequest.data}
          onClose={() => setRequestSelectorOpen(false)}
          onSelect={(requestId) => updateState({ requestId })}
        />
      ) : null}
    </aside>
  )
}
