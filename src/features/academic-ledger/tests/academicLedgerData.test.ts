import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import {
  canCommitLedger,
  ledgerPollInterval,
  mapUploadStatus,
} from '../mappers/academicLedgerMappers'
import {
  academicLedgerFileSchema,
  ledgerUploadDetailSchema,
  ledgerValidationResultSchema,
} from '../schemas/ledgerSchemas'

const upload = {
  uploadId: '11111111-1111-4111-8111-111111111111',
  originalFilename: 'ledger.csv',
  contentType: 'text/csv' as const,
  fileSizeBytes: 1024,
  uploadStatus: 'READY_TO_COMMIT' as const,
  validationStatus: 'PASSED' as const,
  totalRows: 2,
  validRows: 2,
  invalidRows: 0,
  uploadedAt: '2026-07-19T03:30:00Z',
  committedAt: null,
  failureSummary: null,
  statusMessage: 'Ready to commit.',
  nextPollAfterSeconds: null,
}

const validation = {
  uploadId: upload.uploadId,
  validationStatus: 'PASSED' as const,
  valid: true,
  totalRows: 2,
  validRows: 2,
  invalidRows: 0,
  errors: [],
}

describe('Academic Ledger foundation', () => {
  it('strictly validates lifecycle responses and cross-field totals', () => {
    expect(ledgerUploadDetailSchema.parse(upload)).toEqual(upload)
    expect(ledgerValidationResultSchema.parse(validation)).toEqual(validation)
    expect(() => ledgerValidationResultSchema.parse({ ...validation, invalidRows: 1 })).toThrow(
      ZodError,
    )
  })

  it('accepts safe browser CSV MIME behavior and rejects invalid files', () => {
    expect(
      academicLedgerFileSchema.safeParse(new File(['a'], 'ledger.csv', { type: 'text/csv' }))
        .success,
    ).toBe(true)
    expect(
      academicLedgerFileSchema.safeParse(new File(['a'], 'ledger.csv', { type: '' })).success,
    ).toBe(true)
    expect(
      academicLedgerFileSchema.safeParse(
        new File(['a'], 'ledger.json', { type: 'application/json' }),
      ).success,
    ).toBe(false)
    expect(
      academicLedgerFileSchema.safeParse(
        new File([new Uint8Array(5_242_881)], 'ledger.csv', { type: 'text/csv' }),
      ).success,
    ).toBe(false)
  })

  it('implements exact polling termination and commit eligibility rules', () => {
    expect(
      ledgerPollInterval({ ...upload, uploadStatus: 'PROCESSING', nextPollAfterSeconds: 2 }),
    ).toBe(2000)
    expect(
      ledgerPollInterval(
        {
          ...upload,
          uploadStatus: 'STAGED',
          validationStatus: 'IN_PROGRESS',
          nextPollAfterSeconds: null,
        },
        4,
      ),
    ).toBe(4000)
    expect(ledgerPollInterval({ ...upload, uploadStatus: 'STAGED' })).toBe(false)
    expect(ledgerPollInterval(upload)).toBe(false)
    expect(canCommitLedger({ detail: upload, validation, isPending: false })).toBe(true)
    expect(
      canCommitLedger({
        detail: upload,
        validation: { ...validation, valid: false },
        isPending: false,
      }),
    ).toBe(false)
    expect(mapUploadStatus('PROCESSING_FAILED')).toEqual({
      label: 'Processing failed',
      tone: 'danger',
    })
  })
})
