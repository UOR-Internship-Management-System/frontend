import type { InputHTMLAttributes } from 'react'

type OtpInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'maxLength' | 'inputMode'>

export function OtpInput({ className = '', ...props }: OtpInputProps) {
  return (
    <input
      autoComplete="one-time-code"
      className={`input otp-input ${className}`.trim()}
      inputMode="numeric"
      maxLength={6}
      pattern="[0-9]*"
      {...props}
    />
  )
}
