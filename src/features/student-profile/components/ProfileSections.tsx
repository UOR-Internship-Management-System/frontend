import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import {
  removeCertificateEvidence,
  uploadCertificateEvidence,
} from '../api/studentProfileEntriesApi'
import {
  useActivities,
  useActivityMutations,
  useAwards,
  useAwardMutations,
  useCertificates,
  useCertificateMutations,
  useContactLinkMutations,
  useContactLinks,
  useExperience,
  useExperienceMutations,
} from '../hooks/useProfileEntries'
import { studentProfileKeys } from '../hooks/studentProfileKeys'
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
  onDelete,
  onEdit,
}: {
  disabled: boolean
  onDelete: () => void
  onEdit: () => void
}) {
  return (
    <>
      <Button disabled={disabled} onClick={onEdit} variant="secondary">
        Edit
      </Button>
      <Button disabled={disabled} onClick={onDelete} variant="secondary">
        Delete
      </Button>
    </>
  )
}

function DeleteDialog({
  entryName,
  isPending,
  onCancel,
  onConfirm,
}: {
  entryName: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <ConfirmDialog closeDisabled={isPending} onClose={onCancel} title={`Delete ${entryName}`}>
      <p>
        This permanently removes this {entryName.toLowerCase()} from your profile. This action
        cannot be undone.
      </p>
      <div className="modal-actions">
        <Button disabled={isPending} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button isLoading={isPending} onClick={onConfirm}>
          Delete {entryName}
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
        addLabel="Add Professional Link"
        description="Add safe links to professional profiles and portfolio sites."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        search={state.search}
        searchLabel="Search professional links"
        title="Professional Links"
      >
        {items.length === 0 ? (
          <ProfileCollectionEmpty
            onAdd={() => setEditing('new')}
            search={state.search}
            title="Professional Links"
          />
        ) : (
          <div className="profile-entry-list">
            {items.map((item) => (
              <ProfileEntryCard
                actions={
                  <EntryActions
                    disabled={pending}
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
        <Modal
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          title={editing === 'new' ? 'Add Professional Link' : 'Edit Professional Link'}
        >
          <ContactLinkEditor
            isPending={pending}
            item={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSubmit={save}
          />
        </Modal>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="Professional Link"
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
  const queryClient = useQueryClient()
  const { notify } = useNotifications()
  const [editing, setEditing] = useState<Certificate | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Certificate | null>(null)
  const [removingEvidence, setRemovingEvidence] = useState<Certificate | null>(null)
  const [filePending, setFilePending] = useState(false)
  const pending =
    mutations.create.isPending ||
    mutations.update.isPending ||
    mutations.remove.isPending ||
    filePending
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: studentProfileKeys.collection('certificates'),
    })
  const save = async (values: CertificateRequest, evidence?: File) => {
    const createdOrUpdated =
      editing === 'new'
        ? await mutations.create.mutateAsync(values)
        : await mutations.update.mutateAsync({ id: editing!.id, version: editing!.version, values })
    if (evidence) {
      setFilePending(true)
      try {
        await uploadCertificateEvidence(createdOrUpdated.id, createdOrUpdated.version, evidence)
      } catch (error) {
        notifyFailure(notify, error, 'Certificate saved, but evidence upload failed')
        setEditing(null)
        await refresh()
        return
      } finally {
        setFilePending(false)
      }
    }
    notify({
      tone: 'success',
      title: editing === 'new' ? 'Certificate added' : 'Certificate updated',
      message: `${createdOrUpdated.title} was saved.`,
    })
    setEditing(null)
    await refresh()
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
    setFilePending(true)
    try {
      await removeCertificateEvidence(removingEvidence.id, removingEvidence.version)
      notify({
        tone: 'success',
        title: 'Evidence removed',
        message: `Evidence for ${removingEvidence.title} was removed.`,
      })
      setRemovingEvidence(null)
      await refresh()
    } catch (error) {
      notifyFailure(notify, error, 'Unable to remove evidence')
    } finally {
      setFilePending(false)
    }
  }
  const items = query.data?.items ?? []
  return (
    <>
      <ProfileCollectionSection
        addLabel="Add Certificate"
        description="Record credentials and attach optional supporting evidence."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
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
                  <>
                    <EntryActions
                      disabled={pending}
                      onDelete={() => setDeleting(item)}
                      onEdit={() => setEditing(item)}
                    />
                    {item.evidence ? (
                      <Button
                        disabled={pending}
                        onClick={() => setRemovingEvidence(item)}
                        variant="secondary"
                      >
                        Remove Evidence
                      </Button>
                    ) : null}
                  </>
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
        <Modal
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          title={editing === 'new' ? 'Add Certificate' : 'Edit Certificate'}
        >
          <CertificateEditor
            evidencePolicy={evidencePolicy}
            isPending={pending}
            item={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSubmit={save}
          />
        </Modal>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="Certificate"
          isPending={mutations.remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
        />
      ) : null}
      {removingEvidence ? (
        <ConfirmDialog
          closeDisabled={filePending}
          onClose={() => setRemovingEvidence(null)}
          title="Remove Certificate Evidence"
        >
          <p>This removes only the supporting file. The Certificate remains saved.</p>
          <div className="modal-actions">
            <Button
              disabled={filePending}
              onClick={() => setRemovingEvidence(null)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button isLoading={filePending} onClick={() => void removeEvidence()}>
              Remove Evidence
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
        addLabel="Add Award"
        description="Record awards, achievements, and recognitions."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        search={state.search}
        searchLabel="Search awards and achievements"
        title="Awards and Achievements"
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
        <Modal
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          title={editing === 'new' ? 'Add Award' : 'Edit Award'}
        >
          <AwardEditor
            isPending={pending}
            item={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSubmit={save}
          />
        </Modal>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="Award"
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
        addLabel="Add Activity"
        description="Record extracurricular, volunteer, and organizational roles."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        search={state.search}
        searchLabel="Search extracurricular activities"
        title="Extracurricular Activities"
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
        <Modal
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          title={editing === 'new' ? 'Add Activity' : 'Edit Activity'}
        >
          <ActivityEditor
            isPending={pending}
            item={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSubmit={save}
          />
        </Modal>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="Activity"
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
        addLabel="Add Experience"
        description="Record professional roles and responsibilities."
        error={query.isError ? query.error : null}
        isFetching={query.isFetching}
        isPending={query.isPending}
        onAdd={() => setEditing('new')}
        onPageChange={state.setPage}
        onRetry={() => void query.refetch()}
        onSearchChange={state.setSearch}
        page={query.data?.page}
        search={state.search}
        searchLabel="Search professional experience"
        title="Professional Experience"
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
        <Modal
          closeDisabled={pending}
          onClose={() => setEditing(null)}
          title={editing === 'new' ? 'Add Experience' : 'Edit Experience'}
        >
          <ExperienceEditor
            isPending={pending}
            item={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSubmit={save}
          />
        </Modal>
      ) : null}
      {deleting ? (
        <DeleteDialog
          entryName="Experience"
          isPending={mutations.remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
        />
      ) : null}
    </>
  )
}
