const appEnv = process.env.VITE_APP_ENV ?? 'development'
const apiBaseUrl = process.env.VITE_API_BASE_URL ?? '/api/v1'
const enableApiMocks = process.env.VITE_ENABLE_API_MOCKS ?? 'false'
const devRole = process.env.VITE_DEV_AUTH_ROLE ?? ''

const validEnvs = new Set(['development', 'test', 'staging', 'production'])
const validBooleans = new Set(['true', 'false'])
const validRoles = new Set(['', 'STUDENT', 'ADMIN'])

const errors = []

if (!validEnvs.has(appEnv)) {
  errors.push('VITE_APP_ENV must be development, test, staging, or production.')
}

if (
  !apiBaseUrl.startsWith('/') &&
  !apiBaseUrl.startsWith('http://') &&
  !apiBaseUrl.startsWith('https://')
) {
  errors.push('VITE_API_BASE_URL must be a relative path or http(s) URL.')
}

if (!validBooleans.has(enableApiMocks)) {
  errors.push('VITE_ENABLE_API_MOCKS must be true or false.')
}

if (!validRoles.has(devRole)) {
  errors.push('VITE_DEV_AUTH_ROLE must be empty, STUDENT, or ADMIN.')
}

if (appEnv === 'production' && devRole) {
  errors.push('VITE_DEV_AUTH_ROLE must be empty in production.')
}

if (errors.length > 0) {
  console.error(errors.join('\\n'))
  process.exit(1)
}

console.log('Environment configuration is valid for Sprint 1.')
