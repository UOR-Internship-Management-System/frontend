import { describe, expect, it } from 'vitest'
import { exportJobPollInterval } from '../hooks/useExportJob'
import { exportJobResponseSchema } from '../schemas/exportSchemas'

const completedSummary = {
  exportJobId: '11111111-1111-4111-8111-111111111111',
  shortlistId: '22222222-2222-4222-8222-222222222222',
  exportType: 'SHORTLIST_SUMMARY_CSV',
  format: 'CSV',
  status: 'COMPLETED',
  totalCandidateCount: 2,
  includedFileCount: 2,
  missingCvCount: 0,
  missingCvStudents: [],
  warnings: [],
  downloadReady: true,
  downloadUrl: '/api/v1/admin/exports/11111111-1111-4111-8111-111111111111/download',
  createdAt: '2026-07-21T09:30:00Z',
  startedAt: '2026-07-21T09:30:01Z',
  completedAt: '2026-07-21T09:30:02Z',
  expiresAt: '2026-07-22T09:30:02Z',
  failureCode: null,
  failureMessage: null,
}

describe('export contracts', () => {
  it('accepts a consistent completed export and stops polling terminal jobs', () => {
    const job = exportJobResponseSchema.parse(completedSummary)

    expect(job.downloadReady).toBe(true)
    expect(exportJobPollInterval(job)).toBe(false)
  })

  it('polls queued and processing jobs at a controlled interval', () => {
    const job = exportJobResponseSchema.parse(completedSummary)

    expect(exportJobPollInterval({ ...job, status: 'QUEUED' })).toBe(2_000)
    expect(exportJobPollInterval({ ...job, status: 'PROCESSING' })).toBe(2_000)
  })

  it('rejects download readiness that disagrees with job status', () => {
    expect(() =>
      exportJobResponseSchema.parse({
        ...completedSummary,
        status: 'PROCESSING',
      }),
    ).toThrow(/Download readiness must agree/)
  })

  it('rejects mismatched missing-CV metadata and empty completed bulk archives', () => {
    expect(() =>
      exportJobResponseSchema.parse({
        ...completedSummary,
        missingCvCount: 1,
      }),
    ).toThrow(/Missing CV count must match/)

    expect(() =>
      exportJobResponseSchema.parse({
        ...completedSummary,
        exportType: 'BULK_LATEST_CV_ZIP',
        format: 'ZIP',
        includedFileCount: 0,
        downloadUrl: '/api/v1/admin/exports/11111111-1111-4111-8111-111111111111/bulk-cvs/download',
      }),
    ).toThrow(/must contain at least one file/)
  })
})
