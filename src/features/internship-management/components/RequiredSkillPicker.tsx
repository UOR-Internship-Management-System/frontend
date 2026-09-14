import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { List, ListItem } from '../../../shared/components/ui/List'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useIndividualSkills } from '../../../shared/skill-taxonomy'
import type { RequiredSkillSelection } from '../types/internshipManagementTypes'

const taxonomyPageSize = 8

export function RequiredSkillPicker({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean
  onChange: (skills: RequiredSkillSelection[]) => void
  value: RequiredSkillSelection[]
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const taxonomy = useIndividualSkills({
    page,
    size: taxonomyPageSize,
    sort: 'name,asc',
    search: debouncedSearch || undefined,
  })
  const mappedError = taxonomy.error ? mapApiError(taxonomy.error, 'protected') : null

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const addSkill = (skillId: string, skillName: string) => {
    if (value.some((skill) => skill.skillId === skillId)) return
    onChange([...value, { skillId, skillName }])
  }

  const removeSkill = (skillId: string) => {
    onChange(value.filter((skill) => skill.skillId !== skillId))
  }

  return (
    <fieldset className="im-skill-picker" disabled={disabled}>
      <legend>Required skill selector</legend>
      <p className="im-field-help">
        Search the system skill taxonomy and select the declared skills required for the role.
      </p>

      <SearchBar
        aria-label="Search required skills"
        disabled={taxonomy.isPending}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search taxonomy skills"
        value={search}
      />

      {mappedError ? (
        <ErrorState
          correlationId={mappedError.correlationId}
          message={mappedError.message}
          onAction={() => void taxonomy.refetch()}
          title="Skill taxonomy unavailable"
        />
      ) : taxonomy.data ? (
        <List aria-label="Taxonomy skill results" className="im-skill-results">
          {taxonomy.data.items.map((skill) => {
            const selected = value.some((item) => item.skillId === skill.skillId)
            return (
              <ListItem
                aria-disabled={selected || undefined}
                aria-label={skill.name}
                headline={skill.name}
                interactive={!selected}
                key={skill.skillId}
                onClick={() => addSkill(skill.skillId, skill.name)}
                onKeyDown={(event) => {
                  if (selected) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    addSkill(skill.skillId, skill.name)
                  }
                }}
                role="button"
                supportingText={selected ? 'Already added' : skill.description}
                trailing={
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {selected ? 'check_circle' : 'add_circle'}
                  </span>
                }
              />
            )
          })}
          {taxonomy.data.items.length === 0 ? (
            <p className="im-taxonomy-empty-result">No skills match the current search.</p>
          ) : null}
        </List>
      ) : null}

      {taxonomy.data && taxonomy.data.page.totalPages > 1 ? (
        <nav aria-label="Required skill pages" className="im-skill-pagination">
          <Button
            disabled={page <= 0}
            onClick={() => setPage((current) => current - 1)}
            size="sm"
            type="button"
            variant="text"
          >
            Previous
          </Button>
          <span>
            Page {taxonomy.data.page.page + 1} of {taxonomy.data.page.totalPages}
          </span>
          <Button
            disabled={page >= taxonomy.data.page.totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
            size="sm"
            type="button"
            variant="text"
          >
            Next
          </Button>
        </nav>
      ) : null}

      <div className="im-selected-skills-field">
        <div className="im-selected-skills-heading">
          <strong>Selected Required Skills</strong>
          <span>{value.length} selected</span>
        </div>
        {value.length === 0 ? (
          <p className="im-selected-skills-empty">No required skills selected yet.</p>
        ) : (
          <ul aria-label="Selected required skills" className="im-selected-skill-chips">
            {value.map((skill) => (
              <li key={skill.skillId}>
                <Chip onRemove={disabled ? undefined : () => removeSkill(skill.skillId)} variant="input">
                  {skill.skillName}
                </Chip>
              </li>
            ))}
          </ul>
        )}
      </div>
    </fieldset>
  )
}
