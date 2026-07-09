import { useEffect, useState } from 'react'
import { FormField } from '../../../shared/components/forms/FormField'
import { Button } from '../../../shared/components/ui/Button'
import { OtpInput } from '../../student-auth/components/OtpInput'
import { adminResetOtpSchema, flattenAdminZodErrors } from '../schemas/adminAuthSchemas'

type AdminResetOtpFormProps = {
  isSubmitting: boolean
  isResending: boolean
  onSubmit: (otp: string) => void
  onResend: () => void
}

export function AdminResetOtpForm({
  isResending,
  isSubmitting,
  onResend,
  onSubmit,
}: AdminResetOtpFormProps) {
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
        const result = adminResetOtpSchema.safeParse({ otp })
        if (!result.success) {
          setError(flattenAdminZodErrors(result.error).otp)
          return
        }

        setError(undefined)
        onSubmit(result.data.otp)
      }}
    >
      <FormField error={error} htmlFor="admin-reset-otp" label="Six-digit OTP">
        <OtpInput id="admin-reset-otp" onChange={setOtp} value={otp} />
      </FormField>
      <div className="form-actions">
        <Button isLoading={isSubmitting} type="submit">
          Verify Code
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
