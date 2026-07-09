import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { AuthCardShell } from '../../../shared/components/layout/AuthShell'
import { AdminResetOtpForm } from '../components/AdminResetOtpForm'
import { useResendAdminResetOtp } from '../hooks/useResendAdminResetOtp'
import { useVerifyAdminResetOtp } from '../hooks/useVerifyAdminResetOtp'

export function AdminVerifyResetOtpPage() {
  const navigate = useNavigate()
  const verifyOtp = useVerifyAdminResetOtp()
  const resendOtp = useResendAdminResetOtp()
  const [message, setMessage] = useState<string>()
  const context = authStorage.getPasswordResetContext()

  return (
    <AuthCardShell
      className="admin-auth-card"
      description={`We sent a 6-digit reset code to ${context?.email ?? 'your administrator email'}.`}
      icon="lock_open"
      title="Verify Your Identity"
    >
      {message ? (
        <div className="inline-alert" role="alert">
          {message}
        </div>
      ) : null}
      <AdminResetOtpForm
        isResending={resendOtp.isPending}
        isSubmitting={verifyOtp.isPending}
        onResend={async () => {
          if (!context) {
            return
          }

          try {
            await resendOtp.mutateAsync(context.resetId)
            setMessage('A new OTP has been sent if the reset context is still valid.')
          } catch (error) {
            setMessage(mapApiError(error).message)
          }
        }}
        onSubmit={async (otp) => {
          if (!context) {
            return
          }

          try {
            await verifyOtp.mutateAsync({ resetId: context.resetId, otp })
            authStorage.setPasswordResetContext({ ...context, otpVerified: true })
            navigate(routePaths.adminCreatePassword)
          } catch (error) {
            setMessage(mapApiError(error).message)
          }
        }}
      />
    </AuthCardShell>
  )
}
