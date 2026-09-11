export const ELIGIBLE_STUDENTS_PAGE_SIZE = 10

export type EligibleStudent = {
  id: string
  indexNumber: string
  universityEmail: string
  fullName: string
  academicLevel: 3 | 4
  active: boolean
  registered: boolean
  createdAt: string
  updatedAt: string
}

export type EligibleStudentQuery = {
  page: number
  size: number
  sort: string
  search: string
}

export type PageMetadata = {
  page: number
  size: number
  totalElements: number
  totalPages: number
  sort: string
}

export type PagedResponse<T> = { items: T[]; page: PageMetadata }

export type EligibleStudentFormValues = {
  indexNumber: string
  universityEmail: string
  fullName: string
  academicLevel: '3' | '4' | ''
}

export type EligibleStudentRequest = {
  indexNumber: string
  universityEmail: string
  fullName: string
  academicLevel: 3 | 4
}

export type EligibleStudentImportRowError = { row: number; message: string }

export type EligibleStudentImportResult = {
  totalRows: number
  importedCount: number
  skippedCount: number
  errors: EligibleStudentImportRowError[]
}
