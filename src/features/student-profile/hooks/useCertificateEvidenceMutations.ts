import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  removeCertificateEvidence,
  uploadCertificateEvidence,
} from '../api/studentProfileEntriesApi'
import { invalidateProfileSourceQueries } from './invalidateProfileSourceQueries'

export function useCertificateEvidenceMutations() {
  const queryClient = useQueryClient()
  const refresh = () => invalidateProfileSourceQueries(queryClient, 'certificates')

  return {
    upload: useMutation({
      mutationFn: ({
        certificateId,
        file,
        version,
      }: {
        certificateId: string
        file: File
        version: number
      }) => uploadCertificateEvidence(certificateId, version, file),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: ({ certificateId, version }: { certificateId: string; version: number }) =>
        removeCertificateEvidence(certificateId, version),
      onSuccess: refresh,
    }),
  }
}
