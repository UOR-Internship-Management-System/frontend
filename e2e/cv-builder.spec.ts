import { expect, test, type Page, type Route } from '@playwright/test'

const previewId = '70000000-0000-4000-8000-000000000001'
const versionId = '50000000-0000-4000-8000-000000000004'
const projectId = '660e8400-e29b-41d4-a716-446655440001'

const studentUser = {
  userId: 'cv-builder-e2e',
  accountId: 'cv-builder-account-e2e',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'CV Builder Student',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

const notSavedFreshness = {
  status: 'NOT_SAVED',
  changedAreas: [],
  latestSavedCvVersionId: null,
  latestSavedAt: null,
  evaluatedAt: '2026-07-21T08:00:00Z',
  message: 'No saved CV version exists yet.',
}

async function authenticateStudent(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'cv-builder-token')
  })
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(studentUser),
    }),
  )
}

function problem(status: number, code: string, message: string) {
  return JSON.stringify({
    type: 'about:blank',
    title: 'CV request failed',
    status,
    code,
    message,
    correlationId: `cv-e2e-${status}`,
  })
}

async function mockCvApi(page: Page, options: { expireFirstSave?: boolean } = {}) {
  let previewCount = 0
  let saveCount = 0
  let versions: Record<string, unknown>[] = []

  await page.route('**/api/v1/me/projects**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            projectId,
            title: 'Accessible Portfolio',
            description: 'Structured project evidence.',
            repositoryUrl: null,
            demoUrl: null,
            startDate: '2026-01-10',
            endDate: null,
            skills: [],
            includeInCv: true,
            version: 0,
            createdAt: '2026-07-20T08:00:00Z',
            updatedAt: '2026-07-20T08:00:00Z',
          },
        ],
        page: { page: 0, size: 100, totalElements: 1, totalPages: 1, sort: 'updatedAt,desc' },
      }),
    }),
  )
  await page.route('**/api/v1/me/cv/source-freshness', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(notSavedFreshness),
    }),
  )
  await page.route('**/api/v1/me/cv/preview', async (route) => {
    previewCount += 1
    const body = route.request().postDataJSON() as {
      sectionOrder: string[]
      includedProjectIds: string[]
    }
    expect(body.sectionOrder).toContain('SKILLS')
    expect(body.includedProjectIds).toEqual([projectId])
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        previewId,
        htmlPreview: `<article><h1>CV Builder Student</h1><p>Preview ${previewCount}</p></article>`,
        latexSource: `\\documentclass{article}\nPreview ${previewCount}`,
        freshness: notSavedFreshness,
        configuration: body,
        generatedAt: '2026-07-21T08:01:00Z',
        expiresAt: '2099-07-21T08:16:00Z',
      }),
    })
  })
  await page.route('**/api/v1/me/cv/versions**', async (route) => {
    const request = route.request()
    if (request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: versions,
          page: {
            page: 0,
            size: 5,
            totalElements: versions.length,
            totalPages: versions.length ? 1 : 0,
            sort: 'savedAt,desc',
          },
        }),
      })
    }

    saveCount += 1
    expect(request.postDataJSON()).toEqual({ previewId })
    if (options.expireFirstSave && saveCount === 1) {
      return route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: problem(409, 'CV_PREVIEW_EXPIRED', 'The preview expired.'),
      })
    }
    const version = {
      cvVersionId: versionId,
      versionNumber: 1,
      versionLabel: 'Version 1',
      latest: true,
      createdAt: '2026-07-21T08:02:00Z',
      generatedAt: '2026-07-21T08:01:00Z',
      savedAt: '2026-07-21T08:02:00Z',
      downloadUrl: `/me/cv/versions/${versionId}/download`,
      freshnessStatus: 'CURRENT',
      pdfFile: {
        fileName: 'cv-version-1.pdf',
        mediaType: 'application/pdf',
        fileSizeBytes: 8,
        generatedAt: '2026-07-21T08:01:00Z',
      },
    }
    versions = [version]
    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(version),
    })
  })
  const fulfillPdf = (route: Route) =>
    route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cv-version-1.pdf"',
        'Content-Length': '8',
      },
      body: '%PDF-1.4',
    })
  await page.route('**/api/v1/me/cv/latest/download', fulfillPdf)
  await page.route('**/api/v1/me/cv/versions/*/download', fulfillPdf)
}

test('CV Builder remains protected by the Student route guard', async ({ page }) => {
  await page.goto('/student/cv-builder', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/student\/login$/)
})

test('Student confirms, updates, saves, and downloads a generated CV', async ({ page }) => {
  await authenticateStudent(page)
  await mockCvApi(page)
  await page.goto('/student/cv-builder', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { level: 1, name: 'CV Builder' })).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Student navigation' }).getByRole('link'),
  ).toHaveCount(6)
  await page.getByRole('button', { name: 'Generate Preview' }).click()
  await expect(page.getByTitle('Generated CV visual preview')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save Current CV Version' })).toBeEnabled()

  await page.getByRole('checkbox', { name: 'Awards' }).click()
  await expect(page.getByText(/controls changed after this preview/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
  await page.getByRole('button', { name: 'Update Preview' }).click()
  await expect(page.getByRole('button', { name: 'Save Current CV Version' })).toBeEnabled()

  await page.getByRole('button', { name: 'Save Current CV Version' }).click()
  await expect(page.getByText('Version 1')).toBeVisible()
  await page.getByRole('button', { name: 'Download Latest PDF' }).click()
  await expect(page.getByText('PDF download started')).toBeVisible()
  await expect(page.getByText(/Admin Review/i)).toHaveCount(0)
})

test('an expired preview preserves configuration and requires regeneration', async ({ page }) => {
  await authenticateStudent(page)
  await mockCvApi(page, { expireFirstSave: true })
  await page.goto('/student/cv-builder', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Generate Preview' }).click()
  await expect(page.getByTitle('Generated CV visual preview')).toBeVisible()
  await page.getByRole('button', { name: 'Save Current CV Version' }).click()

  await expect(page.getByText('This preview has expired.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Regenerate Preview' })).toBeEnabled()
  await expect(page.getByRole('checkbox', { name: /Accessible Portfolio/ })).toBeChecked()
  await expect(page.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
})
