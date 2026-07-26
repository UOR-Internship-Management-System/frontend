import type {
  AcademicRecord,
  AcademicRecordView,
  GpaSummary,
  GpaSummaryView,
} from '../types/academicRecordTypes'

export function mapAcademicRecord(record: AcademicRecord): AcademicRecordView {
  return {
    ...record,
    creditsLabel: formatNumber(record.credits, 1),
    gradePointLabel: formatNumber(record.gradePoint, 2),
  }
}

export function mapGpaSummary(summary: GpaSummary): GpaSummaryView {
  return {
    ...summary,
    gpaLabel:
      summary.computerScienceGpa === null ? null : formatNumber(summary.computerScienceGpa, 2),
  }
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value)
}
