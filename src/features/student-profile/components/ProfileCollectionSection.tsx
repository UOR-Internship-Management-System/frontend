import type { ReactNode } from 'react'
import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { Tooltip } from '../../../shared/components/overlays/Tooltip'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card'
import { ExtendedFab } from '../../../shared/components/ui/ExtendedFab'
import { IconButton } from '../../../shared/components/ui/IconButton'
import type { PageMetadata } from '../types/profileEntryTypes'

export function ProfileCollectionSection({
  addAriaLabel,
  addLabel,
  children,
  defaultOpen = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test',
  description,
  error,
  isFetching,
  isPending,
  onAdd,
  onPageChange,
  onRetry,
  onSearchChange,
  page,
  savedTitle,
  search,
  searchLabel,
  title,
}: {
  addAriaLabel: string
  addLabel: string
  children: ReactNode
  defaultOpen?: boolean
  description: string
  error: unknown
  isFetching: boolean
  isPending: boolean
  onAdd: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onSearchChange: (value: string) => void
  page?: PageMetadata
  savedTitle: string
  search: string
  searchLabel: string
  title: string
}) {
  const mappedError = error ? mapApiError(error, 'protected') : null
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const slug = title.replaceAll(' ', '-').toLowerCase()
  const headingId = `${slug}-title`
  const bodyId = `${slug}-body`
  return (
    <Card
      aria-busy={isFetching || undefined}
      aria-labelledby={headingId}
      className="profile-collection"
      variant="outlined"
    >
      <CardHeader className="s5-section-heading profile-section-heading">
        <div className="profile-section-heading-main">
          <Tooltip label={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}>
            <IconButton
              aria-controls={bodyId}
              aria-expanded={isOpen}
              aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}
              className="profile-section-toggle"
              icon={
                <span className="material-symbols-outlined">
                  {isOpen ? 'expand_less' : 'expand_more'}
                </span>
              }
              onClick={() => setIsOpen((current) => !current)}
              size="sm"
            />
          </Tooltip>
          <div className="profile-section-heading-text">
            <h2 id={headingId}>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="profile-section-actions">
          <SearchBar
            aria-label={searchLabel}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchLabel}
            value={search}
          />
          <ExtendedFab
            aria-label={addAriaLabel}
            className="profile-section-add-btn"
            icon={<span className="material-symbols-outlined" aria-hidden="true">add</span>}
            label={addLabel}
            onClick={onAdd}
          />
        </div>
      </CardHeader>
      {isOpen ? (
        <CardContent className="profile-section-body" id={bodyId}>
          <h3 className="profile-saved-list-title">{savedTitle}</h3>
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
        </CardContent>
      ) : null}
    </Card>
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
          <Button
            icon={<span className="material-symbols-outlined" aria-hidden="true">add</span>}
            onClick={onAdd}
            size="sm"
            variant="tonal"
          >
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
