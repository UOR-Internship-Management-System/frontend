import type { StudentProfileResponseDto } from '../../features/student-profile/types/studentProfileTypes'

export const studentProfileFixture: Required<StudentProfileResponseDto> = {
  studentId: '11111111-1111-4111-8111-111111111111',
  fullName: 'Test Student',
  indexNumber: 'SC/2022/12345',
  universityEmail: 'student@dcs.ruh.ac.lk',
  summary: 'Computer Science undergraduate interested in reliable software systems.',
  phone: '+94 71 234 5678',
  profilePhotoUrl: 'https://images.example.edu/profiles/test-student.jpg',
}

export function createStudentProfileFixture(
  overrides: Partial<StudentProfileResponseDto> = {},
): StudentProfileResponseDto {
  return { ...studentProfileFixture, ...overrides }
}
