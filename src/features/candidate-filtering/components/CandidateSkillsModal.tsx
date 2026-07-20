import { Modal } from '../../../shared/components/overlays/Modal'
import { Chip } from '../../../shared/components/ui/Chip'
import type { CandidateFilteringCandidate } from '../types/candidateFilteringTypes'

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function CandidateSkillsModal({
  candidate,
  onClose,
}: {
  candidate: CandidateFilteringCandidate
  onClose: () => void
}) {
  return (
    <Modal
      description={`${candidate.fullName} · ${candidate.indexNumber}`}
      onClose={onClose}
      title="Matching declared skills"
    >
      <div className="candidate-skills-modal">
        <p>
          {candidate.matchingDeclaredSkills.length} matching skill
          {candidate.matchingDeclaredSkills.length === 1 ? '' : 's'} from the current run.
        </p>
        <ul>
          {candidate.matchingDeclaredSkills.map((skill) => (
            <li key={skill.declaredSkillId}>
              <strong>{skill.skillName}</strong>
              <Chip>{label(skill.competencyLevel)}</Chip>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
