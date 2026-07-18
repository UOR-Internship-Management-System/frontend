import { useQuery } from '@tanstack/react-query'
import { academicRecordsApi } from '../api/academicRecordsApi'
import { mapGpaSummary } from '../mappers/academicRecordMapper'
import { academicRecordKeys } from './academicRecordKeys'
import { shouldRetryAcademicRecordsQuery } from './useAcademicRecords'

export function useGpaSummary() {
  return useQuery({
    queryKey: academicRecordKeys.gpa(),
    queryFn: ({ signal }) => academicRecordsApi.getGpa(signal),
    retry: shouldRetryAcademicRecordsQuery,
    select: mapGpaSummary,
  })
}
