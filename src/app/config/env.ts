export type AppEnvironment = 'development' | 'test' | 'staging' | 'production'

const appEnv = import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE ?? 'development'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
const enableApiMocks = import.meta.env.VITE_ENABLE_API_MOCKS === 'true'
const devAuthRole = import.meta.env.VITE_DEV_AUTH_ROLE ?? ''
const isProductionBuild = import.meta.env.PROD

export const env = {
  appEnv: appEnv as AppEnvironment,
  apiBaseUrl,
  enableApiMocks,
  devAuthRole,
  isProduction: isProductionBuild || appEnv === 'production',
} as const
