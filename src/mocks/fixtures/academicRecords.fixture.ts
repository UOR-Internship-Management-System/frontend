import type {
  AcademicRecord,
  GpaSummary,
} from '../../features/academic-records/types/academicRecordTypes'
import {
  academicRecordSchema,
  gpaSummarySchema,
} from '../../features/academic-records/schemas/academicRecordSchemas'

export type AcademicRecordsFailure = 'service-unavailable' | 'unauthorized' | null

export const availableGpaFixture = gpaSummarySchema.parse({
  studentId: '30000000-0000-4000-8000-000000000001',
  status: 'AVAILABLE',
  computerScienceGpa: 3.75,
  totalCredits: 96,
  calculatedAt: '2026-07-14T08:31:00Z',
  source: {
    sourceUploadId: '40000000-0000-4000-8000-000000000001',
    committedAt: '2026-07-14T08:30:00Z',
  },
})

export const unavailableGpaFixture = gpaSummarySchema.parse({
  studentId: '30000000-0000-4000-8000-000000000001',
  status: 'NOT_AVAILABLE',
  computerScienceGpa: null,
  totalCredits: null,
  calculatedAt: null,
  source: null,
})

const recordSeeds = [
  ['CS4010', 'Distributed Systems', '2025/26', 'Semester 1', 4, 'A'],
  ['CS4020', 'Cloud Computing', '2025/26', 'Semester 1', 3.7, 'A-'],
  ['CS4030', 'Machine Learning', '2025/26', 'Semester 1', 3.3, 'B+'],
  ['CS4040', 'Software Architecture', '2025/26', 'Semester 1', 4, 'A'],
  ['CS4050', 'Information Security', '2025/26', 'Semester 1', 3.7, 'A-'],
  ['CS4060', 'Human Computer Interaction', '2025/26', 'Semester 1', 3.3, 'B+'],
  ['CS3010', 'Algorithms', '2024/25', 'Semester 2', 4, 'A'],
  ['CS3020', 'Database Systems', '2024/25', 'Semester 2', 3.7, 'A-'],
  ['CS3030', 'Operating Systems', '2024/25', 'Semester 2', 3.3, 'B+'],
  ['CS3040', 'Computer Networks', '2024/25', 'Semester 2', 3, 'B'],
  ['CS2010', 'Object Oriented Design', '2023/24', 'Semester 2', 3.7, 'A-'],
  ['CS2020', 'Legacy Systems', '2023/24', 'Semester 2', 3, 'B'],
] as const

export const academicRecordsFixture: AcademicRecord[] = recordSeeds.map(
  ([courseCode, courseTitle, academicYear, semester, gradePoint, letterGrade], index) =>
    academicRecordSchema.parse({
      academicRecordId: `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      subjectId: `20000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      courseCode,
      courseTitle,
      credits: 3,
      letterGrade,
      gradePoint,
      semester,
      academicYear,
      attemptNumber: 1,
      resultStatus: 'PASSED',
      committedAt: `2026-07-${String(14 - Math.min(index, 9)).padStart(2, '0')}T08:30:00Z`,
    }),
)

type AcademicRecordsFixtureState = {
  gpa: GpaSummary
  records: AcademicRecord[]
  gpaFailure: AcademicRecordsFailure
  recordsFailure: AcademicRecordsFailure
}

const initialState: AcademicRecordsFixtureState = {
  gpa: availableGpaFixture,
  records: academicRecordsFixture,
  gpaFailure: null,
  recordsFailure: null,
}

let state = structuredClone(initialState)

export function getAcademicRecordsFixtureState() {
  return state
}

export function setGpaFixture(gpa: GpaSummary) {
  state.gpa = gpaSummarySchema.parse(gpa)
}

export function setAcademicRecordsFixture(records: AcademicRecord[]) {
  state.records = records.map((record) => academicRecordSchema.parse(record))
}

export function setGpaFailure(failure: AcademicRecordsFailure) {
  state.gpaFailure = failure
}

export function setAcademicRecordsFailure(failure: AcademicRecordsFailure) {
  state.recordsFailure = failure
}

export function resetAcademicRecordsMock() {
  state = structuredClone(initialState)
}
