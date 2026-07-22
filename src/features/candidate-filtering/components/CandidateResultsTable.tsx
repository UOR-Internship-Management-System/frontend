import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { buildAdminStudentDetailPath } from '../../../app/config/routePaths'
import { Chip } from '../../../shared/components/ui/Chip'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { CandidateFilteringCandidate } from '../types/candidateFilteringTypes'

const gpaFormatter = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function PageSelectionCheckbox({
  allSelected,
  anySelected,
  onChange,
}: {
  allSelected: boolean
  anySelected: boolean
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = anySelected && !allSelected
  }, [allSelected, anySelected])

  return (
    <input
      aria-label="Select all candidates on this page"
      checked={allSelected}
      className="candidate-select-checkbox"
      onChange={onChange}
      ref={ref}
      type="checkbox"
    />
  )
}

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
    <div className="table-responsive candidate-results-table-wrapper">
      <table className="candidate-results-table">
        <caption>Deterministic candidate filtering results</caption>
        <colgroup>
          <col className="candidate-column-select" />
          <col className="candidate-column-profile" />
          <col className="candidate-column-gpa" />
          <col className="candidate-column-skills" />
          <col className="candidate-column-history" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">
              <PageSelectionCheckbox
                allSelected={allSelected}
                anySelected={selectedOnPage > 0}
                onChange={() => onTogglePage(!allSelected)}
              />
            </th>
            <th scope="col">Candidate profile details</th>
            <th scope="col">Official GPA</th>
            <th scope="col">Skills inventory display</th>
            <th scope="col">Shortlisted History</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const selected = selectedIds.has(candidate.studentId)
            const visibleSkills = candidate.matchingDeclaredSkills.slice(0, 3)
            return (
              <tr
                className={selected ? 'candidate-row-selected' : undefined}
                key={candidate.studentId}
              >
                <td data-label="Select">
                  <input
                    aria-label={`Select ${candidate.fullName} (${candidate.indexNumber})`}
                    checked={selected}
                    className="candidate-select-checkbox"
                    onChange={() => onToggle(candidate)}
                    type="checkbox"
                  />
                </td>
                <td data-label="Candidate profile details">
                  <Link
                    className="candidate-profile-link"
                    to={buildAdminStudentDetailPath(candidate.studentId)}
                  >
                    {candidate.fullName}
                  </Link>
                  <span className="company-secondary">{candidate.indexNumber}</span>
                  <span className="candidate-profile-subline">
                    {candidate.declaredSkillCount} declared skill
                    {candidate.declaredSkillCount === 1 ? '' : 's'}
                  </span>
                </td>
                <td data-label="Official GPA">
                  <strong className="candidate-gpa-value">
                    {candidate.officialGpa === null
                      ? 'Not available'
                      : gpaFormatter.format(candidate.officialGpa)}
                  </strong>
                </td>
                <td data-label="Skills inventory display">
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
                    <span className="candidate-profile-subline">No matching declared skills</span>
                  )}
                </td>
                <td data-label="Shortlisted history">
                  <div className="candidate-history-stack">
                    <StatusBadge
                      tone={candidate.hasExistingActiveShortlist ? 'neutral' : 'success'}
                    >
                      {candidate.hasExistingActiveShortlist
                        ? `${candidate.existingActiveShortlistCount} Previous Shortlist${
                            candidate.existingActiveShortlistCount === 1 ? '' : 's'
                          }`
                        : '0 Previous Shortlists'}
                    </StatusBadge>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
