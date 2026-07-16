import type { FileAsset } from './profileFileTypes'

export type StudentProfileResponseDto = {
  studentId: string
  fullName: string
  indexNumber: string
  universityEmail: string
  degreeProgramme: string
  studentLevel: 3 | 4
  cohortYear: number | null
  personalEmail: string | null
  headline: string | null
  summary: string | null
  phone: string | null
  location: string | null
  profilePhoto: FileAsset | null
  version: number
  updatedAt: string
  cvSourceUpdatedAt: string
}

export type StudentProfileUpdateRequest = Partial<{
  fullName: string
  personalEmail: string | null
  headline: string | null
  summary: string | null
  phone: string | null
  location: string | null
}>

export type StudentProfile = StudentProfileResponseDto

export type StudentProfileFormValues = {
  fullName: string
  personalEmail: string
  headline: string
  summary: string
  phone: string
  location: string
}

export type StudentProfileFormField = keyof StudentProfileFormValues

export type UpdateStudentProfileInput = {
  baseline: StudentProfileFormValues
  values: StudentProfileFormValues
  version: number
}
