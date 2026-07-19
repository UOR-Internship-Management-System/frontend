import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { AuthSplitShell } from '../../../shared/components/layout/AuthShell'
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
        email: values.universityEmail,
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
      <AuthSplitShell
        description="Welcome to the department's centralized talent placement ecosystem. Submit your registration request to initialize your single-source profile pipeline."
        title="Launch your placement profile."
      >
        <section className="auth-form-card">
          <div className="form-header">
            <h1>Student Registration</h1>
            <p>Initialize your passwordless account authorization request below.</p>
          </div>
          <StudentSignUpForm
            isSubmitting={startVerification.isPending && !dialog.isOpen}
            onSubmit={handleSubmit}
          />
        </section>
      </AuthSplitShell>
      <VerificationStatusDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        onClose={() => setDialog((current) => ({ ...current, isOpen: false }))}
        status={dialog.status}
      />
    </>
  )
}
