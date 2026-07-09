import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/ui/Button'
import { FormField } from '../../../shared/components/forms/FormField'
import { flattenZodErrors, otpSchema } from '../schemas/studentAuthSchemas'
import { OtpInput } from './OtpInput'

type StudentOtpFormProps = {
  isSubmitting: boolean
  isResending: boolean
  submitLabel?: string
  onSubmit: (otp: string) => void
  onResend: () => void
}

export function StudentOtpForm({
  isResending,
  isSubmitting,
  onResend,
  onSubmit,
  submitLabel = 'Verify Code',
}: StudentOtpFormProps) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string>()
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) {
      return
    }

    const id = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = otpSchema.safeParse({ otp })
        if (!result.success) {
          setError(flattenZodErrors(result.error).otp)
          return
        }

        setError(undefined)
        onSubmit(result.data.otp)
      }}
    >
      <FormField error={error} htmlFor="student-otp" label="Six-digit OTP">
        <OtpInput id="student-otp" name="otp" onChange={setOtp} value={otp} />
      </FormField>
      <div className="form-actions">
        <Button isLoading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
        <p className="otp-resend-copy">
          Didn't receive the code?{' '}
          <button
            className="link-button"
            disabled={cooldown > 0 || isResending}
            onClick={() => {
              onResend()
              setCooldown(60)
            }}
            type="button"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
          </button>
        </p>
      </div>
    </form>
  )
}
