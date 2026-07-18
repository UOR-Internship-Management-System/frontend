import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { CvProfileSourceItem } from '../hooks/useCvProfileSources'

export type CvProfileSourceGroupState = {
  items?: CvProfileSourceItem[]
  isPending: boolean
  error?: { message: string; correlationId?: string } | null
  onRetry: () => void
}

export function CvProfileSourceGroup({
  enabled,
  error,
  isPending,
  items,
  manageLabel,
  onRetry,
  onToggle,
  title,
}: {
  title: string
  manageLabel: string
  enabled: boolean
  items?: CvProfileSourceItem[]
  isPending: boolean
  error?: { message: string; correlationId?: string } | null
  onRetry: () => void
  onToggle: () => void
}) {
  return (
    <fieldset className="s5-cv-source-fieldset">
      <legend>
        <label>
          <input checked={enabled} onChange={onToggle} type="checkbox" />
          <span>{title}</span>
        </label>
      </legend>
      {!enabled ? (
        <p className="s5-inline-guidance">
          This section is excluded, even if records below are marked for CV inclusion.
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
        <ul aria-label={`${title} CV inclusion`} className="s5-cv-source-list">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.label}</span>
              <StatusBadge tone={item.cvInclude ? 'success' : 'neutral'}>
                {item.cvInclude ? 'Included in CV' : 'Excluded from CV'}
              </StatusBadge>
            </li>
          ))}
        </ul>
      ) : null}
      <a aria-label={`Manage ${manageLabel} in Profile`} href="/student/profile">
        Manage in Profile
      </a>
    </fieldset>
  )
}
