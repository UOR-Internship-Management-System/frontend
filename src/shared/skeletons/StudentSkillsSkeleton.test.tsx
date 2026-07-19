import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StudentSkillsSkeleton } from './StudentSkillsSkeleton'

describe('StudentSkillsSkeleton', () => {
  it('reserves Add Skill, taxonomy and six-column declared-skill layouts', () => {
    const { container } = render(<StudentSkillsSkeleton />)
    expect(container.querySelectorAll('.s4-skills-add-fields .skeleton-field')).toHaveLength(4)
    expect(container.querySelectorAll('.s4-skills-results > article')).toHaveLength(6)
    expect(container.querySelectorAll('.skeleton-table-head')).toHaveLength(6)
  })
})
