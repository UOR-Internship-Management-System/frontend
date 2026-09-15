import type { HTMLAttributes } from 'react'

export type LinearProgressProps = HTMLAttributes<HTMLDivElement> & {
  value?: number
  ariaLabel?: string
}

export function LinearProgress({
  value,
  ariaLabel = 'Progress',
  className = '',
  ...props
}: LinearProgressProps) {
  const isIndeterminate = value === undefined
  const clampedValue = Math.min(Math.max(value ?? 0, 0), 100)

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={isIndeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`m3-progress-linear ${
        isIndeterminate ? 'm3-progress-linear--indeterminate' : ''
      } ${className}`.trim()}
      {...props}
    >
      <div
        className="m3-progress-linear-bar"
        style={{ width: isIndeterminate ? undefined : `${clampedValue}%` }}
      />
    </div>
  )
}

export type CircularProgressProps = HTMLAttributes<HTMLDivElement> & {
  value?: number
  size?: number
  ariaLabel?: string
}

export function CircularProgress({
  value,
  size = 36,
  ariaLabel = 'Loading',
  className = '',
  ...props
}: CircularProgressProps) {
  const isIndeterminate = value === undefined
  const clampedValue = Math.min(Math.max(value ?? 0, 0), 100)
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = isIndeterminate
    ? undefined
    : circumference - (clampedValue / 100) * circumference

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={isIndeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`m3-progress-circular ${
        isIndeterminate ? 'm3-progress-circular--indeterminate' : ''
      } ${className}`.trim()}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg className="m3-progress-circular-svg" viewBox="0 0 36 36">
        <circle
          className="m3-progress-circular-track"
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="3.5"
        />
        <circle
          className="m3-progress-circular-head"
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </div>
  )
}
