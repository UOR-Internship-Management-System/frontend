import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode
  min?: number
  max?: number
  step?: number
  value?: number
  showValueBubble?: boolean
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    min = 0,
    max = 100,
    step = 1,
    value = 0,
    label,
    showValueBubble = true,
    disabled = false,
    className = '',
    onChange,
    ...props
  },
  ref,
) {
  const [currentVal, setCurrentVal] = useState<number>(Number(value))
  const [isHovered, setIsHovered] = useState(false)

  const val = props.defaultValue !== undefined ? currentVal : Number(value)
  const percentage = Math.min(Math.max(((val - min) / (max - min)) * 100, 0), 100)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentVal(Number(e.target.value))
    onChange?.(e)
  }

  return (
    <div
      className={`m3-slider-container ${className}`.trim()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label ? <span className="m3-label-medium">{label}</span> : null}
      <div className="m3-slider-track-bar">
        <div
          className="m3-slider-active-track"
          style={{ width: `${percentage}%` }}
        />
        {showValueBubble && isHovered ? (
          <div
            className="m3-slider-value-bubble"
            style={{ left: `${percentage}%` }}
          >
            {val}
          </div>
        ) : null}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          disabled={disabled}
          className="m3-slider-native-input"
          onChange={handleChange}
          {...props}
        />
      </div>
    </div>
  )
})
