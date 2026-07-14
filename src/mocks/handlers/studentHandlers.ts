import { http, HttpResponse } from 'msw'
import type { StudentProfileUpdateRequest } from '../../features/student-profile/types/studentProfileTypes'
import { createStudentProfileFixture } from '../fixtures/studentProfile.fixture'

const apiBase = '/api/v1'
const editableProfileFields = new Set(['fullName', 'summary', 'phone'])

let currentProfile = createStudentProfileFixture()

export function resetStudentProfileMock() {
  currentProfile = createStudentProfileFixture()
}

function problem(status: number, code: string, message: string) {
  return {
    type: `https://uor-cv-system/errors/${code.toLowerCase().replaceAll('_', '-')}`,
    title: status === 422 ? 'Validation failed' : 'Request failed',
    status,
    code,
    message,
    correlationId: `mock-${status}`,
  }
}

export const studentHandlers = [
  http.get(`${apiBase}/me/profile`, () => HttpResponse.json(currentProfile)),
  http.patch(`${apiBase}/me/profile`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const unsupportedFields = Object.keys(body).filter((field) => !editableProfileFields.has(field))

    if (unsupportedFields.length > 0) {
      return HttpResponse.json(
        {
          ...problem(422, 'VALIDATION_FAILED', 'One or more fields are invalid.'),
          fieldErrors: unsupportedFields.map((field) => ({
            field,
            code: 'FIELD_NOT_EDITABLE',
            message: 'This field cannot be updated.',
          })),
        },
        { status: 422 },
      )
    }

    const update = body as StudentProfileUpdateRequest
    currentProfile = {
      ...currentProfile,
      fullName: update.fullName,
      summary: update.summary,
      phone: update.phone,
    }

    return HttpResponse.json(currentProfile)
  }),
]
