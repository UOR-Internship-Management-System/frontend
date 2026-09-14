import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { FormErrorMessage } from '../../../shared/components/forms/FormErrorMessage'
import { Dialog } from '../../../shared/components/overlays/Dialog'
import { Menu, MenuItem } from '../../../shared/components/overlays/Menu'
import { Button } from '../../../shared/components/ui/Button'
import { IconButton } from '../../../shared/components/ui/IconButton'
import { List, ListItem } from '../../../shared/components/ui/List'
import { SegmentedButton } from '../../../shared/components/ui/SegmentedButton'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { SkeletonListRows, SkeletonStatusRegion } from '../../../shared/skeletons'
import type { SkillTaxonomyPath } from '../../../shared/skill-taxonomy'
import type { CompetencyLevel, DeclaredSkill } from '../types/studentSkillTypes'
import { competencyLabel, competencyOptions, competencyTone } from '../utils/competency'

export function DeclaredSkillsPanel({
  deletingId,
  error,
  isLoading,
  items,
  onPageChange,
  onRefetch,
  onRemove,
  onUpdate,
  page,
  search,
  size,
  taxonomyPathsBySkillId,
  totalElements,
  totalPages,
  updatingId,
}: {
  items: DeclaredSkill[]
  taxonomyPathsBySkillId: ReadonlyMap<string, SkillTaxonomyPath[]>
  isLoading: boolean
  error: string | null
  page: number
  search: string
  size: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  onRefetch: () => void
  updatingId?: string
  deletingId?: string
  onUpdate: (item: DeclaredSkill, competencyLevel: CompetencyLevel) => Promise<void>
  onRemove: (item: DeclaredSkill) => void
}) {
  const [openMenuId, setOpenMenuId] = useState<string>()
  const [editTarget, setEditTarget] = useState<DeclaredSkill | null>(null)

  return (
    <LoadingBoundary
      isLoading={isLoading}
      label="Loading declared skills"
      minHeight={360}
      skeleton={
        <SkeletonStatusRegion label="Loading declared skills">
          <SkeletonListRows count={6} showActions={false} />
        </SkeletonStatusRegion>
      }
    >
      {error ? (
        <ErrorState message={error} onAction={onRefetch} title="Declared skills unavailable" />
      ) : items.length === 0 ? (
        <EmptyState
          message={
            search
              ? `No declared skills match "${search}".`
              : 'Use "Add skill" to declare your first skill from the system taxonomy.'
          }
          title={search ? 'No matching declared skills' : 'No declared skills yet'}
        />
      ) : (
        <>
          <List aria-label="Declared skills">
            {items.map((item) => {
              const paths = taxonomyPathsBySkillId.get(item.skillId) ?? []
              const isRowBusy = updatingId === item.declaredSkillId || deletingId === item.declaredSkillId
              return (
                <ListItem
                  aria-label={item.skillName}
                  headline={item.skillName}
                  key={item.declaredSkillId}
                  supportingText={taxonomyNames(paths)}
                  trailing={
                    <div className="s4-skills-row-trailing">
                      <StatusBadge tone={competencyTone(item.competencyLevel)}>
                        {competencyLabel(item.competencyLevel)}
                      </StatusBadge>
                      <IconButton
                        aria-label={`Actions for ${item.skillName}`}
                        disabled={isRowBusy}
                        icon={<span className="material-symbols-outlined">more_vert</span>}
                        onClick={() =>
                          setOpenMenuId((current) =>
                            current === item.declaredSkillId ? undefined : item.declaredSkillId,
                          )
                        }
                        onMouseDown={(event) => event.stopPropagation()}
                        size="sm"
                      />
                      <Menu
                        aria-label={`Actions for ${item.skillName}`}
                        isOpen={openMenuId === item.declaredSkillId}
                        onClose={() => setOpenMenuId(undefined)}
                      >
                        <MenuItem
                          icon={<span className="material-symbols-outlined">tune</span>}
                          onClick={() => {
                            setOpenMenuId(undefined)
                            setEditTarget(item)
                          }}
                        >
                          Edit competency
                        </MenuItem>
                        <MenuItem
                          destructive
                          icon={<span className="material-symbols-outlined">delete</span>}
                          onClick={() => {
                            setOpenMenuId(undefined)
                            onRemove(item)
                          }}
                        >
                          Remove
                        </MenuItem>
                      </Menu>
                    </div>
                  }
                />
              )
            })}
          </List>
          <PaginationBar
            label="Declared skills pagination"
            onPageChange={onPageChange}
            page={page}
            size={size}
            totalElements={totalElements}
            totalPages={totalPages}
          />
        </>
      )}

      {editTarget ? (
        <EditCompetencyDialog
          isPending={updatingId === editTarget.declaredSkillId}
          item={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdate={onUpdate}
        />
      ) : null}
    </LoadingBoundary>
  )
}

function EditCompetencyDialog({
  isPending,
  item,
  onClose,
  onUpdate,
}: {
  item: DeclaredSkill
  isPending: boolean
  onClose: () => void
  onUpdate: (item: DeclaredSkill, competencyLevel: CompetencyLevel) => Promise<void>
}) {
  const [level, setLevel] = useState(item.competencyLevel)
  const [error, setErrorMessage] = useState<string>()

  const save = async () => {
    setErrorMessage(undefined)
    try {
      await onUpdate(item, level)
      onClose()
    } catch (reason) {
      setErrorMessage(mapApiError(reason, 'protected').message)
    }
  }

  return (
    <Dialog
      actions={
        <>
          <Button disabled={isPending} onClick={onClose} variant="text">
            Cancel
          </Button>
          <Button disabled={level === item.competencyLevel} isLoading={isPending} onClick={() => void save()}>
            Save
          </Button>
        </>
      }
      closeDisabled={isPending}
      isOpen
      onClose={onClose}
      size="medium"
      title={`Edit competency for ${item.skillName}`}
    >
      <SegmentedButton
        ariaLabel="Competency level"
        onChange={setLevel}
        options={competencyOptions}
        value={level}
      />
      <FormErrorMessage id="edit-competency-error" message={error} />
    </Dialog>
  )
}

function taxonomyNames(paths: SkillTaxonomyPath[]) {
  const clusters = [...new Set(paths.map((path) => path.clusterName))]
  const categories = [...new Set(paths.map((path) => path.categoryName))]
  if (clusters.length === 0) return 'Taxonomy context unavailable'
  return `${clusters.join(', ')} · ${categories.join(', ')}`
}
