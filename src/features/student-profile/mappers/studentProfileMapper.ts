import type {
  StudentProfile,
  StudentProfileFormValues,
  StudentProfileResponseDto,
  StudentProfileUpdateRequest,
} from '../types/studentProfileTypes'

export function mapStudentProfileResponse(dto: StudentProfileResponseDto): StudentProfile {
  return {
    studentId: dto.studentId ?? null,
    fullName: dto.fullName ?? '',
    indexNumber: dto.indexNumber ?? '',
    universityEmail: dto.universityEmail ?? '',
    summary: dto.summary ?? '',
    phone: dto.phone ?? '',
    profilePhotoUrl: dto.profilePhotoUrl ?? null,
  }
}

export function mapStudentProfileToForm(profile: StudentProfile): StudentProfileFormValues {
  return {
    fullName: profile.fullName,
    summary: profile.summary,
    phone: profile.phone,
  }
}

export function mapStudentProfileUpdateRequest(
  values: StudentProfileFormValues,
): StudentProfileUpdateRequest {
  return {
    fullName: values.fullName.trim(),
    summary: values.summary.trim(),
    phone: values.phone.trim(),
  }
}
