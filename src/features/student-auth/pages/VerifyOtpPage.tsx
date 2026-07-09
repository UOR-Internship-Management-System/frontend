import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { AuthCardShell } from '../../../shared/components/layout/AuthShell'
import { StudentOtpForm } from '../components/StudentOtpForm'
import { useResendStudentOtp } from '../hooks/useResendStudentOtp'
import { useVerifyStudentOtp } from '../hooks/useVerifyStudentOtp'

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const verifyOtp = useVerifyStudentOtp()
  const resendOtp = useResendStudentOtp()
  const [message, setMessage] = useState<string>()
  const context = authStorage.getVerificationContext()

  return (
    <AuthCardShell
      description={`We sent a 6-digit code to ${context?.email ?? 'your university email'}.`}
      icon="lock_open"
      title="Verify Your Identity"
    >
      {message ? (
        <div className="inline-alert" role="alert">
          {message}
        </div>
      ) : null}
      <StudentOtpForm
        isResending={resendOtp.isPending}
        isSubmitting={verifyOtp.isPending}
        onResend={async () => {
          if (!context) {
            return
          }

          try {
            await resendOtp.mutateAsync(context.verificationId)
            setMessage('A new OTP has been sent if the verification context is still valid.')
          } catch (error) {
            setMessage(mapApiError(error).message)
          }
        }}
        onSubmit={async (otp) => {
          if (!context) {
            return
          }

          try {
            await verifyOtp.mutateAsync({ verificationId: context.verificationId, otp })
            authStorage.setVerificationContext({ ...context, verified: true })
            navigate(routePaths.studentCreatePassword)
          } catch (error) {
            setMessage(mapApiError(error).message)
          }
        }}
      />
    </AuthCardShell>
  )
}
