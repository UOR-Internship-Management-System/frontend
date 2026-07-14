export type StudentProfileResponseDto = {
  studentId?: string
  fullName?: string
  indexNumber?: string
  universityEmail?: string
  summary?: string
  phone?: string
  profilePhotoUrl?: string
}

export type StudentProfileUpdateRequest = {
  fullName: string
  summary: string
  phone: string
}

export type StudentProfile = {
  studentId: string | null
  fullName: string
  indexNumber: string
  universityEmail: string
  summary: string
  phone: string
  profilePhotoUrl: string | null
}

export type StudentProfileFormValues = Pick<StudentProfile, 'fullName' | 'summary' | 'phone'>

export type StudentProfileFormField = keyof StudentProfileFormValues
