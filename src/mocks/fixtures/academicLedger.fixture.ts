import type {
  ApiAcademicLedgerStagedRowResponse,
  ApiAcademicLedgerUploadDetailResponse,
  ApiAcademicLedgerUploadSummaryResponse,
  ApiAcademicLedgerValidationResultResponse,
} from '../../shared/api/generated/cvManagementApi.types'

export const ledgerUploadId = '9acbe15c-1412-49c7-a728-a923480da95a'
export const ledgerUploadDetailFixture: ApiAcademicLedgerUploadDetailResponse = {
  uploadId: ledgerUploadId,
  originalFilename: 'semester-1-results.csv',
  contentType: 'text/csv',
  fileSizeBytes: 16384,
  uploadStatus: 'READY_TO_COMMIT',
  validationStatus: 'PASSED',
  totalRows: 4,
  validRows: 4,
  invalidRows: 0,
  uploadedAt: '2026-07-18T08:30:00+05:30',
  committedAt: null,
  failureSummary: null,
  statusMessage: 'All staged rows passed validation and are ready to commit.',
  nextPollAfterSeconds: null,
}

const ledgerUploadSummaryFixture: ApiAcademicLedgerUploadSummaryResponse = {
  uploadId: ledgerUploadDetailFixture.uploadId,
  originalFilename: ledgerUploadDetailFixture.originalFilename,
  contentType: ledgerUploadDetailFixture.contentType,
  fileSizeBytes: ledgerUploadDetailFixture.fileSizeBytes,
  uploadStatus: ledgerUploadDetailFixture.uploadStatus,
  validationStatus: ledgerUploadDetailFixture.validationStatus,
  totalRows: ledgerUploadDetailFixture.totalRows,
  validRows: ledgerUploadDetailFixture.validRows,
  invalidRows: ledgerUploadDetailFixture.invalidRows,
  uploadedAt: ledgerUploadDetailFixture.uploadedAt,
  committedAt: ledgerUploadDetailFixture.committedAt,
  failureSummary: ledgerUploadDetailFixture.failureSummary,
}

export const ledgerUploadsFixture: ApiAcademicLedgerUploadSummaryResponse[] = [
  ledgerUploadSummaryFixture,
  {
    ...ledgerUploadSummaryFixture,
    uploadId: 'fc7f5a1a-c4ec-43c7-ab48-0de25394552c',
    originalFilename: 'supplementary-results.csv',
    uploadStatus: 'COMMITTED',
    committedAt: '2026-07-17T10:30:00+05:30',
    uploadedAt: '2026-07-17T10:00:00+05:30',
  },
]

export const ledgerStagedRowsFixture: ApiAcademicLedgerStagedRowResponse[] = [
  ['2021CS001', 'CS4010', 'Distributed Systems', 'A', 4, 'VALID', []],
  [
    '2021CS002',
    'CS4010',
    'Distributed Systems',
    'B+',
    3.3,
    'WARNING',
    [
      {
        rowNumber: 2,
        field: 'letterGrade',
        code: 'GRADE_REVIEW',
        message: 'Confirm the moderated grade.',
        severity: 'WARNING',
        rejectedValue: 'B+',
        relatedRowNumber: null,
      },
    ],
  ],
  ['2021CS003', 'CS4020', 'Machine Learning', 'A-', 3.7, 'VALID', []],
  [
    '2021CS004',
    'CS4020',
    'Machine Learning',
    'C',
    2,
    'INVALID',
    [
      {
        rowNumber: 4,
        field: 'studentIndexNumber',
        code: 'STUDENT_NOT_FOUND',
        message: 'No registered Student matches this index number.',
        severity: 'ERROR',
        rejectedValue: '2021CS004',
        relatedRowNumber: null,
      },
    ],
  ],
].map(
  (
    [
      studentIndexNumber,
      courseCode,
      courseTitle,
      letterGrade,
      gradePoint,
      validationStatus,
      validationErrors,
    ],
    index,
  ) => ({
    stagingRowId: `00000000-0000-4000-8000-00000000000${index + 1}`,
    uploadId: ledgerUploadId,
    rowNumber: index + 1,
    studentIndexNumber: String(studentIndexNumber),
    studentId: index === 3 ? null : `10000000-0000-4000-8000-00000000000${index + 1}`,
    courseCode: String(courseCode),
    courseTitle: String(courseTitle),
    credits: 3,
    letterGrade: String(letterGrade),
    gradePoint: Number(gradePoint),
    semester: 'Semester 1',
    academicYear: '2025/2026',
    attemptNumber: 1,
    resultStatus: 'COMPLETED',
    validationStatus: validationStatus as ApiAcademicLedgerStagedRowResponse['validationStatus'],
    validationErrors: validationErrors as ApiAcademicLedgerStagedRowResponse['validationErrors'],
  }),
)

export const ledgerValidationFixture: ApiAcademicLedgerValidationResultResponse = {
  uploadId: ledgerUploadId,
  validationStatus: 'PASSED',
  valid: true,
  totalRows: 4,
  validRows: 4,
  invalidRows: 0,
  errors: [],
}
