import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'

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
              <label key={item.id}>
                <input
                  checked={selected}
                  disabled={!selected && selectedIds.length >= maximumSelectedRecords}
                  onChange={() => onToggle(item.id)}
                  type="checkbox"
                />
                <span>{item.label}</span>
              </label>
            )
          })}
        </div>
      ) : null}
      {selectedIds.length >= maximumSelectedRecords ? (
        <p className="s5-inline-guidance" role="status">
          The maximum of {maximumSelectedRecords} records is selected for this group.
        </p>
      ) : null}
      <a aria-label={`Manage ${manageLabel}`} href={manageHref}>
        Manage {manageLabel}
      </a>
    </fieldset>
  )
}
