import { useMemo, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { FormErrorMessage } from '../../../shared/components/forms/FormErrorMessage'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { BottomSheet } from '../../../shared/components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Dialog } from '../../../shared/components/overlays/Dialog'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
import { ExtendedFab } from '../../../shared/components/ui/ExtendedFab'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useIsCompactLayout } from '../../../shared/hooks/useResponsiveLayout'
import { SkeletonFormFields, SkeletonStatusRegion } from '../../../shared/skeletons'
import { indexSkillTaxonomy, useSkillTaxonomyTree } from '../../../shared/skill-taxonomy'
import type { IndividualSkill } from '../../../shared/skill-taxonomy'
import { clampPage } from '../../../shared/utils/clampPage'
import { AddSkillFlow } from '../components/AddSkillFlow'
import { DeclaredSkillsPanel } from '../components/DeclaredSkillsPanel'
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
  const isCompact = useIsCompactLayout()
  const [declaredSearch, setDeclaredSearch] = useState('')
  const [page, setPage] = useState(0)
  const [isAddOpen, setAddOpen] = useState(false)
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

  const addSkill = async (skill: IndividualSkill, competencyLevel: CompetencyLevel) => {
    if (declaredSkillIds.has(skill.skillId)) {
      throw {
        title: 'Duplicate declared skill',
        status: 409,
        code: 'DUPLICATE_DECLARED_SKILL',
        message: 'This skill is already declared.',
      }
    }

    try {
      await createMutation.mutateAsync({ skillId: skill.skillId, competencyLevel })
      notify({
        tone: 'success',
        title: 'Skill added',
        message: `${skill.name} is now included in your declared skills.`,
      })
      setConflictMessage(undefined)
      setAddOpen(false)
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

  const mappedDeclaredError = declared.error ? mapApiError(declared.error, 'protected').message : null
  const addSkillError = taxonomyTree.error ?? allDeclared.error
  const mappedAddSkillError = addSkillError ? mapApiError(addSkillError, 'protected') : null
  const addSkillLoading = taxonomyTree.isPending || allDeclared.isPending
  const taxonomyPathsBySkillId = taxonomyIndex?.pathsBySkillId ?? new Map()

  const addSkillContent = (
    <LoadingBoundary
      isLoading={addSkillLoading}
      label="Loading Add Skill options"
      minHeight={220}
      skeleton={
        <SkeletonStatusRegion label="Loading Add Skill options">
          <SkeletonFormFields count={2} />
        </SkeletonStatusRegion>
      }
    >
      {mappedAddSkillError ? (
        <ErrorState
          correlationId={mappedAddSkillError.correlationId}
          message={mappedAddSkillError.message}
          onAction={() => void Promise.all([taxonomyTree.refetch(), allDeclared.refetch()])}
          title="Add Skill unavailable"
        />
      ) : taxonomyTree.data ? (
        <AddSkillFlow
          declaredSkillIds={declaredSkillIds}
          isPending={createMutation.isPending}
          onSubmit={addSkill}
          taxonomy={taxonomyTree.data}
        />
      ) : null}
    </LoadingBoundary>
  )

  return (
    <main className="content-stack s4-skills-page">
      <PageHeader
        actions={
          <ExtendedFab
            icon={<span className="material-symbols-outlined">add</span>}
            label="Add skill"
            onClick={() => setAddOpen(true)}
          />
        }
        description="Browse the system skill taxonomy, declare your competency level, and manage your declared skills."
        title="Skills"
      />

      {conflictMessage ? (
        <div className="s4-skills-conflict" role="alert">
          <strong>Review the latest record</strong>
          <p>{conflictMessage}</p>
        </div>
      ) : null}

      <Card aria-labelledby="declared-skills-title" variant="outlined">
        <CardHeader className="s4-skills-section-heading">
          <div>
            <CardTitle id="declared-skills-title">Declared skills</CardTitle>
            <p>These are the skills currently attached to your student profile.</p>
          </div>
          <SearchBar
            aria-label="Search declared skills"
            onChange={(event) => {
              setDeclaredSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search declared skills"
            value={declaredSearch}
          />
        </CardHeader>

        {declared.isFetching && !declared.isPending ? (
          <p aria-live="polite" className="s4-skills-loading-note">
            Updating declared skills...
          </p>
        ) : null}
        <CardContent>
          <DeclaredSkillsPanel
            deletingId={deleteMutation.isPending ? removeTarget?.declaredSkillId : undefined}
            error={mappedDeclaredError}
            isLoading={declared.isPending}
            items={declared.data?.items ?? []}
            onPageChange={setPage}
            onRefetch={() => void declared.refetch()}
            onRemove={openRemoveDialog}
            onUpdate={updateSkill}
            page={declared.data?.page.page ?? 0}
            search={declaredSearch}
            size={declared.data?.page.size ?? declaredPageSize}
            taxonomyPathsBySkillId={taxonomyPathsBySkillId}
            totalElements={declared.data?.page.totalElements ?? 0}
            totalPages={declared.data?.page.totalPages ?? 0}
            updatingId={updateMutation.isPending ? updateMutation.variables?.declaredSkillId : undefined}
          />
        </CardContent>
      </Card>

      {isCompact ? (
        <BottomSheet
          aria-label="Add skill"
          isOpen={isAddOpen}
          onClose={() => setAddOpen(false)}
          title="Add skill"
        >
          {addSkillContent}
        </BottomSheet>
      ) : (
        <Dialog isOpen={isAddOpen} onClose={() => setAddOpen(false)} size="medium" title="Add skill">
          {addSkillContent}
        </Dialog>
      )}

      {removeTarget ? (
        <ConfirmDialog
          closeDisabled={deleteMutation.isPending}
          onClose={closeRemoveDialog}
          title="Remove skill"
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
