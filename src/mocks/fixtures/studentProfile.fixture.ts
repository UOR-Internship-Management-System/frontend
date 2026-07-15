import type { StudentProfileResponseDto } from '../../features/student-profile/types/studentProfileTypes'

export const studentProfileFixture: StudentProfileResponseDto = {
  studentId: '11111111-1111-4111-8111-111111111111',
  fullName: 'Test Student',
  indexNumber: 'SC/2022/12345',
  universityEmail: 'student@dcs.ruh.ac.lk',
  degreeProgramme: 'BSc Honours in Computer Science',
  studentLevel: 4,
  cohortYear: 2022,
  personalEmail: 'student@example.com',
  headline: 'Computer Science undergraduate',
  summary: 'Computer Science undergraduate interested in reliable software systems.',
  phone: '+94 71 234 5678',
  location: 'Matara, Sri Lanka',
  profilePhoto: {
    fileId: '22222222-2222-4222-8222-222222222222',
    fileName: 'test-student.jpg',
    mimeType: 'image/jpeg',
    fileSizeBytes: 120_000,
    url: 'https://images.example.edu/profiles/test-student.jpg',
    createdAt: '2026-07-01T08:00:00Z',
  },
  version: 1,
  updatedAt: '2026-07-01T08:00:00Z',
  cvSourceUpdatedAt: '2026-07-01T08:00:00Z',
}

export function createStudentProfileFixture(
  overrides: Partial<StudentProfileResponseDto> = {},
): StudentProfileResponseDto {
  return { ...studentProfileFixture, ...overrides }
}
