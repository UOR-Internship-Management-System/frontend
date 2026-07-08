import { setupWorker } from 'msw/browser'
import { handlers } from './handlers/foundationHandlers'

export const worker = setupWorker(...handlers)
