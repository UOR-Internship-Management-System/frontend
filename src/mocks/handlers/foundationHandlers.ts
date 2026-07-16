import { authHandlers } from './authHandlers'
import { studentHandlers } from './studentHandlers'
import { studentSkillsHandlers } from './studentSkillsHandlers'
import { studentProjectsHandlers } from './studentProjectsHandlers'

export const handlers = [
  ...authHandlers,
  ...studentHandlers,
  ...studentSkillsHandlers,
  ...studentProjectsHandlers,
]
