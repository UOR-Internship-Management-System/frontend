import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { Button } from '../../../shared/components/ui/Button'

const gpaMinimum = 0
const gpaMaximum = 4

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
  const visualMin = minGpa ?? gpaMinimum
  const visualMax = maxGpa ?? gpaMaximum
  const minimumPercent = (visualMin / gpaMaximum) * 100
  const maximumPercent = (visualMax / gpaMaximum) * 100

  const update = (value: string, onChange: (next?: number) => void) =>
    onChange(value === '' ? undefined : Number(value))

  const setPreset = (minimum?: number, maximum?: number) => {
    onMinGpaChange(minimum)
    onMaxGpaChange(maximum)
  }

  return (
    <fieldset className="filtering-gpa-panel" disabled={disabled}>
      <legend>Official GPA filtering</legend>
      <p>Optional runtime bounds use the latest committed academic ledger only.</p>

      <div className="gpa-range-output" aria-live="polite">
        <span>Min GPA: {visualMin.toFixed(2)}</span>
        <span>Max GPA: {visualMax.toFixed(2)}</span>
      </div>

      <div
        className="gpa-range-control"
        style={
          {
            '--gpa-min-position': `${minimumPercent}%`,
            '--gpa-max-position': `${maximumPercent}%`,
          } as React.CSSProperties
        }
      >
        <div aria-hidden="true" className="gpa-range-track">
          <span />
        </div>
        <input
          aria-label="Minimum GPA slider"
          max={gpaMaximum}
          min={gpaMinimum}
          onChange={(event) => onMinGpaChange(Math.min(Number(event.target.value), visualMax))}
          step="0.01"
          type="range"
          value={visualMin}
        />
        <input
          aria-label="Maximum GPA slider"
          max={gpaMaximum}
          min={gpaMinimum}
          onChange={(event) => onMaxGpaChange(Math.max(Number(event.target.value), visualMin))}
          step="0.01"
          type="range"
          value={visualMax}
        />
      </div>

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

      <div aria-label="GPA quick presets" className="gpa-preset-row">
        <Button onClick={() => setPreset(3, 4)} variant="secondary">
          3.00–4.00
        </Button>
        <Button onClick={() => setPreset(3.5, 4)} variant="secondary">
          3.50–4.00
        </Button>
        <Button onClick={() => setPreset(0, 2)} variant="secondary">
          0.00–2.00
        </Button>
        <Button onClick={() => setPreset(undefined, undefined)} variant="secondary">
          All GPA
        </Button>
      </div>

      {error ? (
        <p className="error-text" id="filter-gpa-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}