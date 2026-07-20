import { useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { AddSkillOptionsSkeleton, DeclaredSkillsListSkeleton } from '../../../shared/skeletons'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { clampPage } from '../../../shared/utils/clampPage'
import { indexSkillTaxonomy, useSkillTaxonomyTree } from '../../../shared/skill-taxonomy'
import type { IndividualSkill } from '../../../shared/skill-taxonomy'
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

const pageSize = 5

export function StudentSkillsPage() {
  const { notify } = useNotifications()
  const [selectedSkill, setSelectedSkill] = useState<IndividualSkill | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('skillName,asc')
  const [page, setPage] = useState(0)
  const [removeTarget, setRemoveTarget] = useState<DeclaredSkill | null>(null)
  const [conflictMessage, setConflictMessage] = useState<string>()
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  const declared = useDeclaredSkills({
    page,
    size: pageSize,
    sort,
    search: debouncedSearch || undefined,
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
        'This record changed after you loaded it. Your intended change is preserved; review the latest version and retry.',
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
        message: `${selectedSkill.name} is now declared.`,
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

  const removeSkill = async () => {
    if (!removeTarget) return
    const target = removeTarget
    try {
      await deleteMutation.mutateAsync({
        declaredSkillId: target.declaredSkillId,
        version: target.version,
      })
      const nextTotal = Math.max(0, (declared.data?.page.totalElements ?? 1) - 1)
      setPage((current) => clampPage(current, nextTotal, pageSize))
      notify({
        tone: 'success',
        title: 'Skill removed',
        message: `${target.skillName} was removed.`,
      })
      setRemoveTarget(null)
      setConflictMessage(undefined)
    } catch (reason) {
      const error = mapApiError(reason, 'protected')
      await handleRecoverableError(reason)
      if (error.status === 404) setRemoveTarget(null)
    }
  }

  const mappedDeclaredError = declared.error ? mapApiError(declared.error, 'protected') : null
  const addSkillError = taxonomyTree.error ?? allDeclared.error
  const mappedAddSkillError = addSkillError ? mapApiError(addSkillError, 'protected') : null
  const addSkillLoading = taxonomyTree.isPending || allDeclared.isPending

  return (
    <main className="content-stack s4-skills-page">
      <PageHeader
        description="Browse the developer-managed taxonomy and maintain your own declared competency levels."
        eyebrow="Student workspace"
        title="Declared Skills"
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
            <h2 id="add-skill-title">Add Skill</h2>
            <p>Select each taxonomy level, choose your competency, and save immediately.</p>
          </div>
        </div>
        <LoadingBoundary
          isLoading={addSkillLoading}
          label="Loading Add Skill options"
          minHeight={150}
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
              declaredSkillIds={declaredSkillIds}
              isPending={createMutation.isPending}
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
          selectionDisabled={createMutation.isPending || !taxonomyTree.data || !allDeclared.data}
          selectedSkillId={selectedSkill?.skillId}
        />
      </SectionCard>

      <SectionCard aria-labelledby="declared-skills-title" className="s4-skills-list-card">
        <div className="s4-skills-section-heading">
          <div>
            <h2 id="declared-skills-title">Your declared skills</h2>
            <p>{declared.data?.page.totalElements ?? 0} declared skills from server metadata.</p>
          </div>
        </div>
        <div className="s4-skills-list-toolbar">
          <SearchInput
            aria-label="Search declared skills"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search declared skills"
            value={search}
          />
          <SortSelect
            aria-label="Sort declared skills"
            onChange={(event) => {
              setSort(event.target.value)
              setPage(0)
            }}
            value={sort}
          >
            <option value="skillName,asc">Skill name A–Z</option>
            <option value="skillName,desc">Skill name Z–A</option>
            <option value="competencyLevel,asc">Competency</option>
            <option value="updatedAt,desc">Recently updated</option>
          </SortSelect>
        </div>

        {declared.isFetching && !declared.isPending ? (
          <p aria-live="polite">Updating declared skills...</p>
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
                search
                  ? `No declared skills match “${search}”.`
                  : 'Select an available taxonomy skill above to create your first declaration.'
              }
              title={search ? 'No matching declared skills' : 'No declared skills yet'}
            />
          ) : declared.data?.items.length ? (
            <>
              <DeclaredSkillsTable
                deletingId={deleteMutation.isPending ? removeTarget?.declaredSkillId : undefined}
                items={declared.data.items}
                onRemove={setRemoveTarget}
                onUpdate={updateSkill}
                taxonomyPathsBySkillId={taxonomyIndex?.pathsBySkillId ?? new Map()}
                updatingId={
                  updateMutation.isPending ? updateMutation.variables?.declaredSkillId : undefined
                }
              />
              {declared.data.page.totalPages > 0 ? (
                <PaginationBar
                  label="Declared skills pagination"
                  onPageChange={setPage}
                  page={declared.data.page.page}
                  size={declared.data.page.size}
                  totalElements={declared.data.page.totalElements}
                  totalPages={declared.data.page.totalPages}
                />
              ) : null}
            </>
          ) : null}
        </LoadingBoundary>
      </SectionCard>

      {removeTarget ? (
        <ConfirmDialog
          closeDisabled={deleteMutation.isPending}
          onClose={() => setRemoveTarget(null)}
          title={`Remove ${removeTarget.skillName}?`}
        >
          <p>This removes the skill from your declared-skill list.</p>
          <div className="modal-actions">
            <Button
              disabled={deleteMutation.isPending}
              onClick={() => setRemoveTarget(null)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button isLoading={deleteMutation.isPending} onClick={() => void removeSkill()}>
              Remove skill
            </Button>
          </div>
        </ConfirmDialog>
      ) : null}
    </main>
  )
}
