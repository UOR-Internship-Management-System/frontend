import { useEffect, useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormErrorMessage } from '../../../shared/components/forms/FormErrorMessage'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { Button } from '../../../shared/components/ui/Button'
import type { IndividualSkill, SkillTaxonomy } from '../../../shared/skill-taxonomy'
import type { CompetencyLevel } from '../types/studentSkillTypes'
import { SkillLevelSelect } from './SkillLevelSelect'

export function DeclaredSkillForm({
  isPending,
  onSubmit,
  onSelectSkill,
  selectedSkill,
  taxonomy,
  declaredSkillIds,
  disabled = false,
}: {
  selectedSkill: IndividualSkill | null
  taxonomy: SkillTaxonomy
  declaredSkillIds: ReadonlySet<string>
  isPending: boolean
  disabled?: boolean
  onSelectSkill: (skill: IndividualSkill | null) => void
  onSubmit: (competencyLevel: CompetencyLevel) => Promise<void>
}) {
  const [clusterId, setClusterId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [competencyLevel, setCompetencyLevel] = useState<CompetencyLevel | ''>('')
  const [error, setError] = useState<string>()
  const categories = useMemo(
    () => taxonomy.clusters.find((cluster) => cluster.clusterId === clusterId)?.categories ?? [],
    [clusterId, taxonomy.clusters],
  )
  const skills = useMemo(
    () => categories.find((category) => category.categoryId === categoryId)?.skills ?? [],
    [categories, categoryId],
  )

  useEffect(() => {
    if (!selectedSkill) return
    for (const cluster of taxonomy.clusters) {
      for (const category of cluster.categories ?? []) {
        if (category.skills?.some((skill) => skill.skillId === selectedSkill.skillId)) {
          setClusterId(cluster.clusterId)
          setCategoryId(category.categoryId)
          return
        }
      }
    }
  }, [selectedSkill, taxonomy.clusters])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(undefined)
    if (!selectedSkill) {
      setError('Select an available taxonomy skill.')
      return
    }
    if (!competencyLevel) {
      setError('Select a competency level.')
      return
    }
    try {
      await onSubmit(competencyLevel)
      setCompetencyLevel('')
    } catch (reason) {
      setError(mapApiError(reason, 'protected').message)
    }
  }

  return (
    <form className="s4-skills-declare-form" noValidate onSubmit={submit}>
      <div className="s4-skills-add-fields">
        <label>
          <span>Core Cluster</span>
          <SelectField
            aria-label="Add Skill Core Cluster"
            disabled={disabled || isPending}
            onChange={(event) => {
              setClusterId(event.target.value)
              setCategoryId('')
              onSelectSkill(null)
              setError(undefined)
            }}
            value={clusterId}
          >
            <option value="">Select a core cluster</option>
            {taxonomy.clusters.map((cluster) => (
              <option key={cluster.clusterId} value={cluster.clusterId}>
                {cluster.name}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          <span>Skill Category</span>
          <SelectField
            aria-label="Add Skill Category"
            disabled={disabled || isPending || !clusterId}
            onChange={(event) => {
              setCategoryId(event.target.value)
              onSelectSkill(null)
              setError(undefined)
            }}
            value={categoryId}
          >
            <option value="">Select a skill category</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          <span>Individual Skill</span>
          <SelectField
            aria-label="Add Skill Individual Skill"
            disabled={disabled || isPending || !categoryId}
            onChange={(event) => {
              const skill = skills.find((item) => item.skillId === event.target.value) ?? null
              onSelectSkill(skill)
              setError(undefined)
            }}
            value={selectedSkill?.skillId ?? ''}
          >
            <option value="">Select an individual skill</option>
            {skills.map((skill) => (
              <option
                disabled={declaredSkillIds.has(skill.skillId)}
                key={skill.skillId}
                value={skill.skillId}
              >
                {skill.name}
                {declaredSkillIds.has(skill.skillId) ? ' — Already declared' : ''}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          <span>Competency Level</span>
          <SkillLevelSelect
            disabled={disabled || isPending}
            errorId={error ? 'declare-skill-error' : undefined}
            id="declare-skill-competency"
            onChange={setCompetencyLevel}
            value={competencyLevel}
          />
        </label>
      </div>
      <Button
        disabled={disabled || !selectedSkill || !competencyLevel}
        isLoading={isPending}
        type="submit"
      >
        Add declared skill
      </Button>
      <FormErrorMessage id="declare-skill-error" message={error} />
    </form>
  )
}
