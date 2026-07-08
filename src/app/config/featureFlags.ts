import { runtimeConfig } from './runtimeConfig'

export const featureFlags = {
  enableApiMocks: runtimeConfig.enableApiMocks,
  enableDevAuthRole: !runtimeConfig.isProduction && runtimeConfig.devAuthRole.length > 0,
} as const
