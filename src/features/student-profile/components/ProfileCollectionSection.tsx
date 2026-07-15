import type { ReactNode } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { Button } from '../../../shared/components/ui/Button'
import type { PageMetadata } from '../types/profileEntryTypes'

export function ProfileCollectionSection({
  addLabel,
  children,
  description,
  error,
  isFetching,
  isPending,
  onAdd,
  onPageChange,
  onRetry,
  onSearchChange,
  page,
  search,
  searchLabel,
  title,
}: {
  addLabel: string
  children: ReactNode
  description: string
  error: unknown
  isFetching: boolean
  isPending: boolean
  onAdd: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onSearchChange: (value: string) => void
  page?: PageMetadata
  search: string
  searchLabel: string
  title: string
}) {
  const mappedError = error ? mapApiError(error, 'protected') : null
  return (
    <section
      className="section-card profile-collection"
      aria-labelledby={`${title.replaceAll(' ', '-').toLowerCase()}-title`}
      aria-busy={isFetching || undefined}
    >
      <div className="profile-section-heading">
        <div>
          <h2 id={`${title.replaceAll(' ', '-').toLowerCase()}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
        <Button onClick={onAdd}>{addLabel}</Button>
      </div>
      <SearchInput
        aria-label={searchLabel}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchLabel}
        value={search}
      />
      {isFetching && !isPending ? (
        <p className="profile-refresh-status" role="status">
          Updating results…
        </p>
      ) : null}
      {isPending ? (
        <div aria-label={`Loading ${title}`} className="profile-section-skeleton" role="status">
          <SkeletonBlock lines={3} />
          <SkeletonBlock lines={3} />
        </div>
      ) : null}
      {mappedError ? (
        <ErrorState
          correlationId={mappedError.correlationId}
          message={mappedError.message}
          onAction={onRetry}
          title={`${title} unavailable`}
        />
      ) : null}
      {!isPending && !mappedError ? children : null}
      {page && page.totalPages > 0 ? (
        <PaginationBar
          label={`${title} pagination`}
          onPageChange={onPageChange}
          page={page.page}
          size={page.size}
          totalElements={page.totalElements}
          totalPages={page.totalPages}
        />
      ) : null}
    </section>
  )
}

export function ProfileCollectionEmpty({
  onAdd,
  search,
  title,
}: {
  onAdd: () => void
  search: string
  title: string
}) {
  return (
    <EmptyState
      action={
        !search ? (
          <Button onClick={onAdd} variant="secondary">
            Add your first entry
          </Button>
        ) : undefined
      }
      message={
        search
          ? `No ${title.toLowerCase()} match “${search}”.`
          : `No ${title.toLowerCase()} have been saved yet.`
      }
      title={search ? 'No matching entries' : 'Nothing saved yet'}
    />
  )
}
