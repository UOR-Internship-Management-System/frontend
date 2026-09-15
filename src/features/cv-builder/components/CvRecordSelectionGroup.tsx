import { Link } from 'react-router-dom'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { Checkbox } from '../../../shared/components/forms/Checkbox'

const maximumSelectedRecords = 100

export type CvSelectionItem = {
  id: string
  label: string
  defaultSelected: boolean
}

export type CvSelectionGroupState = {
  items?: CvSelectionItem[]
  isPending: boolean
  error?: { message: string; correlationId?: string } | null
  onRetry: () => void
}

export function CvRecordSelectionGroup({
  error,
  isPending,
  items,
  manageHref,
  manageLabel,
  onRetry,
  onToggle,
  selectedIds,
  title,
}: CvSelectionGroupState & {
  title: string
  manageLabel: string
  manageHref: string
  selectedIds: readonly string[]
  onToggle: (recordId: string) => void
}) {
  return (
    <fieldset className="s5-cv-source-fieldset">
      <legend>{title}</legend>
      {items?.length ? (
        <p aria-hidden="true" className="s5-cv-source-count">
          {selectedIds.length}/{items.length} selected
        </p>
      ) : null}
      {isPending ? (
        <div aria-label={`Loading ${title}`} role="status">
          <SkeletonBlock lines={3} />
        </div>
      ) : null}
      {error ? (
        <ErrorState
          correlationId={error.correlationId}
          message={error.message}
          onAction={onRetry}
          title={`${title} unavailable`}
        />
      ) : null}
      {!isPending && !error && items?.length === 0 ? (
        <p className="s5-inline-guidance">No {title.toLowerCase()} records are available.</p>
      ) : null}
      {!isPending && !error && items?.length ? (
        <div className="s5-cv-record-options">
          {items.map((item) => {
            const selected = selectedIds.includes(item.id)
            return (
              <Checkbox
                checked={selected}
                disabled={!selected && selectedIds.length >= maximumSelectedRecords}
                key={item.id}
                label={item.label}
                onChange={() => onToggle(item.id)}
              />
            )
          })}
        </div>
      ) : null}
      {selectedIds.length >= maximumSelectedRecords ? (
        <p className="s5-inline-guidance" role="status">
          The maximum of {maximumSelectedRecords} records is selected for this group.
        </p>
      ) : null}
      <Link
        aria-label={`Manage ${manageLabel}`}
        className="s5-cv-manage-link button m3-button button-text m3-button--text m3-button--size-md"
        to={manageHref}
      >
        <span className="button-content">Manage {manageLabel}</span>
      </Link>
    </fieldset>
  )
}
