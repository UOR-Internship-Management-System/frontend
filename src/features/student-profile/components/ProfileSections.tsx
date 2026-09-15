import { useState, type ReactNode } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Dialog, type DialogSize } from '../../../shared/components/overlays/Dialog'
import { Menu, MenuItem } from '../../../shared/components/overlays/Menu'
import { Button } from '../../../shared/components/ui/Button'
import { IconButton } from '../../../shared/components/ui/IconButton'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useCertificateEvidenceMutations } from '../hooks/useCertificateEvidenceMutations'
import {
  useActivities,
  useActivityMutations,
  useAwards,
  useAwardMutations,
  useCertificates,
  useCertificateMutations,
  useContactLinkMutations,
  useContactLinks,
  useEducation,
  useEducationMutations,
  useExperience,
  useExperienceMutations,
} from '../hooks/useProfileEntries'
import { PROFILE_SECTION_PAGE_SIZE } from '../types/profileEntryTypes'
import type {
  Activity,
  ActivityRequest,
  Award,
  AwardRequest,
  Certificate,
  CertificateRequest,
  ContactLink,
  ContactLinkRequest,
  Education,
  EducationRequest,
  Experience,
  ExperienceRequest,
  ProfileCollectionQuery,
  VersionedProfileEntry,
} from '../types/profileEntryTypes'
import type { FileUploadConstraint } from '../types/profileFileTypes'
import { ActivityEditor } from './ActivityEditor'
import { AwardEditor } from './AwardEditor'
import { CertificateEditor } from './CertificateEditor'
import { ContactLinkEditor } from './ContactLinkEditor'
import { EducationEditor } from './EducationEditor'
import { ExperienceEditor } from './ExperienceEditor'
import { ProfileCollectionEmpty, ProfileCollectionSection } from './ProfileCollectionSection'
import { ProfileEntryCard } from './ProfileEntryCard'

function useProfileSectionState(sort: string) {
  const [search, setSearchValue] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebouncedValue(search, 300)
  const setSearch = (value: string) => {
    setSearchValue(value)
    setPage(0)
  }
  const query: ProfileCollectionQuery = {
    page,
    size: PROFILE_SECTION_PAGE_SIZE,
    sort,
    search: debouncedSearch,
  }
  return { page, query, search, setPage, setSearch }
}

function EntryActions({
  disabled,
  entryLabel,
  extraItems,
  onDelete,
  onEdit,
}: {
  disabled: boolean
  entryLabel: string
  extraItems?: (closeMenu: () => void) => ReactNode
  onDelete: () => void
  onEdit: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="profile-entry-actions-row">
      <IconButton
        aria-label={`Actions for ${entryLabel}`}
        disabled={disabled}
        icon={
          <span className="material-symbols-outlined" aria-hidden="true">
            more_vert
          </span>
        }
        onClick={() => setIsOpen((current) => !current)}
        onMouseDown={(event) => event.stopPropagation()}
        size="sm"
      />
      <Menu
        aria-label={`Actions for ${entryLabel}`}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <MenuItem
          icon={
            <span className="material-symbols-outlined" aria-hidden="true">
              edit
            </span>
          }
          onClick={() => {
            setIsOpen(false)
            onEdit()
          }}
        >
          Edit
        </MenuItem>
        {extraItems?.(() => setIsOpen(false))}
        <MenuItem
          destructive
          icon={
            <span className="material-symbols-outlined" aria-hidden="true">
              delete
            </span>
          }
          onClick={() => {
            setIsOpen(false)
            onDelete()
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  )
}

function ProfileEditorDialog({
  children,
  closeDisabled,
  onClose,
  size,
  title,
}: {
  children: (controls: {
    onCancel: () => void
    onDirtyChange: (isDirty: boolean) => void
  }) => ReactNode
  closeDisabled: boolean
  onClose: () => void
  size: DialogSize
  title: string
}) {
  const [isDirty, setIsDirty] = useState(false)
  const [isDiscardOpen, setIsDiscardOpen] = useState(false)
  const requestClose = () => {
    if (isDirty) setIsDiscardOpen(true)
    else onClose()
  }

  return (
    <>
      <Dialog
        adaptiveFullscreen
        closeDisabled={closeDisabled}
        closeOnBackdrop={false}
        isOpen
        onClose={requestClose}
        size={size}
        title={title}
      >
        {children({ onCancel: requestClose, onDirtyChange: setIsDirty })}
      </Dialog>
      {isDiscardOpen ? (
        <ConfirmDialog onClose={() => setIsDiscardOpen(false)} title="Discard unsaved changes?">
          <p>Your changes in this editor will be lost.</p>
          <div className="modal-actions">
            <Button onClick={() => setIsDiscardOpen(false)} variant="secondary">
              Keep editing
            </Button>
            <Button onClick={onClose}>Discard changes</Button>
          </div>
        </ConfirmDialog>
      ) : null}
    </>
  )
}

function DeleteDialog({
  entryName,
  itemTitle,
  isPending,
  onCancel,
  onConfirm,
}: {
  entryName: string
  itemTitle: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <ConfirmDialog closeDisabled={isPending} onClose={onCancel} title={`Remove ${entryName}`}>
      <p>
        “{itemTitle}” will be permanently removed from your profile. This action cannot be undone.
      </p>
      <div className="modal-actions">
        <Button disabled={isPending} onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button isLoading={isPending} onClick={onConfirm} variant="danger">
          Remove {entryName}
        </Button>
      </div>
    </ConfirmDialog>
  )
}

function notifyFailure(
  notify: ReturnType<typeof useNotifications>['notify'],
  error: unknown,
  title: string,
) {
  const mapped = mapApiError(error, 'protected')
  notify({
    tone: 'error',
    title,
    message: mapped.correlationId
      ? `${mapped.message} Reference: ${mapped.correlationId}`
      : mapped.message,
  })
}

function afterDelete<T extends VersionedProfileEntry>(
  items: T[],
  page: number,
  setPage: (page: number) => void,
) {
  if (items.length === 1 && page > 0) setPage(page - 1)
}

export function ProfessionalLinksSection() {
  const state = useProfileSectionState('displayOrder,asc')
  const query = useContactLinks(state.query)
  const mutations = useContactLinkMutations()
  const { notify } = useNotifications()
  const [editing, setEditing] = useState<ContactLink | 'new' | null>(null)
  const [deleting, setDeleting] = useState<ContactLink | null>(null)
  const pending =
    mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending
  const save = async (values: ContactLinkRequest) => {
    const item =
      editing === 'new'
        ? await mutations.create.mutateAsync(values)
        : await mutations.update.mutateAsync({ id: editing!.id, version: editing!.version, values })
    notify({
      tone: 'success',
      title: editing === 'new' ? 'Professional Link added' : 'Professional Link updated',
      message: `${item.label} was saved.`,
    })
    setEditing(null)
  }
  const remove = async () => {
    if (!deleting) return
    try {
      await mutations.remove.mutateAsync({ id: deleting.id, version: deleting.version })
      afterDelete(query.data?.items ?? [], state.page, state.setPage)
      notify({
        tone: 'success',
        title: 'Professional Link deleted',
        message: `${deleting.label} was removed.`,
      })
      setDeleting(null)
    } catch (error) {
      notifyFailure(notify, error, 'Unable to delete Professional Link')
    }
  }
  const items = query.data?.items ?? []
  return (
    <>
      <ProfileCollectionSection
        addAriaLabel="Add professional link"
        addLabel="Add"
        description="Add safe links to professional profiles and portfolio sites."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        savedTitle="Saved professional links"
        search={state.search}
        searchLabel="Search professional links"
        title="Professional links"
      >
        {items.length === 0 ? (
          <ProfileCollectionEmpty
            onAdd={() => setEditing('new')}
            search={state.search}
            title="Professional links"
          />
        ) : (
          <div className="profile-entry-list">
            {items.map((item) => (
              <ProfileEntryCard
                actions={
                  <EntryActions
                    disabled={pending}
                    entryLabel={item.label}
                    onDelete={() => setDeleting(item)}
                    onEdit={() => setEditing(item)}
                  />
                }
                cvInclude={item.cvInclude}
                key={item.id}
                subtitle={`Display order ${item.displayOrder}`}
                title={item.label}
              >
                <a href={item.url} rel="noopener noreferrer" target="_blank">
                  {item.url}
                </a>
              </ProfileEntryCard>
            ))}
          </div>
        )}
      </ProfileCollectionSection>
      {editing ? (
        <ProfileEditorDialog
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          size="medium"
          title={editing === 'new' ? 'Add professional link' : 'Edit professional link'}
        >
          {({ onCancel, onDirtyChange }) => (
            <ContactLinkEditor
              isPending={pending}
              item={editing === 'new' ? undefined : editing}
              onCancel={onCancel}
              onDirtyChange={onDirtyChange}
              onSubmit={save}
            />
          )}
        </ProfileEditorDialog>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="professional link"
          itemTitle={deleting.label}
          isPending={mutations.remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
        />
      ) : null}
    </>
  )
}

export function EducationSection() {
  const state = useProfileSectionState('startDate,desc')
  const query = useEducation(state.query)
  const mutations = useEducationMutations()
  const { notify } = useNotifications()
  const [editing, setEditing] = useState<Education | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Education | null>(null)
  const pending =
    mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending
  const save = async (values: EducationRequest) => {
    const item =
      editing === 'new'
        ? await mutations.create.mutateAsync(values)
        : await mutations.update.mutateAsync({ id: editing!.id, version: editing!.version, values })
    notify({
      tone: 'success',
      title: editing === 'new' ? 'Education added' : 'Education updated',
      message: `${item.degree} was saved.`,
    })
    setEditing(null)
  }
  const remove = async () => {
    if (!deleting) return
    try {
      await mutations.remove.mutateAsync({ id: deleting.id, version: deleting.version })
      afterDelete(query.data?.items ?? [], state.page, state.setPage)
      setDeleting(null)
      notify({ tone: 'success', title: 'Education deleted', message: 'The entry was removed.' })
    } catch (error) {
      notifyFailure(notify, error, 'Unable to delete Education entry')
    }
  }
  const items = query.data?.items ?? []
  return (
    <>
      <ProfileCollectionSection
        addAriaLabel="Add education"
        addLabel="Add"
        description="Record your academic history, from school through ongoing programs."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        savedTitle="Saved education"
        search={state.search}
        searchLabel="Search education entries"
        title="Education"
      >
        {items.length === 0 ? (
          <ProfileCollectionEmpty
            onAdd={() => setEditing('new')}
            search={state.search}
            title="Education"
          />
        ) : (
          <div className="profile-entry-list">
            {items.map((item) => (
              <ProfileEntryCard
                actions={
                  <EntryActions
                    disabled={pending}
                    entryLabel={item.degree}
                    onDelete={() => setDeleting(item)}
                    onEdit={() => setEditing(item)}
                  />
                }
                cvInclude={item.cvInclude}
                key={item.id}
                subtitle={`${item.institution}${item.location ? ` · ${item.location}` : ''}${item.startDate ? ` · ${item.startDate} – ${item.current ? 'Present' : (item.endDate ?? '')}` : ''}`}
                title={item.degree}
              >
                {item.resultNote ? <p>{item.resultNote}</p> : null}
              </ProfileEntryCard>
            ))}
          </div>
        )}
      </ProfileCollectionSection>
      {editing ? (
        <ProfileEditorDialog
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          size="large"
          title={editing === 'new' ? 'Add education' : 'Edit education'}
        >
          {({ onCancel, onDirtyChange }) => (
            <EducationEditor
              isPending={pending}
              item={editing === 'new' ? undefined : editing}
              onCancel={onCancel}
              onDirtyChange={onDirtyChange}
              onSubmit={save}
            />
          )}
        </ProfileEditorDialog>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="education entry"
          itemTitle={deleting.degree}
          isPending={mutations.remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
        />
      ) : null}
    </>
  )
}

export function CertificatesSection({ evidencePolicy }: { evidencePolicy?: FileUploadConstraint }) {
  const state = useProfileSectionState('issueDate,desc')
  const query = useCertificates(state.query)
  const mutations = useCertificateMutations()
  const evidenceMutations = useCertificateEvidenceMutations()
  const { notify } = useNotifications()
  const [editing, setEditing] = useState<Certificate | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Certificate | null>(null)
  const [removingEvidence, setRemovingEvidence] = useState<Certificate | null>(null)
  const pending =
    mutations.create.isPending ||
    mutations.update.isPending ||
    mutations.remove.isPending ||
    evidenceMutations.upload.isPending ||
    evidenceMutations.remove.isPending
  const save = async (values: CertificateRequest, evidence?: File) => {
    const createdOrUpdated =
      editing === 'new'
        ? await mutations.create.mutateAsync(values)
        : await mutations.update.mutateAsync({ id: editing!.id, version: editing!.version, values })
    if (evidence) {
      try {
        await evidenceMutations.upload.mutateAsync({
          certificateId: createdOrUpdated.id,
          file: evidence,
          version: createdOrUpdated.version,
        })
      } catch (error) {
        notifyFailure(notify, error, 'Certificate saved, but evidence upload failed')
        setEditing(null)
        return
      }
    }
    notify({
      tone: 'success',
      title: editing === 'new' ? 'Certificate added' : 'Certificate updated',
      message: `${createdOrUpdated.title} was saved.`,
    })
    setEditing(null)
  }
  const remove = async () => {
    if (!deleting) return
    try {
      await mutations.remove.mutateAsync({ id: deleting.id, version: deleting.version })
      afterDelete(query.data?.items ?? [], state.page, state.setPage)
      notify({
        tone: 'success',
        title: 'Certificate deleted',
        message: `${deleting.title} was removed.`,
      })
      setDeleting(null)
    } catch (error) {
      notifyFailure(notify, error, 'Unable to delete Certificate')
    }
  }
  const removeEvidence = async () => {
    if (!removingEvidence) return
    try {
      await evidenceMutations.remove.mutateAsync({
        certificateId: removingEvidence.id,
        version: removingEvidence.version,
      })
      notify({
        tone: 'success',
        title: 'Evidence removed',
        message: `Evidence for ${removingEvidence.title} was removed.`,
      })
      setRemovingEvidence(null)
    } catch (error) {
      notifyFailure(notify, error, 'Unable to remove evidence')
    }
  }
  const items = query.data?.items ?? []
  return (
    <>
      <ProfileCollectionSection
        addAriaLabel="Add certificate"
        addLabel="Add"
        description="Record credentials and attach optional supporting evidence."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        savedTitle="Saved certificates"
        search={state.search}
        searchLabel="Search certificates"
        title="Certificates"
      >
        {items.length === 0 ? (
          <ProfileCollectionEmpty
            onAdd={() => setEditing('new')}
            search={state.search}
            title="Certificates"
          />
        ) : (
          <div className="profile-entry-list">
            {items.map((item) => (
              <ProfileEntryCard
                actions={
                  <EntryActions
                    disabled={pending}
                    entryLabel={item.title}
                    extraItems={(closeMenu) =>
                      item.evidence ? (
                        <MenuItem
                          icon={
                            <span className="material-symbols-outlined" aria-hidden="true">
                              attach_file_off
                            </span>
                          }
                          onClick={() => {
                            closeMenu()
                            setRemovingEvidence(item)
                          }}
                        >
                          Remove evidence
                        </MenuItem>
                      ) : null
                    }
                    onDelete={() => setDeleting(item)}
                    onEdit={() => setEditing(item)}
                  />
                }
                cvInclude={item.cvInclude}
                key={item.id}
                subtitle={`${item.issuer} · ${item.issueDate}`}
                title={item.title}
              >
                {item.credentialUrl ? (
                  <a href={item.credentialUrl} rel="noopener noreferrer" target="_blank">
                    View credential
                  </a>
                ) : null}
                {item.evidence ? (
                  <p>
                    <a href={item.evidence.url} rel="noopener noreferrer" target="_blank">
                      {item.evidence.fileName}
                    </a>{' '}
                    · {item.evidence.mimeType} · {item.evidence.fileSizeBytes.toLocaleString()}{' '}
                    bytes
                  </p>
                ) : (
                  <p>No evidence uploaded.</p>
                )}
              </ProfileEntryCard>
            ))}
          </div>
        )}
      </ProfileCollectionSection>
      {editing ? (
        <ProfileEditorDialog
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          size="large"
          title={editing === 'new' ? 'Add certificate' : 'Edit certificate'}
        >
          {({ onCancel, onDirtyChange }) => (
            <CertificateEditor
              evidencePolicy={evidencePolicy}
              isPending={pending}
              item={editing === 'new' ? undefined : editing}
              onCancel={onCancel}
              onDirtyChange={onDirtyChange}
              onSubmit={save}
            />
          )}
        </ProfileEditorDialog>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="certificate"
          itemTitle={deleting.title}
          isPending={mutations.remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
        />
      ) : null}
      {removingEvidence ? (
        <ConfirmDialog
          closeDisabled={evidenceMutations.remove.isPending}
          onClose={() => setRemovingEvidence(null)}
          title="Remove certificate evidence"
        >
          <p>This removes only the supporting file. The certificate remains saved.</p>
          <div className="modal-actions">
            <Button
              disabled={evidenceMutations.remove.isPending}
              onClick={() => setRemovingEvidence(null)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              isLoading={evidenceMutations.remove.isPending}
              onClick={() => void removeEvidence()}
            >
              Remove evidence
            </Button>
          </div>
        </ConfirmDialog>
      ) : null}
    </>
  )
}

export function AwardsSection() {
  const state = useProfileSectionState('awardDate,desc')
  const query = useAwards(state.query)
  const mutations = useAwardMutations()
  const { notify } = useNotifications()
  const [editing, setEditing] = useState<Award | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Award | null>(null)
  const pending =
    mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending
  const save = async (values: AwardRequest) => {
    const item =
      editing === 'new'
        ? await mutations.create.mutateAsync(values)
        : await mutations.update.mutateAsync({ id: editing!.id, version: editing!.version, values })
    notify({
      tone: 'success',
      title: editing === 'new' ? 'Award added' : 'Award updated',
      message: `${item.title} was saved.`,
    })
    setEditing(null)
  }
  const remove = async () => {
    if (!deleting) return
    try {
      await mutations.remove.mutateAsync({ id: deleting.id, version: deleting.version })
      afterDelete(query.data?.items ?? [], state.page, state.setPage)
      setDeleting(null)
      notify({ tone: 'success', title: 'Award deleted', message: 'The Award was removed.' })
    } catch (error) {
      notifyFailure(notify, error, 'Unable to delete Award')
    }
  }
  const items = query.data?.items ?? []
  return (
    <>
      <ProfileCollectionSection
        addAriaLabel="Add award or achievement"
        addLabel="Add"
        description="Record awards, achievements, and recognitions."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        savedTitle="Saved awards and achievements"
        search={state.search}
        searchLabel="Search awards and achievements"
        title="Awards and achievements"
      >
        {items.length === 0 ? (
          <ProfileCollectionEmpty
            onAdd={() => setEditing('new')}
            search={state.search}
            title="Awards"
          />
        ) : (
          <div className="profile-entry-list">
            {items.map((item) => (
              <ProfileEntryCard
                actions={
                  <EntryActions
                    disabled={pending}
                    entryLabel={item.title}
                    onDelete={() => setDeleting(item)}
                    onEdit={() => setEditing(item)}
                  />
                }
                cvInclude={item.cvInclude}
                key={item.id}
                subtitle={`${item.issuer} · ${item.awardDate}`}
                title={item.title}
              >
                {item.description ? <p>{item.description}</p> : null}
              </ProfileEntryCard>
            ))}
          </div>
        )}
      </ProfileCollectionSection>
      {editing ? (
        <ProfileEditorDialog
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          size="large"
          title={editing === 'new' ? 'Add award or achievement' : 'Edit award or achievement'}
        >
          {({ onCancel, onDirtyChange }) => (
            <AwardEditor
              isPending={pending}
              item={editing === 'new' ? undefined : editing}
              onCancel={onCancel}
              onDirtyChange={onDirtyChange}
              onSubmit={save}
            />
          )}
        </ProfileEditorDialog>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="award or achievement"
          itemTitle={deleting.title}
          isPending={mutations.remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
        />
      ) : null}
    </>
  )
}

export function ActivitiesSection() {
  const state = useProfileSectionState('startDate,desc')
  const query = useActivities(state.query)
  const mutations = useActivityMutations()
  const { notify } = useNotifications()
  const [editing, setEditing] = useState<Activity | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Activity | null>(null)
  const pending =
    mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending
  const save = async (values: ActivityRequest) => {
    const item =
      editing === 'new'
        ? await mutations.create.mutateAsync(values)
        : await mutations.update.mutateAsync({ id: editing!.id, version: editing!.version, values })
    notify({
      tone: 'success',
      title: editing === 'new' ? 'Activity added' : 'Activity updated',
      message: `${item.activityName} was saved.`,
    })
    setEditing(null)
  }
  const remove = async () => {
    if (!deleting) return
    try {
      await mutations.remove.mutateAsync({ id: deleting.id, version: deleting.version })
      afterDelete(query.data?.items ?? [], state.page, state.setPage)
      setDeleting(null)
      notify({ tone: 'success', title: 'Activity deleted', message: 'The Activity was removed.' })
    } catch (error) {
      notifyFailure(notify, error, 'Unable to delete Activity')
    }
  }
  const items = query.data?.items ?? []
  return (
    <>
      <ProfileCollectionSection
        addAriaLabel="Add extracurricular activity"
        addLabel="Add"
        description="Record extracurricular, volunteer, and organizational roles."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        savedTitle="Saved extracurricular activities"
        search={state.search}
        searchLabel="Search extracurricular activities"
        title="Extracurricular activities"
      >
        {items.length === 0 ? (
          <ProfileCollectionEmpty
            onAdd={() => setEditing('new')}
            search={state.search}
            title="Activities"
          />
        ) : (
          <div className="profile-entry-list">
            {items.map((item) => (
              <ProfileEntryCard
                actions={
                  <EntryActions
                    disabled={pending}
                    entryLabel={item.activityName}
                    onDelete={() => setDeleting(item)}
                    onEdit={() => setEditing(item)}
                  />
                }
                cvInclude={item.cvInclude}
                key={item.id}
                subtitle={`${item.roleTitle}${item.startDate ? ` · ${item.startDate} – ${item.endDate ?? 'Present'}` : ''}`}
                title={item.activityName}
              >
                {item.description ? <p>{item.description}</p> : null}
              </ProfileEntryCard>
            ))}
          </div>
        )}
      </ProfileCollectionSection>
      {editing ? (
        <ProfileEditorDialog
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          size="large"
          title={
            editing === 'new' ? 'Add extracurricular activity' : 'Edit extracurricular activity'
          }
        >
          {({ onCancel, onDirtyChange }) => (
            <ActivityEditor
              isPending={pending}
              item={editing === 'new' ? undefined : editing}
              onCancel={onCancel}
              onDirtyChange={onDirtyChange}
              onSubmit={save}
            />
          )}
        </ProfileEditorDialog>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="extracurricular activity"
          itemTitle={deleting.activityName}
          isPending={mutations.remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
        />
      ) : null}
    </>
  )
}

export function ExperienceSection() {
  const state = useProfileSectionState('startDate,desc')
  const query = useExperience(state.query)
  const mutations = useExperienceMutations()
  const { notify } = useNotifications()
  const [editing, setEditing] = useState<Experience | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Experience | null>(null)
  const pending =
    mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending
  const save = async (values: ExperienceRequest) => {
    const item =
      editing === 'new'
        ? await mutations.create.mutateAsync(values)
        : await mutations.update.mutateAsync({ id: editing!.id, version: editing!.version, values })
    notify({
      tone: 'success',
      title: editing === 'new' ? 'Experience added' : 'Experience updated',
      message: `${item.positionTitle} was saved.`,
    })
    setEditing(null)
  }
  const remove = async () => {
    if (!deleting) return
    try {
      await mutations.remove.mutateAsync({ id: deleting.id, version: deleting.version })
      afterDelete(query.data?.items ?? [], state.page, state.setPage)
      setDeleting(null)
      notify({
        tone: 'success',
        title: 'Experience deleted',
        message: 'The Experience was removed.',
      })
    } catch (error) {
      notifyFailure(notify, error, 'Unable to delete Experience')
    }
  }
  const items = query.data?.items ?? []
  return (
    <>
      <ProfileCollectionSection
        addAriaLabel="Add professional experience"
        addLabel="Add"
        description="Record professional roles and responsibilities."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        savedTitle="Saved professional experience"
        search={state.search}
        searchLabel="Search professional experience"
        title="Professional experience"
      >
        {items.length === 0 ? (
          <ProfileCollectionEmpty
            onAdd={() => setEditing('new')}
            search={state.search}
            title="Experience entries"
          />
        ) : (
          <div className="profile-entry-list">
            {items.map((item) => (
              <ProfileEntryCard
                actions={
                  <EntryActions
                    disabled={pending}
                    entryLabel={item.positionTitle}
                    onDelete={() => setDeleting(item)}
                    onEdit={() => setEditing(item)}
                  />
                }
                cvInclude={item.cvInclude}
                key={item.id}
                subtitle={`${item.organization}${item.location ? ` · ${item.location}` : ''} · ${item.startDate} – ${item.currentRole ? 'Present' : item.endDate}`}
                title={item.positionTitle}
              >
                {item.description ? <p>{item.description}</p> : null}
              </ProfileEntryCard>
            ))}
          </div>
        )}
      </ProfileCollectionSection>
      {editing ? (
        <ProfileEditorDialog
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          size="large"
          title={editing === 'new' ? 'Add professional experience' : 'Edit professional experience'}
        >
          {({ onCancel, onDirtyChange }) => (
            <ExperienceEditor
              isPending={pending}
              item={editing === 'new' ? undefined : editing}
              onCancel={onCancel}
              onDirtyChange={onDirtyChange}
              onSubmit={save}
            />
          )}
        </ProfileEditorDialog>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="professional experience"
          itemTitle={deleting.positionTitle}
          isPending={mutations.remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
        />
      ) : null}
    </>
  )
}
