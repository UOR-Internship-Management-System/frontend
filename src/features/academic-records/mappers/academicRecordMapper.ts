import type {
  AcademicRecord,
  AcademicRecordView,
  AcademicSortOption,
  GpaSummary,
  GpaSummaryView,
} from '../types/academicRecordTypes'

export const academicSortOptions: readonly AcademicSortOption[] = [
  { label: 'Academic year · newest', value: 'academicYear,desc' },
  { label: 'Academic year · oldest', value: 'academicYear,asc' },
  { label: 'Semester', value: 'semester,asc' },
  { label: 'Course code · A–Z', value: 'courseCode,asc' },
  { label: 'Course code · Z–A', value: 'courseCode,desc' },
  { label: 'Course title · A–Z', value: 'courseTitle,asc' },
  { label: 'Course title · Z–A', value: 'courseTitle,desc' },
  { label: 'Credits · highest', value: 'credits,desc' },
  { label: 'Credits · lowest', value: 'credits,asc' },
  { label: 'Letter grade · A–Z', value: 'letterGrade,asc' },
  { label: 'Letter grade · Z–A', value: 'letterGrade,desc' },
  { label: 'Grade point · highest', value: 'gradePoint,desc' },
  { label: 'Grade point · lowest', value: 'gradePoint,asc' },
  { label: 'Recently committed', value: 'committedAt,desc' },
]

export function mapAcademicRecord(record: AcademicRecord): AcademicRecordView {
  return {
    ...record,
    creditsLabel: formatNumber(record.credits, 1),
    gradePointLabel: formatNumber(record.gradePoint, 2),
    periodLabel: `${record.academicYear} · ${record.semester}`,
    committedAtLabel: formatDateTime(record.committedAt),
  }
}

export function mapGpaSummary(summary: GpaSummary): GpaSummaryView {
  return {
    ...summary,
    gpaLabel:
      summary.computerScienceGpa === null ? null : formatNumber(summary.computerScienceGpa, 2),
    creditsLabel: summary.totalCredits === null ? null : formatNumber(summary.totalCredits, 1),
    calculatedAtLabel: summary.calculatedAt ? formatDateTime(summary.calculatedAt) : null,
    sourceLabel: summary.source
      ? `Committed on ${formatDateTime(summary.source.committedAt)}`
      : null,
  }
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
