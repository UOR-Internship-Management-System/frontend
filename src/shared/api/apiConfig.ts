import { runtimeConfig } from '../../app/config/runtimeConfig'

export const apiConfig = {
  baseUrl: runtimeConfig.apiBaseUrl.replace(/\/$/, ''),
  requestIdHeader: 'X-Request-Id',
} as const
