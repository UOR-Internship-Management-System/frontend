import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { StudentSignUpForm } from '../components/StudentSignUpForm'
import { VerificationStatusDialog } from '../components/VerificationStatusDialog'
import { useStartStudentVerification } from '../hooks/useStartStudentVerification'
import type { StudentSignUpFormValues } from '../schemas/studentAuthSchemas'

export function StudentSignUpPage() {
  const navigate = useNavigate()
  const startVerification = useStartStudentVerification()
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    status: 'loading' | 'success' | 'failure'
    message?: string
  }>({ isOpen: false, status: 'loading' })

  async function handleSubmit(values: StudentSignUpFormValues) {
    setDialog({ isOpen: true, status: 'loading' })

    try {
      const response = await startVerification.mutateAsync(values)
      authStorage.setVerificationContext({
        verificationId: response.verificationId,
        email: response.email || values.universityEmail,
        expiresAt: response.expiresAt,
      })
      setDialog({ isOpen: true, status: 'success' })
      window.setTimeout(() => navigate(routePaths.studentVerifyOtp), 650)
    } catch (error) {
      setDialog({ isOpen: true, status: 'failure', message: mapApiError(error).message })
    }
  }

  return (
    <>
      <section className="card auth-card">
        <h1>Student Sign Up</h1>
        <p>
          Enter your display name, index number, and university email to begin automatic
          verification.
        </p>
        <StudentSignUpForm isSubmitting={startVerification.isPending} onSubmit={handleSubmit} />
      </section>
      <VerificationStatusDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        onClose={() => setDialog((current) => ({ ...current, isOpen: false }))}
        status={dialog.status}
      />
    </>
  )
}
