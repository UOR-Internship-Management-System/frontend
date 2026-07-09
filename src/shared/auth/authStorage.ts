import { storageKeys } from '../constants/storageKeys'
import type { PasswordResetFlowContext, VerificationFlowContext } from './authTypes'

const verificationContextKey = 'cv-management.verification-context'
const resetContextKey = 'cv-management.password-reset-context'

function safeGetSessionItem(key: string) {
  if (typeof window === 'undefined') {
    return null
  }

  return window.sessionStorage.getItem(key)
}

function safeSetSessionItem(key: string, value: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(key, value)
}

function safeRemoveSessionItem(key: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(key)
}

function parseStoredJson<TValue>(raw: string | null): TValue | null {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as TValue
  } catch {
    return null
  }
}

export const authStorage = {
  getToken: () => safeGetSessionItem(storageKeys.accessToken),
  setToken: (token: string) => safeSetSessionItem(storageKeys.accessToken, token),
  clearToken: () => safeRemoveSessionItem(storageKeys.accessToken),

  getVerificationContext: () =>
    parseStoredJson<VerificationFlowContext>(safeGetSessionItem(verificationContextKey)),
  setVerificationContext: (context: VerificationFlowContext) =>
    safeSetSessionItem(verificationContextKey, JSON.stringify(context)),
  clearVerificationContext: () => safeRemoveSessionItem(verificationContextKey),

  getPasswordResetContext: () =>
    parseStoredJson<PasswordResetFlowContext>(safeGetSessionItem(resetContextKey)),
  setPasswordResetContext: (context: PasswordResetFlowContext) =>
    safeSetSessionItem(resetContextKey, JSON.stringify(context)),
  clearPasswordResetContext: () => safeRemoveSessionItem(resetContextKey),
}
