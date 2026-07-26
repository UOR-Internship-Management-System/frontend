import { queryKeys } from '../../../shared/api/queryKeys'
import type { CandidateResultsQuery } from '../types/candidateFilteringTypes'

export const candidateFilteringKeys = {
  all: [...queryKeys.protected, 'candidate-filtering'] as const,
  runs: () => [...candidateFilteringKeys.all, 'runs'] as const,
  run: (filterRunId: string) => [...candidateFilteringKeys.runs(), filterRunId] as const,
  candidates: (query: CandidateResultsQuery) =>
    [...candidateFilteringKeys.run(query.filterRunId), 'candidates', query] as const,
}
