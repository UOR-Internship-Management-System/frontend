import { useEffect, useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import {
  useInternshipRequest,
  useInternshipRequests,
} from '../../internship-management/hooks/useInternshipRequests'
import { useCreateCandidateFilteringRun } from '../hooks/useCandidateFiltering'
import { candidateFilteringCriteriaRequestSchema } from '../schemas/candidateFilteringSchemas'
import type { CandidateFilteringUrlState } from '../types/candidateFilteringTypes'
import { DeclaredSkillFilterPanel } from './DeclaredSkillFilterPanel'
import { RuntimeGpaFilterPanel } from './RuntimeGpaFilterPanel'

export function CandidateSelectionPanel({
  state,
  updateState,
}: {
  state: CandidateFilteringUrlState
  updateState: (patch: Partial<CandidateFilteringUrlState>) => void
}) {
  const [formError, setFormError] = useState<string>()
  const initializedRequestRef = useRef<string | undefined>(undefined)
  const requests = useInternshipRequests({
    page: 0,
    size: 100,
    sort: 'companyName,asc',
    search: '',
    status: 'ACTIVE',
  })
  const selectedRequest = useInternshipRequest(state.requestId ?? null)
  const createRun = useCreateCandidateFilteringRun()

  useEffect(() => {
    const firstRequest = requests.data?.items[0]
    if (!state.requestId && firstRequest) updateState({ requestId: firstRequest.requestId })
  }, [requests.data?.items, state.requestId, updateState])

  useEffect(() => {
    const request = selectedRequest.data
    if (!request || initializedRequestRef.current === request.requestId) return
    initializedRequestRef.current = request.requestId
    updateState({ requestSkillIds: request.requiredSkills.map((skill) => skill.skillId) })
  }, [selectedRequest.data, updateState])

  const runFiltering = async () => {
    setFormError(undefined)
    const parsed = candidateFilteringCriteriaRequestSchema.safeParse({
      requestId: state.requestId,
      runtimeGpaLowerBound: state.minGpa,
      runtimeGpaUpperBound: state.maxGpa,
      requestSkillIds: state.requestSkillIds,
      additionalSkillIds: state.additionalSkillIds,
      skillMatchMode: state.matchMode,
    })
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Review the filtering criteria.')
      return
    }
    try {
      const run = await createRun.mutateAsync(parsed.data)
      updateState({ runId: run.filterRunId, candidatePage: 0 })
    } catch (reason) {
      setFormError(mapApiError(reason, 'protected').message)
    }
  }

  const resetCriteria = () => {
    setFormError(undefined)
    updateState({
      minGpa: undefined,
      maxGpa: undefined,
      requestSkillIds: selectedRequest.data?.requiredSkills.map((skill) => skill.skillId) ?? [],
      additionalSkillIds: [],
      matchMode: 'AND',
      runId: undefined,
      candidatePage: 0,
    })
  }

  const requestError = requests.error ?? selectedRequest.error
  if (requestError) {
    const mapped = mapApiError(requestError, 'protected')
    return (
      <ErrorState
        correlationId={mapped.correlationId}
        message={mapped.message}
        onAction={() => void Promise.all([requests.refetch(), selectedRequest.refetch()])}
        title="Internship requests unavailable"
      />
    )
  }

  return (
    <form
      className="candidate-selection-panel"
      onSubmit={(event) => {
        event.preventDefault()
        void runFiltering()
      }}
    >
      <div>
        <h2>Filtering criteria</h2>
        <p>Run deterministic checks against current official GPA and declared skills.</p>
      </div>
      <label className="filtering-request-select">
        <span>Select internship request</span>
        <SelectField
          disabled={requests.isPending || createRun.isPending}
          onChange={(event) => updateState({ requestId: event.target.value || undefined })}
          value={state.requestId ?? ''}
        >
          <option value="">Select an active request</option>
          {requests.data?.items.map((request) => (
            <option key={request.requestId} value={request.requestId}>
              {request.company.name} · {request.title}
            </option>
          ))}
        </SelectField>
      </label>

      {selectedRequest.data ? (
        <section aria-label="Selected request context" className="filtering-request-context">
          <div>
            <strong>{selectedRequest.data.title}</strong>
            <span>{selectedRequest.data.company.name}</span>
          </div>
          <StatusBadge tone="success">Active</StatusBadge>
        </section>
      ) : null}

      <RuntimeGpaFilterPanel
        disabled={createRun.isPending}
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

      <fieldset className="filtering-match-mode" disabled={createRun.isPending}>
        <legend>Declared skill matching</legend>
        <label>
          <input
            checked={state.matchMode === 'AND'}
            name="skill-match-mode"
            onChange={() => updateState({ matchMode: 'AND' })}
            type="radio"
          />
          Match every selected skill
        </label>
        <label>
          <input
            checked={state.matchMode === 'OR'}
            name="skill-match-mode"
            onChange={() => updateState({ matchMode: 'OR' })}
            type="radio"
          />
          Match any selected skill
        </label>
      </fieldset>

      {formError && !formError.includes('GPA') ? (
        <div className="inline-alert" role="alert">
          {formError}
        </div>
      ) : null}
      <div className="filtering-criteria-actions">
        <Button disabled={createRun.isPending} onClick={resetCriteria} variant="secondary">
          Reset criteria
        </Button>
        <Button disabled={!selectedRequest.data} isLoading={createRun.isPending} type="submit">
          Run filtering
        </Button>
      </div>
    </form>
  )
}
