import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { StudentResetOtpForm } from '../components/StudentResetOtpForm'
import { useResendStudentResetOtp } from '../hooks/useResendStudentResetOtp'
import { useVerifyStudentResetOtp } from '../hooks/useVerifyStudentResetOtp'

export function StudentResetOtpPage() {
  const navigate = useNavigate()
  const verifyOtp = useVerifyStudentResetOtp()
  const resendOtp = useResendStudentResetOtp()
  const [message, setMessage] = useState<string>()
  const context = authStorage.getPasswordResetContext()

  return (
    <section className="card auth-card">
      <h1>Verify Reset OTP</h1>
      <p>Enter the six-digit OTP sent to {context?.email ?? 'your university email'}.</p>
      {message ? (
        <div className="inline-alert" role="alert">
          {message}
        </div>
      ) : null}
      <StudentResetOtpForm
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
            navigate(routePaths.studentResetCreatePassword)
          } catch (error) {
            setMessage(mapApiError(error).message)
          }
        }}
      />
    </section>
  )
}
