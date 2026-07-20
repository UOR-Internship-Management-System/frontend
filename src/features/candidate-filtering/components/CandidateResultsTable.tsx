import { Link } from 'react-router-dom'
import { buildAdminStudentDetailPath } from '../../../app/config/routePaths'
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
  selectedIds,
}: {
  candidates: CandidateFilteringCandidate[]
  onShowSkills: (candidate: CandidateFilteringCandidate) => void
  onToggle: (candidate: CandidateFilteringCandidate) => void
  selectedIds: ReadonlySet<string>
}) {
  return (
    <div className="table-responsive candidate-results-table-wrapper">
      <table className="candidate-results-table">
        <caption>Deterministic candidate filtering results</caption>
        <thead>
          <tr>
            <th scope="col">Select</th>
            <th scope="col">Student</th>
            <th scope="col">Official GPA</th>
            <th scope="col">Matching declared skills</th>
            <th scope="col">Declared skills</th>
            <th scope="col">Latest saved CV</th>
            <th scope="col">Active shortlists</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const selected = selectedIds.has(candidate.studentId)
            const visibleSkills = candidate.matchingDeclaredSkills.slice(0, 3)
            return (
              <tr key={candidate.studentId}>
                <td data-label="Select">
                  <input
                    aria-label={`Select ${candidate.fullName} (${candidate.indexNumber})`}
                    checked={selected}
                    className="candidate-select-checkbox"
                    onChange={() => onToggle(candidate)}
                    type="checkbox"
                  />
                </td>
                <td data-label="Student">
                  <Link to={buildAdminStudentDetailPath(candidate.studentId)}>
                    <strong>{candidate.fullName}</strong>
                  </Link>
                  <span className="company-secondary">{candidate.indexNumber}</span>
                </td>
                <td data-label="Official GPA">
                  {candidate.officialGpa === null
                    ? 'Not available'
                    : gpaFormatter.format(candidate.officialGpa)}
                </td>
                <td data-label="Matching declared skills">
                  {visibleSkills.length ? (
                    <div className="candidate-skill-summary">
                      {visibleSkills.map((skill) => (
                        <Chip key={skill.declaredSkillId}>{skill.skillName}</Chip>
                      ))}
                      {candidate.matchingDeclaredSkills.length > visibleSkills.length ? (
                        <button
                          className="button-link"
                          onClick={() => onShowSkills(candidate)}
                          type="button"
                        >
                          View all {candidate.matchingDeclaredSkills.length}
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    'None'
                  )}
                </td>
                <td data-label="Declared skills">{candidate.declaredSkillCount}</td>
                <td data-label="Latest saved CV">
                  <StatusBadge tone={candidate.hasLatestSavedCv ? 'success' : 'neutral'}>
                    {candidate.hasLatestSavedCv ? 'Available' : 'Not available'}
                  </StatusBadge>
                </td>
                <td data-label="Active shortlists">
                  <StatusBadge tone="neutral">
                    {candidate.hasExistingActiveShortlist
                      ? `${candidate.existingActiveShortlistCount} existing`
                      : 'None'}
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
