import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { useCompanies } from '../../internship-management/hooks/useCompanies'
import { useInternshipRequests } from '../../internship-management/hooks/useInternshipRequests'
import type { InternshipRequest } from '../../internship-management/types/internshipManagementTypes'

export function InternshipRequestSelectorModal({
  currentRequest,
  onClose,
  onSelect,
}: {
  currentRequest?: InternshipRequest
  onClose: () => void
  onSelect: (requestId: string) => void
}) {
  const [companySearch, setCompanySearch] = useState('')
  const [requestSearch, setRequestSearch] = useState('')
  const [companyId, setCompanyId] = useState(currentRequest?.company.companyId ?? '')
  const [requestId, setRequestId] = useState(currentRequest?.requestId ?? '')

  const companies = useCompanies({
    page: 0,
    size: 100,
    sort: 'name,asc',
    search: companySearch.trim(),
    active: true,
  })
  const requests = useInternshipRequests(
    companyId
      ? {
          page: 0,
          size: 100,
          sort: 'title,asc',
          search: requestSearch.trim(),
          status: 'ACTIVE',
          companyId,
        }
      : null,
  )

  useEffect(() => {
    if (!requestId || !requests.data) return
    if (!requests.data.items.some((request) => request.requestId === requestId)) {
      setRequestId('')
    }
  }, [requestId, requests.data])

  const error = companies.error ?? requests.error
  const mappedError = error ? mapApiError(error, 'protected') : null

  return (
    <Modal
      description="Search active external company records, then choose one active internship request."
      onClose={onClose}
      title="Select an internship request"
    >
      <div className="request-selector-modal">
        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void Promise.all([companies.refetch(), requests.refetch()])}
            title="Request directory unavailable"
          />
        ) : null}

        <label>
          <span>Search companies</span>
          <SearchInput
            aria-label="Search companies in request selector"
            onChange={(event) => setCompanySearch(event.target.value)}
            placeholder="Search companies by name"
            value={companySearch}
          />
        </label>

        <label>
          <span>Select company</span>
          <SelectField
            aria-label="Select company for candidate filtering"
            disabled={companies.isPending}
            onChange={(event) => {
              setCompanyId(event.target.value)
              setRequestId('')
              setRequestSearch('')
            }}
            value={companyId}
          >
            <option value="">Choose an active company</option>
            {companies.data?.items.map((company) => (
              <option key={company.companyId} value={company.companyId}>
                {company.name}
              </option>
            ))}
          </SelectField>
        </label>

        <label>
          <span>Search requests</span>
          <SearchInput
            aria-label="Search internship requests in selector"
            disabled={!companyId}
            onChange={(event) => setRequestSearch(event.target.value)}
            placeholder="Search role title or request details"
            value={requestSearch}
          />
        </label>

        <label>
          <span>Select internship request</span>
          <SelectField
            aria-label="Select internship request for candidate filtering"
            disabled={!companyId || requests.isPending}
            onChange={(event) => setRequestId(event.target.value)}
            value={requestId}
          >
            <option value="">
              {companyId ? 'Choose an active internship request' : 'Select a company first'}
            </option>
            {requests.data?.items.map((request) => (
              <option key={request.requestId} value={request.requestId}>
                {request.title}
              </option>
            ))}
          </SelectField>
        </label>

        {companyId && requests.data?.items.length === 0 ? (
          <p className="modal-helper-text">No active requests match this company and search.</p>
        ) : null}

        <div className="modal-actions">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={!requestId}
            onClick={() => {
              onSelect(requestId)
              onClose()
            }}
          >
            Select request
          </Button>
        </div>
      </div>
    </Modal>
  )
}