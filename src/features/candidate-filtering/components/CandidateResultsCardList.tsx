import { Link } from 'react-router-dom'
import { buildAdminStudentDetailPath } from '../../../app/config/routePaths'
import { Checkbox } from '../../../shared/components/forms/Checkbox'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { CandidateFilteringCandidate } from '../types/candidateFilteringTypes'

const gpaFormatter = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function CandidateResultsCardList({
  candidates,
  onShowSkills,
  onToggle,
  selectedIds,
}: {
  candidates: CandidateFilteringCandidate[]
  onShowSkills: (candidate: CandidateFilteringCandidate) => void
  onToggle: (candidate: CandidateFilteringCandidate) => void
  selectedIds: ReadonlySet<string>
}) {
  return (
    <ul aria-label="Candidate filtering results" className="cf-card-list" role="list">
      {candidates.map((candidate) => {
        const selected = selectedIds.has(candidate.studentId)
        const visibleSkills = candidate.matchingDeclaredSkills.slice(0, 3)

        return (
          <li className="cf-card-list__item" key={candidate.studentId}>
            <article
              aria-label={`Candidate: ${candidate.fullName}`}
              className={`cf-candidate-card ${selected ? 'cf-candidate-card--selected' : ''}`.trim()}
            >
              <div className="cf-candidate-card__select">
                <Checkbox
                  aria-label={`Select ${candidate.fullName} (${candidate.indexNumber})`}
                  checked={selected}
                  onChange={() => onToggle(candidate)}
                />
              </div>

              <div className="cf-candidate-card__avatar" aria-hidden="true">
                {getInitials(candidate.fullName)}
              </div>

              <div className="cf-candidate-card__body">
                <div className="cf-candidate-card__header">
                  <Link
                    className="cf-candidate-card__name"
                    to={buildAdminStudentDetailPath(candidate.studentId)}
                  >
                    {candidate.fullName}
                  </Link>
                  <span className="cf-candidate-card__index">{candidate.indexNumber}</span>
                </div>

                <div className="cf-candidate-card__meta">
                  <strong className="cf-candidate-card__gpa">
                    {candidate.officialGpa === null
                      ? 'GPA: Not available'
                      : `GPA: ${gpaFormatter.format(candidate.officialGpa)}`}
                  </strong>
                  <span className="cf-candidate-card__declared">
                    {candidate.declaredSkillCount} declared skill
                    {candidate.declaredSkillCount === 1 ? '' : 's'}
                  </span>
                </div>

                {visibleSkills.length ? (
                  <div className="cf-candidate-card__skills">
                    {visibleSkills.map((skill) => (
                      <Chip key={skill.declaredSkillId}>{skill.skillName}</Chip>
                    ))}
                  </div>
                ) : (
                  <span className="cf-candidate-card__no-skills">No matching declared skills</span>
                )}

                <StatusBadge tone={candidate.hasExistingActiveShortlist ? 'neutral' : 'success'}>
                  {candidate.hasExistingActiveShortlist
                    ? `Already shortlisted in ${candidate.existingActiveShortlistCount} other shortlist${
                        candidate.existingActiveShortlistCount === 1 ? '' : 's'
                      }`
                    : 'No other shortlists'}
                </StatusBadge>
              </div>

              <div className="cf-candidate-card__action">
                <Button
                  aria-label={`View skills for ${candidate.fullName}`}
                  onClick={() => onShowSkills(candidate)}
                  size="sm"
                  variant="outlined"
                >
                  View Skills
                </Button>
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
