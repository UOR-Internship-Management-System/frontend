import { useEffect, useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { Modal } from '../../../shared/components/overlays/Modal'
import {
  getExportDownloadErrorMessage,
  useCandidateCvDownload,
  useDownloadExportFile,
} from '../../exports/hooks/useDownloadFile'
import { useStartBulkCvExport, useStartSummaryExport } from '../../exports/hooks/useBulkCvExport'
import { useExportJob } from '../../exports/hooks/useExportJob'
import { candidateCvFallbackFilename } from '../../exports/utils/fileDownload'
import type { useShortlistDetail } from '../hooks/useShortlists'
import type { ShortlistsUrlState } from '../types/shortlistTypes'

type ShortlistDetailQuery = ReturnType<typeof useShortlistDetail>
type Notice = { title: string; message: string; icon: string }

function jobIsReady(job: ReturnType<typeof useExportJob>['data']) {
  return Boolean(job?.status === 'COMPLETED' && job.downloadReady && job.downloadUrl)
}

export function ShortlistDetailWorkspace({
  candidateSearchInput,
  detail,
  onCandidateSearchInputChange,
  onClose,
  onMissingShortlist,
  onStateChange,
  selectedShortlistId,
  state,
}: {
  candidateSearchInput: string
  detail: ShortlistDetailQuery
  onCandidateSearchInputChange: (value: string) => void
  onClose: () => void
  onMissingShortlist: () => void
  onStateChange: (patch: Partial<ShortlistsUrlState>) => void
  selectedShortlistId: string
  state: ShortlistsUrlState
}) {
  const startSummary = useStartSummaryExport()
  const startBulk = useStartBulkCvExport()
  const summary = useExportJob(state.summaryExportJobId)
  const bulk = useExportJob(state.bulkCvExportJobId)
  const summaryDownload = useDownloadExportFile()
  const bulkDownload = useDownloadExportFile()
  const candidateCvDownload = useCandidateCvDownload()
  const handledJobs = useRef(new Set<string>())
  const [downloadingStudentId, setDownloadingStudentId] = useState<string>()
  const [notice, setNotice] = useState<Notice>()

  const resolvedDetail =
    detail.data?.shortlist.shortlistId === selectedShortlistId ? detail.data : undefined
  const mappedError = detail.isError ? mapApiError(detail.error, 'protected') : null

  useEffect(() => {
    if (!mappedError || mappedError.status !== 404) return
    onMissingShortlist()
  }, [mappedError, onMissingShortlist])

  useEffect(() => {
    const job = summary.data
    if (!job || !jobIsReady(job) || handledJobs.current.has(job.exportJobId)) return
    handledJobs.current.add(job.exportJobId)
    void summaryDownload
      .mutateAsync({ exportJobId: job.exportJobId, contentType: 'text/csv' })
      .then(() =>
        setNotice({
          title: 'Export Successful',
          message: 'The final shortlist spreadsheet download has started.',
          icon: 'assignment_turned_in',
        }),
      )
      .catch((error) =>
        setNotice({
          title: 'Export Failed',
          message: getExportDownloadErrorMessage(error),
          icon: 'error',
        }),
      )
  }, [summary.data, summaryDownload])

  useEffect(() => {
    const job = bulk.data
    if (!job || !jobIsReady(job) || handledJobs.current.has(job.exportJobId)) return
    handledJobs.current.add(job.exportJobId)
    void bulkDownload
      .mutateAsync({ exportJobId: job.exportJobId, contentType: 'application/zip' })
      .then(() =>
        setNotice({
          title: 'CV Archive Ready',
          message:
            'The archive of available latest saved ATS-compliant CVs has started downloading.',
          icon: 'download_done',
        }),
      )
      .catch((error) =>
        setNotice({
          title: 'CV Archive Failed',
          message: getExportDownloadErrorMessage(error),
          icon: 'error',
        }),
      )
  }, [bulk.data, bulkDownload])

  const closeModal = () => {
    if (notice) {
      setNotice(undefined)
      return
    }
    onCandidateSearchInputChange('')
    onStateChange({
      candidateSearch: '',
      candidateSort: 'officialGpa,desc',
      summaryExportJobId: undefined,
      bulkCvExportJobId: undefined,
    })
    onClose()
  }

  const downloadCandidateCv = async (
    candidate: NonNullable<typeof resolvedDetail>['candidates']['items'][number],
  ) => {
    setDownloadingStudentId(candidate.studentId)
    try {
      await candidateCvDownload.mutateAsync({
        studentId: candidate.studentId,
        fallbackFilename: candidateCvFallbackFilename(candidate.indexNumber),
      })
      setNotice({
        title: 'CV File Download',
        message: `The latest saved ATS-compliant CV for ${candidate.fullName} has started downloading.`,
        icon: 'download',
      })
    } catch (error) {
      setNotice({
        title: 'CV Download Failed',
        message: getExportDownloadErrorMessage(error),
        icon: 'error',
      })
    } finally {
      setDownloadingStudentId(undefined)
    }
  }

  const beginExport = async (type: 'summary' | 'bulk') => {
    const shortlist = resolvedDetail?.shortlist
    if (!shortlist || shortlist.status !== 'FINALIZED') return

    try {
      const result =
        type === 'summary'
          ? await startSummary.mutateAsync(shortlist.shortlistId)
          : await startBulk.mutateAsync(shortlist.shortlistId)
      onStateChange(
        type === 'summary'
          ? { summaryExportJobId: result.job.exportJobId }
          : { bulkCvExportJobId: result.job.exportJobId },
      )
      setNotice({
        title: 'Compiling Pipeline',
        message:
          type === 'summary'
            ? 'Compiling the finalized shortlist spreadsheet for download…'
            : 'Compiling available latest saved ATS-compliant CVs into a single archive…',
        icon: type === 'summary' ? 'assignment_turned_in' : 'download_zip',
      })
    } catch (error) {
      setNotice({
        title: 'Export Failed',
        message: mapApiError(error, 'protected').message,
        icon: 'error',
      })
    }
  }

  const shortlist = resolvedDetail?.shortlist
  const candidates = resolvedDetail?.candidates
  const exportPending =
    startSummary.isPending ||
    startBulk.isPending ||
    summary.data?.status === 'QUEUED' ||
    summary.data?.status === 'PROCESSING' ||
    bulk.data?.status === 'QUEUED' ||
    bulk.data?.status === 'PROCESSING'

  return (
    <Modal
      description={shortlist?.request.title}
      onClose={closeModal}
      size="wide"
      title={shortlist?.request.companyName ?? 'Shortlist details'}
    >
      <div className="shortlist-modal-content" inert={notice ? true : undefined}>
        <LoadingBoundary
          isLoading={detail.isPending || (detail.isFetching && !resolvedDetail)}
          label="Loading shortlisted candidates"
          minHeight={420}
          skeleton={<SkeletonBlock height={380} lines={0} variant="card" />}
        >
          {mappedError ? (
            <ErrorState
              correlationId={mappedError.correlationId}
              message={mappedError.message}
              onAction={() => void detail.refetch()}
              title="Shortlist details unavailable"
            />
          ) : shortlist && candidates ? (
            <>
              <div className="shortlist-modal-toolbar">
                <label className="shortlist-control shortlist-search-control">
                  <span>Search Candidates</span>
                  <span className="shortlist-search-input">
                    <span aria-hidden="true" className="material-symbols-outlined">
                      search
                    </span>
                    <input
                      aria-label="Search Candidates"
                      maxLength={120}
                      onChange={(event) => onCandidateSearchInputChange(event.target.value)}
                      placeholder="Search by name or index..."
                      type="search"
                      value={candidateSearchInput}
                    />
                  </span>
                </label>

                <label className="shortlist-control">
                  <span>Sort Rules</span>
                  <select
                    aria-label="Sort Rules"
                    onChange={(event) =>
                      onStateChange({
                        candidateSort:
                          event.target.value === 'officialGpa,asc'
                            ? 'officialGpa,asc'
                            : 'officialGpa,desc',
                      })
                    }
                    value={state.candidateSort}
                  >
                    <option value="officialGpa,desc">GPA (High to Low)</option>
                    <option value="officialGpa,asc">GPA (Low to High)</option>
                  </select>
                </label>

                <button
                  className="shortlist-outlined-button shortlist-modal-download"
                  disabled={exportPending || shortlist.status !== 'FINALIZED'}
                  onClick={() => void beginExport('bulk')}
                  type="button"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    download_zip
                  </span>
                  Download All CVs
                </button>
              </div>

              <p aria-live="polite" className="shortlist-live-region">
                {detail.isFetching && !detail.isPending ? 'Updating candidates…' : ''}
              </p>

              {candidates.items.length ? (
                <div className="shortlist-candidate-list">
                  {candidates.items.map((candidate) => (
                    <article className="shortlist-matrix-row" key={candidate.studentId}>
                      <div>
                        <h3>{candidate.fullName}</h3>
                        <p>
                          Index: {candidate.indexNumber} • GPA:{' '}
                          {candidate.officialGpa === null
                            ? 'Not available'
                            : candidate.officialGpa.toFixed(2)}
                        </p>
                      </div>
                      <button
                        className="shortlist-outlined-button"
                        disabled={!candidate.hasLatestSavedCv || candidateCvDownload.isPending}
                        onClick={() => void downloadCandidateCv(candidate)}
                        title={
                          candidate.hasLatestSavedCv
                            ? undefined
                            : 'No latest saved CV is available for this Student.'
                        }
                        type="button"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined">
                          download
                        </span>
                        {downloadingStudentId === candidate.studentId ? 'Downloading…' : 'CV'}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="shortlist-modal-empty" role="status">
                  No shortlisted candidates match the current search.
                </div>
              )}

              <footer className="shortlist-modal-actions">
                <button className="shortlist-outlined-button" onClick={closeModal} type="button">
                  Cancel
                </button>
                <button
                  className="shortlist-filled-button"
                  disabled={exportPending || shortlist.status !== 'FINALIZED'}
                  onClick={() => void beginExport('summary')}
                  type="button"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    assignment_turned_in
                  </span>
                  Download Final Shortlist
                </button>
              </footer>
            </>
          ) : null}
        </LoadingBoundary>
      </div>

      {notice ? (
        <div
          aria-label={notice.title}
          aria-modal="true"
          className="shortlist-notice-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setNotice(undefined)
          }}
          role="alertdialog"
        >
          <div className="shortlist-notice-card">
            <span aria-hidden="true" className="shortlist-notice-icon material-symbols-outlined">
              {notice.icon}
            </span>
            <h3>{notice.title}</h3>
            <p>{notice.message}</p>
            <button
              autoFocus
              className="shortlist-filled-button"
              onClick={() => setNotice(undefined)}
              type="button"
            >
              Acknowledge
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
