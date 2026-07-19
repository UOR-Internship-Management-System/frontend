import { http, HttpResponse } from 'msw'
import { localTestCredentials } from '../../app/config/localTestCredentials'

const apiBase = '/api/v1'

const initialStudentAccounts = [
  [localTestCredentials.student.email, localTestCredentials.student.password],
] as const
const initialAdminAccounts = [
  [localTestCredentials.admin.email, localTestCredentials.admin.password],
] as const

let studentAccounts = new Map<string, string>(initialStudentAccounts)
let adminAccounts = new Map<string, string>(initialAdminAccounts)
const verificationEmails = new Map<string, string>()
const passwordResetAccounts = new Map<string, { accountType: 'STUDENT' | 'ADMIN'; email: string }>()

function normalizeEmail(value: string | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

function invalidCredentials() {
  return HttpResponse.json(
    {
      type: 'about:blank',
      title: 'Invalid email or password.',
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    },
    { status: 401 },
  )
}

export function resetAuthMocks() {
  studentAccounts = new Map<string, string>(initialStudentAccounts)
  adminAccounts = new Map<string, string>(initialAdminAccounts)
  verificationEmails.clear()
  passwordResetAccounts.clear()
}

const users = {
  student: {
    userId: 'student-user-1',
    accountId: 'student-account-1',
    email: 'student@dcs.ruh.ac.lk',
    displayName: 'Test Student',
    roles: ['STUDENT'],
    primaryRole: 'STUDENT',
  },
  admin: {
    userId: 'admin-user-1',
    accountId: 'admin-account-1',
    email: 'admin@dcs.ruh.ac.lk',
    displayName: 'Department Admin',
    roles: ['ADMIN'],
    primaryRole: 'ADMIN',
  },
} as const

function currentUserFromRequest(request: Request) {
  const header = request.headers.get('Authorization') ?? ''
  if (header.includes('admin-token')) {
    return users.admin
  }
  if (header.includes('student-token')) {
    return users.student
  }
  return null
}

export const authHandlers = [
  http.post(`${apiBase}/student-verifications`, async ({ request }) => {
    const body = (await request.json()) as { universityEmail?: string }
    verificationEmails.set('verification-1', normalizeEmail(body.universityEmail))
    return HttpResponse.json(
      {
        verificationId: 'verification-1',
        status: 'OTP_SENT',
        message: 'Verification started.',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
      },
      { status: 201 },
    )
  }),

  http.post(`${apiBase}/student-verifications/:verificationId/otp/verify`, async ({ request }) => {
    const body = (await request.json()) as { otpCode?: string }
    if (body.otpCode !== '123456') {
      return HttpResponse.json({ title: 'Incorrect OTP.', status: 422 }, { status: 422 })
    }
    return HttpResponse.json({ verified: true })
  }),

  http.post(`${apiBase}/student-verifications/:verificationId/otp/resend`, () =>
    HttpResponse.json({ message: 'OTP resent.', expiresInSeconds: 300 }, { status: 202 }),
  ),

  http.post(
    `${apiBase}/student-verifications/:verificationId/password`,
    async ({ params, request }) => {
      const body = (await request.json()) as { newPassword?: string }
      const email = verificationEmails.get(String(params.verificationId))
      if (email && body.newPassword) {
        studentAccounts.set(email, body.newPassword)
      }
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.post(`${apiBase}/auth/student/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = normalizeEmail(body.email)
    if (!email || studentAccounts.get(email) !== body.password) {
      return invalidCredentials()
    }
    return HttpResponse.json({
      accessToken: 'student-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      user: { ...users.student, email },
    })
  }),

  http.post(`${apiBase}/auth/admin/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = normalizeEmail(body.email)
    if (email === 'disabled.admin@dcs.ruh.ac.lk') {
      return HttpResponse.json(
        {
          title: 'This administrator account cannot sign in. Contact IT or operations.',
          status: 403,
        },
        { status: 403 },
      )
    }
    if (!email || adminAccounts.get(email) !== body.password) {
      return invalidCredentials()
    }
    return HttpResponse.json({
      accessToken: 'admin-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      user: { ...users.admin, email },
    })
  }),

  http.get(`${apiBase}/auth/me`, ({ request }) => {
    const user = currentUserFromRequest(request)
    if (!user) {
      return HttpResponse.json({ title: 'Authentication required.', status: 401 }, { status: 401 })
    }
    return HttpResponse.json(user)
  }),

  http.post(`${apiBase}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${apiBase}/password-resets`, async ({ request }) => {
    const body = (await request.json()) as { accountType?: 'STUDENT' | 'ADMIN'; email?: string }
    const accountType = body.accountType ?? 'STUDENT'
    const resetId = `${accountType.toLowerCase()}-reset-1`
    passwordResetAccounts.set(resetId, { accountType, email: normalizeEmail(body.email) })
    return HttpResponse.json(
      {
        resetId,
        message: 'If the account can be recovered, an OTP has been sent.',
        expiresInSeconds: 300,
      },
      { status: 202 },
    )
  }),

  http.post(`${apiBase}/password-resets/:resetId/otp/verify`, async ({ request }) => {
    const body = (await request.json()) as { otpCode?: string }
    if (body.otpCode !== '123456') {
      return HttpResponse.json({ title: 'Incorrect OTP.', status: 422 }, { status: 422 })
    }
    return HttpResponse.json({ verified: true })
  }),

  http.post(`${apiBase}/password-resets/:resetId/otp/resend`, () =>
    HttpResponse.json({ message: 'OTP resent.', expiresInSeconds: 300 }, { status: 202 }),
  ),

  http.post(`${apiBase}/password-resets/:resetId/password`, async ({ params, request }) => {
    const body = (await request.json()) as { newPassword?: string }
    const account = passwordResetAccounts.get(String(params.resetId))
    if (account && body.newPassword) {
      const accounts = account.accountType === 'ADMIN' ? adminAccounts : studentAccounts
      if (accounts.has(account.email)) {
        accounts.set(account.email, body.newPassword)
      }
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
