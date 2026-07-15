import type {
  StudentProfile,
  StudentProfileFormValues,
  StudentProfileResponseDto,
  StudentProfileUpdateRequest,
} from '../types/studentProfileTypes'

const nullableFields = ['personalEmail', 'headline', 'summary', 'phone', 'location'] as const

export function mapStudentProfileResponse(dto: StudentProfileResponseDto): StudentProfile {
  return dto
}

export function mapStudentProfileToForm(profile: StudentProfile): StudentProfileFormValues {
  return {
    fullName: profile.fullName,
    personalEmail: profile.personalEmail ?? '',
    headline: profile.headline ?? '',
    summary: profile.summary ?? '',
    phone: profile.phone ?? '',
    location: profile.location ?? '',
  }
}

export function mapStudentProfileUpdateRequest(
  values: StudentProfileFormValues,
  baseline?: StudentProfileFormValues,
): StudentProfileUpdateRequest {
  const request: StudentProfileUpdateRequest = {}
  const fullName = values.fullName.trim()

  if (!baseline || fullName !== baseline.fullName.trim()) {
    request.fullName = fullName
  }

  for (const field of nullableFields) {
    const value = values[field].trim()
    if (!baseline || value !== baseline[field].trim()) {
      request[field] = value || null
    }
  }

  return request
}
