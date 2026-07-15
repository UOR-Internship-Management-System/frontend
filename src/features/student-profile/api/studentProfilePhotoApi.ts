import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import {
  profileUploadPolicySchema,
  studentProfileResponseSchema,
} from '../schemas/studentProfileSchemas'
import type { ProfileUploadPolicy } from '../types/profileFileTypes'
import type { StudentProfile } from '../types/studentProfileTypes'

export const studentProfilePhotoApi = {
  async getUploadPolicy(signal?: AbortSignal): Promise<ProfileUploadPolicy> {
    return profileUploadPolicySchema.parse(
      await httpClient<unknown>('/me/profile/upload-policy', { signal }),
    )
  },
  async upload(file: File, version: number): Promise<StudentProfile> {
    const body = new FormData()
    body.set('file', file)
    return studentProfileResponseSchema.parse(
      await httpClient<unknown>('/me/profile/photo', {
        method: 'PUT',
        body,
        headers: { 'If-Match': formatIfMatchVersion(version) },
      }),
    )
  },
  async remove(version: number): Promise<StudentProfile> {
    return studentProfileResponseSchema.parse(
      await httpClient<unknown>('/me/profile/photo', {
        method: 'DELETE',
        headers: { 'If-Match': formatIfMatchVersion(version) },
      }),
    )
  },
}
