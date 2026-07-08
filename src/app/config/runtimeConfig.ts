import { env } from './env'

export const runtimeConfig = {
  appName: 'CV Management and Deterministic Internship Candidate Filtering System',
  apiBaseUrl: env.apiBaseUrl,
  appEnv: env.appEnv,
  enableApiMocks: env.enableApiMocks,
  devAuthRole: env.devAuthRole,
  isProduction: env.isProduction,
} as const
