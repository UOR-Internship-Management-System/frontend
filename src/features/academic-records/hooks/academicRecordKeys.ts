import { queryKeys } from '../../../shared/api/queryKeys'
import type { AcademicRecordQuery } from '../types/academicRecordTypes'

export const academicRecordKeys = {
  all: [...queryKeys.protected, 'academic-records'] as const,
  records: () => [...academicRecordKeys.all, 'records'] as const,
  recordList: (query: AcademicRecordQuery) =>
    [...academicRecordKeys.records(), 'list', query] as const,
  gpa: () => [...academicRecordKeys.all, 'gpa'] as const,
}
