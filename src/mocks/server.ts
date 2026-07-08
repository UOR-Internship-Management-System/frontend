import { setupServer } from 'msw/node'
import { handlers } from './handlers/foundationHandlers'

export const server = setupServer(...handlers)
