import { env } from '../../app/config/env'
import { localTestCredentials } from '../../app/config/localTestCredentials'
import type { AuthRole } from './authTypes'

export function LocalTestCredentialsHint({ role }: { role: AuthRole }) {
  if (!env.enableApiMocks || env.isProduction) {
    return null
  }

  const credentials = role === 'STUDENT' ? localTestCredentials.student : localTestCredentials.admin

  return (
    <aside className="auth-test-credentials" aria-label="Local test credentials">
      <strong>Local test account</strong>
      <span>{credentials.email}</span>
      <span>{credentials.password}</span>
    </aside>
  )
}
