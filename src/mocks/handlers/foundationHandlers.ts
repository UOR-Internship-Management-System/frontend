import { authHandlers } from './authHandlers'
import { studentHandlers } from './studentHandlers'
import { studentSkillsHandlers } from './studentSkillsHandlers'
import { studentProjectsHandlers } from './studentProjectsHandlers'
import { cvBuilderHandlers } from './cvBuilderHandlers'
import { academicRecordsHandlers } from './academicRecordsHandlers'
import { adminHandlers } from './adminHandlers'

export const handlers = [
  ...authHandlers,
  ...studentHandlers,
  ...studentSkillsHandlers,
  ...studentProjectsHandlers,
  ...cvBuilderHandlers,
  ...academicRecordsHandlers,
  ...adminHandlers,
]
