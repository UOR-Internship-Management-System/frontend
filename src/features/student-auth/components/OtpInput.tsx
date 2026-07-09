import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react'
import { useRef } from 'react'

type OtpInputProps = {
  id: string
  name?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  'aria-describedby'?: string
}

const OTP_LENGTH = 6

export function OtpInput({
  className = '',
  disabled = false,
  id,
  name,
  onChange,
  value,
  'aria-describedby': ariaDescribedBy,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const digits = value.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('')

  function focusAt(index: number) {
    inputRefs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus()
  }

  function updateDigit(index: number, rawValue: string) {
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = value.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('')

    if (digitsOnly.length > 1) {
      digitsOnly.split('').forEach((digit, offset) => {
        if (index + offset < OTP_LENGTH) {
          next[index + offset] = digit
        }
      })
      onChange(next.join('').replace(/\s/g, '').slice(0, OTP_LENGTH))
      window.setTimeout(() => focusAt(Math.min(index + digitsOnly.length, OTP_LENGTH - 1)), 0)
      return
    }

    const digit = digitsOnly.slice(-1)
    next[index] = digit || ' '
    onChange(next.join('').replace(/\s/g, '').slice(0, OTP_LENGTH))

    if (digit && index < OTP_LENGTH - 1) {
      window.setTimeout(() => focusAt(index + 1), 0)
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    onChange(pasted)
    window.setTimeout(() => focusAt(Math.min(pasted.length, OTP_LENGTH - 1)), 0)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (/^\d$/.test(event.key)) {
      event.preventDefault()
      const next = value.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('')
      next[index] = event.key
      onChange(next.join('').replace(/\s/g, '').slice(0, OTP_LENGTH))
      if (index < OTP_LENGTH - 1) {
        focusAt(index + 1)
      }
      return
    }

    if (event.key === 'Backspace' && !digits[index].trim() && index > 0) {
      event.preventDefault()
      focusAt(index - 1)
      return
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusAt(index - 1)
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  return (
    <div
      className={`otp-input-group ${className}`.trim()}
      role="group"
      aria-describedby={ariaDescribedBy}
    >
      {Array.from({ length: OTP_LENGTH }, (_, index) => (
        <input
          aria-label={index === 0 ? undefined : `OTP digit ${index + 1}`}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          className="input otp-digit-input"
          disabled={disabled}
          id={index === 0 ? id : `${id}-${index + 1}`}
          inputMode="numeric"
          key={index}
          maxLength={1}
          name={index === 0 ? name : undefined}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateDigit(index, event.target.value)
          }
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={handlePaste}
          pattern="[0-9]*"
          ref={(element) => {
            inputRefs.current[index] = element
          }}
          type="text"
          value={digits[index].trim()}
        />
      ))}
    </div>
  )
}
