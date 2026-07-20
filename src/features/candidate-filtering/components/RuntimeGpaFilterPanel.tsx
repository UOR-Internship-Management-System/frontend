import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'

export function RuntimeGpaFilterPanel({
  disabled,
  error,
  maxGpa,
  minGpa,
  onMaxGpaChange,
  onMinGpaChange,
}: {
  disabled?: boolean
  error?: string
  maxGpa?: number
  minGpa?: number
  onMaxGpaChange: (value?: number) => void
  onMinGpaChange: (value?: number) => void
}) {
  const update = (value: string, onChange: (next?: number) => void) =>
    onChange(value === '' ? undefined : Number(value))

  return (
    <fieldset className="filtering-gpa-panel" disabled={disabled}>
      <legend>Official GPA criteria</legend>
      <p>Optional runtime bounds from the latest committed academic records.</p>
      <div className="filtering-gpa-fields">
        <FormField htmlFor="filter-min-gpa" label="Minimum GPA">
          <TextInput
            aria-describedby={error ? 'filter-gpa-error' : undefined}
            aria-invalid={Boolean(error)}
            id="filter-min-gpa"
            max={4}
            min={0}
            onChange={(event) => update(event.target.value, onMinGpaChange)}
            step="0.01"
            type="number"
            value={minGpa ?? ''}
          />
        </FormField>
        <FormField htmlFor="filter-max-gpa" label="Maximum GPA">
          <TextInput
            aria-describedby={error ? 'filter-gpa-error' : undefined}
            aria-invalid={Boolean(error)}
            id="filter-max-gpa"
            max={4}
            min={0}
            onChange={(event) => update(event.target.value, onMaxGpaChange)}
            step="0.01"
            type="number"
            value={maxGpa ?? ''}
          />
        </FormField>
      </div>
      {error ? (
        <p className="error-text" id="filter-gpa-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
