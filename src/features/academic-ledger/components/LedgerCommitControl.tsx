import { useState } from 'react'
import type { LedgerUploadDetail } from '../schemas/ledgerSchemas'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
import { canCommitLedger } from '../mappers/academicLedgerMappers'
import { useCommitLedger } from '../hooks/useCommitLedger'
import { useLedgerValidation } from '../hooks/useLedgerRecords'
import { LedgerCommitDialog } from './LedgerCommitDialog'

export function LedgerCommitControl({ detail }: { detail: LedgerUploadDetail }) {
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
      <Card aria-labelledby="ledger-commit-title" variant="outlined">
        <CardHeader>
          <CardTitle id="ledger-commit-title">Records already committed</CardTitle>
          <p>
            This batch was committed
            {detail.committedAt
              ? ` on ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(detail.committedAt))}`
              : ''}
            . It remains read-only in this workflow.
          </p>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card aria-labelledby="ledger-commit-title" variant="outlined">
      <CardHeader>
        <CardTitle id="ledger-commit-title">Commit validated records</CardTitle>
        <p>Commit becomes available only after server validation passes with zero invalid rows.</p>
      </CardHeader>
      <CardContent className="al-commit-content">
        {commit.data ? (
          <div className="al-commit-result" role="status">
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
          <p className="field-hint">
            Waiting for a ready-to-commit batch and a passed validation result.
          </p>
        ) : null}
      </CardContent>
      {isOpen ? (
        <LedgerCommitDialog
          error={commit.error}
          invalidRows={validation.data?.invalidRows ?? detail.invalidRows}
          isPending={commit.isPending}
          onClose={() => setIsOpen(false)}
          onConfirm={() => commit.mutate(undefined, { onSuccess: () => setIsOpen(false) })}
          totalRows={validation.data?.totalRows ?? detail.totalRows}
        />
      ) : null}
    </Card>
  )
}
