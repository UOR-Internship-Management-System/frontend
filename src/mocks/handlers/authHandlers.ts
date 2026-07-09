import { http, HttpResponse } from 'msw'

const apiBase = '/api/v1'

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
    return HttpResponse.json(
      {
        verificationId: 'verification-1',
        email: body.universityEmail ?? users.student.email,
        message: 'Verification started.',
      },
      { status: 201 },
    )
  }),

  http.post(`${apiBase}/student-verifications/:verificationId/otp/verify`, async ({ request }) => {
    const body = (await request.json()) as { otp?: string }
    if (body.otp !== '123456') {
      return HttpResponse.json({ title: 'Incorrect OTP.', status: 422 }, { status: 422 })
    }
    return HttpResponse.json({ message: 'OTP verified.' })
  }),

  http.post(`${apiBase}/student-verifications/:verificationId/otp/resend`, () =>
    HttpResponse.json({ message: 'OTP resent.' }),
  ),

  http.post(
    `${apiBase}/student-verifications/:verificationId/password`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.post(`${apiBase}/auth/student/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string }
    return HttpResponse.json({
      accessToken: 'student-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      user: { ...users.student, email: body.email ?? users.student.email },
    })
  }),

  http.post(`${apiBase}/auth/admin/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string }
    if (body.email === 'disabled.admin@dcs.ruh.ac.lk') {
      return HttpResponse.json(
        {
          title: 'This administrator account cannot sign in. Contact IT or operations.',
          status: 403,
        },
        { status: 403 },
      )
    }
    return HttpResponse.json({
      accessToken: 'admin-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      user: { ...users.admin, email: body.email ?? users.admin.email },
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
    return HttpResponse.json({
      resetId: `${body.accountType?.toLowerCase() ?? 'student'}-reset-1`,
      message: 'If the account can be recovered, an OTP has been sent.',
      expiresInSeconds: 300,
    })
  }),

  http.post(`${apiBase}/password-resets/:resetId/otp/verify`, async ({ request }) => {
    const body = (await request.json()) as { otp?: string }
    if (body.otp !== '123456') {
      return HttpResponse.json({ title: 'Incorrect OTP.', status: 422 }, { status: 422 })
    }
    return HttpResponse.json({ message: 'OTP verified.' })
  }),

  http.post(`${apiBase}/password-resets/:resetId/otp/resend`, () =>
    HttpResponse.json({ message: 'OTP resent.' }),
  ),

  http.post(
    `${apiBase}/password-resets/:resetId/password`,
    () => new HttpResponse(null, { status: 204 }),
  ),
]
