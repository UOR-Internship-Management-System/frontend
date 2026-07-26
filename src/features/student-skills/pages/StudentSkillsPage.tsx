import { useMemo, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { FormErrorMessage } from '../../../shared/components/forms/FormErrorMessage'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { AddSkillOptionsSkeleton, DeclaredSkillsListSkeleton } from '../../../shared/skeletons'
import { indexSkillTaxonomy, useSkillTaxonomyTree } from '../../../shared/skill-taxonomy'
import type { IndividualSkill } from '../../../shared/skill-taxonomy'
import { clampPage } from '../../../shared/utils/clampPage'
import { DeclaredSkillForm } from '../components/DeclaredSkillForm'
import { DeclaredSkillsTable } from '../components/DeclaredSkillsTable'
import { SkillTaxonomyBrowser } from '../components/SkillTaxonomyBrowser'
import {
  useCreateDeclaredSkill,
  useDeleteDeclaredSkill,
  useUpdateDeclaredSkill,
} from '../hooks/useDeclaredSkillMutations'
import { useAllDeclaredSkills, useDeclaredSkills } from '../hooks/useDeclaredSkills'
import type { CompetencyLevel, DeclaredSkill } from '../types/studentSkillTypes'

const declaredPageSize = 6
const declaredSort = 'skillName,asc'

export function StudentSkillsPage() {
  const { notify } = useNotifications()
  const [selectedSkill, setSelectedSkill] = useState<IndividualSkill | null>(null)
  const [availableSearch, setAvailableSearch] = useState('')
  const [declaredSearch, setDeclaredSearch] = useState('')
  const [page, setPage] = useState(0)
  const [removeTarget, setRemoveTarget] = useState<DeclaredSkill | null>(null)
  const [removeError, setRemoveError] = useState<string>()
  const [conflictMessage, setConflictMessage] = useState<string>()
  const debouncedDeclaredSearch = useDebouncedValue(declaredSearch.trim(), 300)

  const declared = useDeclaredSkills({
    page,
    size: declaredPageSize,
    sort: declaredSort,
    search: debouncedDeclaredSearch || undefined,
  })
  const allDeclared = useAllDeclaredSkills()
  const taxonomyTree = useSkillTaxonomyTree()
  const taxonomyIndex = useMemo(
    () => (taxonomyTree.data ? indexSkillTaxonomy(taxonomyTree.data) : null),
    [taxonomyTree.data],
  )
  const declaredSkillIds = useMemo(
    () => new Set(allDeclared.data?.map((item) => item.skillId) ?? []),
    [allDeclared.data],
  )
  const createMutation = useCreateDeclaredSkill()
  const updateMutation = useUpdateDeclaredSkill()
  const deleteMutation = useDeleteDeclaredSkill()

  const handleRecoverableError = async (reason: unknown) => {
    const error = mapApiError(reason, 'protected')
    if (error.status === 412) {
      setConflictMessage(
        'This record changed after you loaded it. Review the latest version, then retry your change.',
      )
      await declared.refetch()
    } else if (error.status === 404) {
      await declared.refetch()
    }
  }

  const addSkill = async (competencyLevel: CompetencyLevel) => {
    if (!selectedSkill) throw new TypeError('Select a taxonomy skill before adding it.')
    if (declaredSkillIds.has(selectedSkill.skillId)) {
      throw {
        title: 'Duplicate declared skill',
        status: 409,
        code: 'DUPLICATE_DECLARED_SKILL',
        message: 'This skill is already declared.',
      }
    }

    try {
      await createMutation.mutateAsync({ skillId: selectedSkill.skillId, competencyLevel })
      notify({
        tone: 'success',
        title: 'Skill added',
        message: `${selectedSkill.name} is now included in your declared skills.`,
      })
      setSelectedSkill(null)
      setConflictMessage(undefined)
    } catch (reason) {
      await handleRecoverableError(reason)
      throw reason
    }
  }

  const updateSkill = async (item: DeclaredSkill, competencyLevel: CompetencyLevel) => {
    try {
      await updateMutation.mutateAsync({
        declaredSkillId: item.declaredSkillId,
        request: { competencyLevel },
        version: item.version,
      })
      notify({
        tone: 'success',
        title: 'Competency updated',
        message: `${item.skillName} was updated.`,
      })
      setConflictMessage(undefined)
    } catch (reason) {
      await handleRecoverableError(reason)
      throw reason
    }
  }

  const openRemoveDialog = (item: DeclaredSkill) => {
    setRemoveError(undefined)
    setRemoveTarget(item)
  }

  const closeRemoveDialog = () => {
    if (deleteMutation.isPending) return
    setRemoveError(undefined)
    setRemoveTarget(null)
  }

  const removeSkill = async () => {
    if (!removeTarget) return
    const target = removeTarget
    setRemoveError(undefined)

    try {
      await deleteMutation.mutateAsync({
        declaredSkillId: target.declaredSkillId,
        version: target.version,
      })
      const nextTotal = Math.max(0, (declared.data?.page.totalElements ?? 1) - 1)
      setPage((current) => clampPage(current, nextTotal, declaredPageSize))
      notify({
        tone: 'success',
        title: 'Skill removed',
        message: `${target.skillName} was removed from your declared skills.`,
      })
      setRemoveTarget(null)
      setConflictMessage(undefined)
    } catch (reason) {
      const error = mapApiError(reason, 'protected')
      await handleRecoverableError(reason)
      if (error.status === 404) {
        setRemoveTarget(null)
        return
      }
      setRemoveError(error.message)
    }
  }

  const mappedDeclaredError = declared.error ? mapApiError(declared.error, 'protected') : null
  const addSkillError = taxonomyTree.error ?? allDeclared.error
  const mappedAddSkillError = addSkillError ? mapApiError(addSkillError, 'protected') : null
  const addSkillLoading = taxonomyTree.isPending || allDeclared.isPending
  const taxonomyPathsBySkillId = taxonomyIndex?.pathsBySkillId ?? new Map()

  return (
    <main className="content-stack s4-skills-page">
      <PageHeader
        description="Browse the complete system skill taxonomy, select your competency level, and maintain your declared student skills inventory."
        title="Skills"
      />

      {conflictMessage ? (
        <div className="s4-skills-conflict" role="alert">
          <strong>Review the latest record</strong>
          <p>{conflictMessage}</p>
        </div>
      ) : null}

      <SectionCard aria-labelledby="add-skill-title" className="s4-skills-add-card">
        <div className="s4-skills-section-heading">
          <div>
            <h2 id="add-skill-title">Add Skill Entry</h2>
            <p>
              Use the searchable system skill list below or select through the cascading fields.
            </p>
          </div>
        </div>
        <LoadingBoundary
          isLoading={addSkillLoading}
          label="Loading Add Skill options"
          minHeight={220}
          skeleton={<AddSkillOptionsSkeleton />}
        >
          {mappedAddSkillError ? (
            <ErrorState
              correlationId={mappedAddSkillError.correlationId}
              message={mappedAddSkillError.message}
              onAction={() => void Promise.all([taxonomyTree.refetch(), allDeclared.refetch()])}
              title="Add Skill unavailable"
            />
          ) : taxonomyTree.data && allDeclared.data ? (
            <DeclaredSkillForm
              availableSearch={availableSearch}
              declaredSkillIds={declaredSkillIds}
              isPending={createMutation.isPending}
              onAvailableSearchChange={setAvailableSearch}
              onSelectSkill={setSelectedSkill}
              onSubmit={addSkill}
              selectedSkill={selectedSkill}
              taxonomy={taxonomyTree.data}
            />
          ) : null}
        </LoadingBoundary>
      </SectionCard>

      <SectionCard className="s4-skills-available-card">
        <SkillTaxonomyBrowser
          declaredSkillIds={declaredSkillIds}
          onSelect={setSelectedSkill}
          search={availableSearch}
          selectionDisabled={createMutation.isPending || !taxonomyTree.data || !allDeclared.data}
          selectedSkillId={selectedSkill?.skillId}
          taxonomyPathsBySkillId={taxonomyPathsBySkillId}
        />
      </SectionCard>

      <SectionCard aria-labelledby="declared-skills-title" className="s4-skills-list-card">
        <div className="s4-skills-section-heading">
          <div>
            <h2 id="declared-skills-title">Declared Skills</h2>
            <p>These are the skills currently attached to your student profile.</p>
          </div>
        </div>
        <div className="s4-skills-list-toolbar">
          <SearchInput
            aria-label="Search declared skills"
            onChange={(event) => {
              setDeclaredSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search declared skills"
            value={declaredSearch}
          />
        </div>

        {declared.isFetching && !declared.isPending ? (
          <p aria-live="polite" className="s4-skills-loading-note">
            Updating declared skills...
          </p>
        ) : null}
        <LoadingBoundary
          isLoading={declared.isPending}
          label="Loading declared skills"
          minHeight={420}
          skeleton={<DeclaredSkillsListSkeleton includeToolbar={false} />}
        >
          {mappedDeclaredError ? (
            <ErrorState
              correlationId={mappedDeclaredError.correlationId}
              message={mappedDeclaredError.message}
              onAction={() => void declared.refetch()}
              title="Declared skills unavailable"
            />
          ) : declared.data?.items.length === 0 ? (
            <EmptyState
              message={
                declaredSearch
                  ? `No declared skills match “${declaredSearch}”.`
                  : 'Select an available taxonomy skill above to create your first declaration.'
              }
              title={declaredSearch ? 'No matching declared skills' : 'No declared skills yet'}
            />
          ) : declared.data?.items.length ? (
            <>
              <DeclaredSkillsTable
                deletingId={deleteMutation.isPending ? removeTarget?.declaredSkillId : undefined}
                items={declared.data.items}
                onRemove={openRemoveDialog}
                onUpdate={updateSkill}
                taxonomyPathsBySkillId={taxonomyPathsBySkillId}
                updatingId={
                  updateMutation.isPending ? updateMutation.variables?.declaredSkillId : undefined
                }
              />
              <PaginationBar
                label="Declared skills pagination"
                onPageChange={setPage}
                page={declared.data.page.page}
                size={declared.data.page.size}
                totalElements={declared.data.page.totalElements}
                totalPages={declared.data.page.totalPages}
              />
            </>
          ) : null}
        </LoadingBoundary>
      </SectionCard>

      {removeTarget ? (
        <ConfirmDialog
          closeDisabled={deleteMutation.isPending}
          onClose={closeRemoveDialog}
          title="Remove Skill"
        >
          <p>Are you sure you want to remove {removeTarget.skillName} from your declared skills?</p>
          <FormErrorMessage id="remove-declared-skill-error" message={removeError} />
          <div className="modal-actions">
            <Button
              disabled={deleteMutation.isPending}
              onClick={closeRemoveDialog}
              variant="secondary"
            >
              Close
            </Button>
            <Button isLoading={deleteMutation.isPending} onClick={() => void removeSkill()}>
              Remove
            </Button>
          </div>
        </ConfirmDialog>
      ) : null}
    </main>
  )
}
