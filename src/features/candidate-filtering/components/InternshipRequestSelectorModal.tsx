import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { TextField } from '../../../shared/components/forms/TextField'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
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
  })
  const requests = useInternshipRequests(
    companyId
      ? {
          page: 0,
          size: 100,
          sort: 'title,asc',
          search: requestSearch.trim(),
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
      description="Search external company records, then choose an internship request."
      onClose={onClose}
      title="Select an internship request"
    >
      <div className="cf-selector-modal">
        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void Promise.all([companies.refetch(), requests.refetch()])}
            title="Request directory unavailable"
          />
        ) : null}

        <TextField
          id="company-search"
          label="Search companies"
          aria-label="Search companies in request selector"
          onChange={(event) => setCompanySearch(event.target.value)}
          placeholder="Search companies by name"
          value={companySearch}
          leadingIcon={<span className="material-symbols-outlined">search</span>}
        />

        <M3SelectField
          className="cf-modal-field"
          label="Select company"
          aria-label="Select company for candidate filtering"
          disabled={companies.isPending}
          onChange={(value) => {
            setCompanyId(value)
            setRequestId('')
            setRequestSearch('')
          }}
          value={companyId}
          options={[
            { value: '', label: 'Choose a company' },
            ...(companies.data?.items.map((company) => ({
              value: company.companyId,
              label: company.name,
            })) || []),
          ]}
        />

        <TextField
          id="request-search"
          label="Search requests"
          aria-label="Search internship requests in selector"
          disabled={!companyId}
          onChange={(event) => setRequestSearch(event.target.value)}
          placeholder="Search role title or request details"
          value={requestSearch}
          leadingIcon={<span className="material-symbols-outlined">search</span>}
        />

        <M3SelectField
          className="cf-modal-field"
          label="Select internship request"
          aria-label="Select internship request for candidate filtering"
          disabled={!companyId || requests.isPending}
          onChange={(value) => setRequestId(value)}
          value={requestId}
          options={[
            {
              value: '',
              label: companyId ? 'Choose an internship request' : 'Select a company first',
            },
            ...(requests.data?.items.map((request) => ({
              value: request.requestId,
              label: request.title,
            })) || []),
          ]}
        />

        {companyId && requests.data?.items.length === 0 ? (
          <p className="cf-modal-helper-text">No requests match this company and search.</p>
        ) : null}

        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
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
