import { Button } from '../../../shared/components/ui/Button'

export function ProfileEditorActions({
  isPending,
  onCancel,
  submitLabel,
}: {
  isPending: boolean
  onCancel: () => void
  submitLabel: string
}) {
  return (
    <div className="modal-actions profile-editor-actions">
      <Button disabled={isPending} onClick={onCancel} variant="secondary">
        Cancel
      </Button>
      <Button isLoading={isPending} type="submit">
        {submitLabel}
      </Button>
    </div>
  )
}
