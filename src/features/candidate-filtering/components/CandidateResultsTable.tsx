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

export function CandidateResultsTable({
  candidates,
  onShowSkills,
  onToggle,
  onTogglePage,
  selectedIds,
}: {
  candidates: CandidateFilteringCandidate[]
  onShowSkills: (candidate: CandidateFilteringCandidate) => void
  onToggle: (candidate: CandidateFilteringCandidate) => void
  onTogglePage: (select: boolean) => void
  selectedIds: ReadonlySet<string>
}) {
  const selectedOnPage = candidates.filter((candidate) =>
    selectedIds.has(candidate.studentId),
  ).length
  const allSelected = candidates.length > 0 && selectedOnPage === candidates.length

  return (
    <div className="table-responsive cf-results-table-wrapper">
      <table className="cf-results-table">
        <caption>Deterministic candidate filtering results</caption>
        <colgroup>
          <col className="cf-column-select" />
          <col className="cf-column-profile" />
          <col className="cf-column-gpa" />
          <col className="cf-column-skills" />
          <col className="cf-column-history" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">
              <Checkbox
                aria-label="Select all candidates on this page"
                checked={allSelected}
                indeterminate={selectedOnPage > 0 && !allSelected}
                onChange={() => onTogglePage(!allSelected)}
              />
            </th>
            <th scope="col">Candidate profile details</th>
            <th scope="col">Official GPA</th>
            <th scope="col">Skills inventory display</th>
            <th scope="col">Cross-shortlist status</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const selected = selectedIds.has(candidate.studentId)
            const visibleSkills = candidate.matchingDeclaredSkills.slice(0, 3)
            return (
              <tr
                className={selected ? 'cf-row-selected' : undefined}
                key={candidate.studentId}
              >
                <td data-label="Select">
                  <Checkbox
                    aria-label={`Select ${candidate.fullName} (${candidate.indexNumber})`}
                    checked={selected}
                    onChange={() => onToggle(candidate)}
                  />
                </td>
                <td data-label="Candidate profile details">
                  <Link
                    className="cf-profile-link"
                    to={buildAdminStudentDetailPath(candidate.studentId)}
                  >
                    {candidate.fullName}
                  </Link>
                  <span className="cf-profile-secondary">{candidate.indexNumber}</span>
                  <span className="cf-profile-subline">
                    {candidate.declaredSkillCount} declared skill
                    {candidate.declaredSkillCount === 1 ? '' : 's'}
                  </span>
                </td>
                <td data-label="Official GPA">
                  <strong className="cf-gpa-value">
                    {candidate.officialGpa === null
                      ? 'Not available'
                      : gpaFormatter.format(candidate.officialGpa)}
                  </strong>
                </td>
                <td data-label="Skills inventory display">
                  {visibleSkills.length ? (
                    <div className="cf-skill-summary">
                      {visibleSkills.map((skill) => (
                        <Chip key={skill.declaredSkillId}>{skill.skillName}</Chip>
                      ))}
                      <Button
                        aria-label={`View skills for ${candidate.fullName}`}
                        onClick={() => onShowSkills(candidate)}
                        size="sm"
                        variant="outlined"
                      >
                        View Skills
                      </Button>
                    </div>
                  ) : (
                    <span className="cf-profile-subline">No matching declared skills</span>
                  )}
                </td>
                <td data-label="Cross-shortlist status">
                  <StatusBadge
                    tone={candidate.hasExistingActiveShortlist ? 'neutral' : 'success'}
                  >
                    {candidate.hasExistingActiveShortlist
                      ? `Already shortlisted in ${candidate.existingActiveShortlistCount} other shortlist${
                          candidate.existingActiveShortlistCount === 1 ? '' : 's'
                        }`
                      : 'No other shortlists'}
                  </StatusBadge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
