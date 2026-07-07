const appEnv = process.env.VITE_APP_ENV ?? 'development'
const apiBaseUrl = process.env.VITE_API_BASE_URL ?? '/api/v1'
const mockFlag = process.env.VITE_ENABLE_API_MOCKS ?? 'false'

const allowedEnvironments = ['development', 'test', 'staging', 'production']
const allowedBooleans = ['true', 'false']

if (!allowedEnvironments.includes(appEnv)) {
  console.error('Invalid VITE_APP_ENV value.')
  process.exitCode = 1
}

if (!apiBaseUrl.startsWith('/') && !apiBaseUrl.startsWith('http')) {
  console.error('Invalid VITE_API_BASE_URL value.')
  process.exitCode = 1
}

if (!allowedBooleans.includes(mockFlag)) {
  console.error('Invalid VITE_ENABLE_API_MOCKS value.')
  process.exitCode = 1
}

if (!process.exitCode) {
  console.log('Environment configuration is valid.')
}
