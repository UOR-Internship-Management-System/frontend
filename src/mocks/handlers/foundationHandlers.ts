import { authHandlers } from './authHandlers'
import { studentHandlers } from './studentHandlers'

export const handlers = [...authHandlers, ...studentHandlers]
