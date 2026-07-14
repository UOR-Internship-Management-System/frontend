import { httpClient } from '../../../shared/api/httpClient'
import {
  mapStudentProfileResponse,
  mapStudentProfileUpdateRequest,
} from '../mappers/studentProfileMapper'
import { studentProfileResponseSchema } from '../schemas/studentProfileSchemas'
import type { StudentProfile, StudentProfileFormValues } from '../types/studentProfileTypes'

export const studentProfileApi = {
  async getCurrent(signal?: AbortSignal): Promise<StudentProfile> {
    const response = await httpClient<unknown>('/me/profile', { signal })
    return mapStudentProfileResponse(studentProfileResponseSchema.parse(response))
  },

  async updateCurrent(
    values: StudentProfileFormValues,
    signal?: AbortSignal,
  ): Promise<StudentProfile> {
    const response = await httpClient<unknown>('/me/profile', {
      method: 'PATCH',
      body: mapStudentProfileUpdateRequest(values),
      signal,
    })
    return mapStudentProfileResponse(studentProfileResponseSchema.parse(response))
  },
}
