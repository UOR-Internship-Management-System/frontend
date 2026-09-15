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
      <Button disabled={isPending} onClick={onCancel} variant="outlined">
        Cancel
      </Button>
      <Button
        icon={
          <span className="material-symbols-outlined" aria-hidden="true">
            check
          </span>
        }
        isLoading={isPending}
        type="submit"
        variant="primary"
      >
        {submitLabel}
      </Button>
    </div>
  )
}
