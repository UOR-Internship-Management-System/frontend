import { authHandlers } from './authHandlers'
import { studentHandlers } from './studentHandlers'
import { studentSkillsHandlers } from './studentSkillsHandlers'

export const handlers = [...authHandlers, ...studentHandlers, ...studentSkillsHandlers]
