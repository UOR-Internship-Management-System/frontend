import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import {
  mapStudentProfileResponse,
  mapStudentProfileUpdateRequest,
} from '../mappers/studentProfileMapper'
import { studentProfileResponseSchema } from '../schemas/studentProfileSchemas'
import type {
  StudentProfile,
  StudentProfileFormValues,
  StudentProfileUpdateRequest,
} from '../types/studentProfileTypes'

export const studentProfileApi = {
  async getCurrent(signal?: AbortSignal): Promise<StudentProfile> {
    const response = await httpClient<unknown>('/me/profile', { signal })
    return mapStudentProfileResponse(studentProfileResponseSchema.parse(response))
  },

  async updateCurrent(
    values: StudentProfileFormValues,
    version: number,
    baseline?: StudentProfileFormValues,
    signal?: AbortSignal,
  ): Promise<StudentProfile> {
    const body: StudentProfileUpdateRequest = mapStudentProfileUpdateRequest(values, baseline)
    if (Object.keys(body).length === 0) {
      throw new TypeError('At least one changed Profile field is required.')
    }

    const response = await httpClient<unknown>('/me/profile', {
      method: 'PATCH',
      body,
      headers: { 'If-Match': formatIfMatchVersion(version) },
      signal,
    })
    return mapStudentProfileResponse(studentProfileResponseSchema.parse(response))
  },
}
