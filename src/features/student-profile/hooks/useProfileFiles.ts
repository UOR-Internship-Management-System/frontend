import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentProfilePhotoApi } from '../api/studentProfilePhotoApi'
import type { StudentProfile } from '../types/studentProfileTypes'
import { studentProfileKeys } from './studentProfileKeys'

export function useProfileUploadPolicy() {
  return useQuery({
    queryKey: studentProfileKeys.uploadPolicy(),
    queryFn: ({ signal }) => studentProfilePhotoApi.getUploadPolicy(signal),
  })
}

export function useProfilePhotoMutations() {
  const queryClient = useQueryClient()
  const commit = async (profile: StudentProfile) => {
    queryClient.setQueryData(studentProfileKeys.core(), profile)
    await queryClient.invalidateQueries({
      queryKey: studentProfileKeys.core(),
      refetchType: 'active',
    })
  }
  return {
    upload: useMutation({
      mutationFn: ({ file, version }: { file: File; version: number }) =>
        studentProfilePhotoApi.upload(file, version),
      onSuccess: commit,
    }),
    remove: useMutation({
      mutationFn: (version: number) => studentProfilePhotoApi.remove(version),
      onSuccess: commit,
    }),
  }
}
