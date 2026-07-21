import { useMutation, useQueryClient } from '@tanstack/react-query'
import { exportsApi } from '../api/exportsApi'
import { exportKeys } from './exportQueryKeys'

function useStartExport(
  start: (shortlistId: string) => ReturnType<typeof exportsApi.startSummaryExport>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: start,
    onSuccess: ({ job }) => {
      queryClient.setQueryData(exportKeys.job(job.exportJobId), job)
    },
  })
}

export function useStartSummaryExport() {
  return useStartExport((shortlistId) => exportsApi.startSummaryExport(shortlistId))
}

export function useStartBulkCvExport() {
  return useStartExport((shortlistId) => exportsApi.startBulkCvExport(shortlistId))
}
