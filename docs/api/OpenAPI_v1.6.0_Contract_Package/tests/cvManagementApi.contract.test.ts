import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const contractPath = path.join(
  process.cwd(),
  'docs/api/CV_Management_API_OpenAPI_v1.6.0.yaml',
)
const contract = fs.readFileSync(contractPath, 'utf8').replace(/\r\n?/g, '\n')

function schemaBlock(name: string): string {
  const marker = `\n    ${name}:\n`
  const start = contract.indexOf(marker)
  expect(start, `schema ${name}`).toBeGreaterThanOrEqual(0)
  const tail = contract.slice(start + marker.length)
  const next = tail.search(/\n {4}[A-Za-z0-9_-]+:\n|\n {2}[a-zA-Z]+:\n/)
  return next < 0 ? tail : tail.slice(0, next)
}

describe('OpenAPI v1.6.0 Sprint 7-8 contract freeze', () => {
  it('preserves the required route groups and exact file formats', () => {
    for (const fragment of [
      '/admin/students/{studentId}/latest-cv/download:',
      '/admin/companies:',
      '/admin/internship-requests:',
      '/admin/candidate-filtering/runs:',
      '/admin/shortlists:',
      '/admin/exports/{exportJobId}/download:',
      '/admin/exports/{exportJobId}/bulk-cvs/download:',
      'text/csv:',
      'application/zip:',
      'application/pdf:',
    ]) {
      expect(contract).toContain(fragment)
    }
  })

  it('keeps internship request data free of GPA criteria', () => {
    for (const name of [
      'InternshipRequestCreateRequest',
      'InternshipRequestUpdateRequest',
      'InternshipRequestResponse',
    ]) {
      const block = schemaBlock(name)
      expect(block).not.toMatch(/^ {6}[A-Za-z0-9_]*gpa[A-Za-z0-9_]*:/im)
      expect(block).toContain('additionalProperties: false')
    }
  })

  it('returns deterministic candidates without scores or ranking fields', () => {
    const block = schemaBlock('CandidateFilteringCandidateResponse')
    for (const forbidden of [
      'score:',
      'rank:',
      'matchPercentage:',
      'weightedScore:',
      'probability:',
      'recommendation:',
    ]) {
      expect(block).not.toContain(`\n      ${forbidden}`)
    }
    expect(block).toContain('matchingDeclaredSkills:')
    expect(block).toContain('hasExistingActiveShortlist:')
  })

  it('models non-blocking shortlist guidance and missing CV reporting', () => {
    const finalize = schemaBlock('ShortlistFinalizeRequest')
    const exportJob = schemaBlock('ExportJobResponse')
    expect(finalize).toContain('acknowledgeGuidanceWarning:')
    expect(exportJob).toContain('missingCvCount:')
    expect(exportJob).toContain('missingCvStudents:')
    expect(exportJob).toContain('includedFileCount:')
  })

  it('keeps the Admin Student deep-dive read-only', () => {
    const deepDivePathStart = contract.indexOf('\n  /admin/students/{studentId}:\n')
    expect(deepDivePathStart).toBeGreaterThanOrEqual(0)
    const tail = contract.slice(deepDivePathStart + 1)
    const nextPath = tail.search(/\n {2}\/|\ncomponents:\n/)
    const block = nextPath < 0 ? tail : tail.slice(0, nextPath)
    expect(block).toContain('\n    get:\n')
    expect(block).not.toContain('\n    post:\n')
    expect(block).not.toContain('\n    patch:\n')
    expect(block).not.toContain('\n    delete:\n')
  })
})
