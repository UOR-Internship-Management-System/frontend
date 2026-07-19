import { useState } from 'react'
import type { ApiAcademicLedgerUploadDetailResponse } from '../../../shared/api/generated/cvManagementApi.types'
import { Button } from '../../../shared/components/ui/Button'
import { canCommitLedger } from '../mappers/academicLedgerMappers'
import { useCommitLedger } from '../hooks/useCommitLedger'
import { useLedgerValidation } from '../hooks/useLedgerRecords'
import { LedgerCommitDialog } from './LedgerCommitDialog'

export function LedgerCommitControl({ detail }: { detail: ApiAcademicLedgerUploadDetailResponse }) {
  const [isOpen, setIsOpen] = useState(false)
  const validation = useLedgerValidation(detail.uploadId)
  const commit = useCommitLedger(detail.uploadId)
  const isEligible = canCommitLedger({
    detail,
    validation: validation.data,
    isPending: commit.isPending,
  })

  if (detail.uploadStatus === 'COMMITTED') {
    return (
      <section aria-labelledby="ledger-commit-title" className="section-card ledger-commit-control">
        <div>
          <p className="section-kicker">Final step</p>
          <h2 id="ledger-commit-title">Records already committed</h2>
          <p>
            This batch was committed
            {detail.committedAt
              ? ` on ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(detail.committedAt))}`
              : ''}
            . It remains read-only in this workflow.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="ledger-commit-title" className="section-card ledger-commit-control">
      <div>
        <p className="section-kicker">Final step</p>
        <h2 id="ledger-commit-title">Commit validated records</h2>
        <p>Commit becomes available only after server validation passes with zero invalid rows.</p>
      </div>
      {commit.data ? (
        <div className="ledger-commit-result" role="status">
          <strong>Academic records committed successfully.</strong>
          <p>
            {commit.data.committedRecords} records · {commit.data.affectedStudents} Students ·{' '}
            {commit.data.recalculatedGpaCount} GPA values recalculated
          </p>
        </div>
      ) : null}
      <Button
        disabled={!isEligible}
        onClick={() => {
          commit.reset()
          setIsOpen(true)
        }}
      >
        Commit official records
      </Button>
      {!isEligible && !commit.data ? (
        <p className="field-help">
          Waiting for a ready-to-commit batch and a passed validation result.
        </p>
      ) : null}
      {isOpen ? (
        <LedgerCommitDialog
          totalRows={validation.data?.totalRows ?? detail.totalRows}
          invalidRows={validation.data?.invalidRows ?? detail.invalidRows}
          isPending={commit.isPending}
          error={commit.error}
          onClose={() => setIsOpen(false)}
          onConfirm={() => commit.mutate(undefined, { onSuccess: () => setIsOpen(false) })}
        />
      ) : null}
    </section>
  )
}
