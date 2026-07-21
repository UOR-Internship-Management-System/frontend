import { useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { exportsApi } from '../api/exportsApi'
import type { ExportJob } from '../types/exportTypes'
import { exportKeys } from './exportQueryKeys'

export function exportJobPollInterval(job: ExportJob | undefined) {
  return job?.status === 'QUEUED' || job?.status === 'PROCESSING' ? 2_000 : false
}

export function useExportJob(exportJobId?: string) {
  return useQuery({
    enabled: Boolean(exportJobId),
    queryKey: exportKeys.job(exportJobId ?? ''),
    queryFn: ({ signal }) => exportsApi.getExportJob(exportJobId ?? '', signal),
    refetchInterval: (query) => exportJobPollInterval(query.state.data),
    retry: (failureCount, error) => {
      if (error instanceof ZodError) return false
      const status = mapApiError(error, 'protected').status
      if (status && status < 500) return false
      return failureCount < 1
    },
  })
}
