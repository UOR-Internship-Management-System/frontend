import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createStudentProfileFixture } from '../../../mocks/fixtures/studentProfile.fixture'
import { server } from '../../../mocks/server'
import {
  activitiesApi,
  awardsApi,
  certificatesApi,
  contactLinksApi,
  experienceApi,
  removeCertificateEvidence,
  uploadCertificateEvidence,
} from '../api/studentProfileEntriesApi'
import { studentProfileApi } from '../api/studentProfileApi'
import { studentProfilePhotoApi } from '../api/studentProfilePhotoApi'
import {
  activityFormSchema,
  awardFormSchema,
  certificateFormSchema,
  certificateSchema,
  experienceFormSchema,
} from '../schemas/profileEntrySchemas'
import type { ProfileCollectionQuery } from '../types/profileEntryTypes'

const firstPage: ProfileCollectionQuery = { page: 0, size: 5, sort: 'updatedAt,desc', search: '' }

describe('Student Profile v1.2.0 supporting APIs', () => {
  it('loads upload policy and supports versioned photo upload and removal', async () => {
    const policy = await studentProfilePhotoApi.getUploadPolicy()
    const profile = await studentProfileApi.getCurrent()
    server.use(
      http.put('/api/v1/me/profile/photo', () =>
        HttpResponse.json(
          createStudentProfileFixture({
            version: 2,
            profilePhoto: {
              fileId: '77777777-7777-4777-8777-777777777777',
              fileName: 'student.png',
              mimeType: 'image/png',
              fileSizeBytes: 5,
              url: 'https://files.example.edu/profile/student.png',
              createdAt: '2026-07-01T08:00:00Z',
            },
          }),
        ),
      ),
      http.delete('/api/v1/me/profile/photo', () =>
        HttpResponse.json(createStudentProfileFixture({ version: 3, profilePhoto: null })),
      ),
    )
    const uploaded = await studentProfilePhotoApi.upload(
      new File(['photo'], 'student.png', { type: 'image/png' }),
      profile.version,
    )
    expect(policy.profilePhoto.allowedExtensions).toContain('.png')
    expect(uploaded.profilePhoto?.fileName).toBe('student.png')
    const removed = await studentProfilePhotoApi.remove(uploaded.version)
    expect(removed.profilePhoto).toBeNull()
  })

  it('serializes search and zero-based pagination for Professional Links', async () => {
    const page = await contactLinksApi.list({
      page: 1,
      size: 5,
      sort: 'displayOrder,asc',
      search: '',
    })
    expect(page.page).toMatchObject({ page: 1, size: 5, totalElements: 6, totalPages: 2 })
    expect(page.items).toHaveLength(1)
    const search = await contactLinksApi.list({ ...firstPage, search: 'GitHub' })
    expect(search.items.map((item) => item.label)).toEqual(['GitHub'])
  })

  it('creates, updates, and deletes each versioned Profile collection', async () => {
    const link = await contactLinksApi.create({
      label: 'Dev Profile',
      url: 'https://dev.example.com',
      displayOrder: 7,
      cvInclude: true,
    })
    const updatedLink = await contactLinksApi.update(link.id, link.version, {
      ...link,
      label: 'Developer Profile',
    })
    await contactLinksApi.remove(updatedLink.id, updatedLink.version)

    const award = await awardsApi.create({
      title: 'Best Project',
      issuer: 'DCS',
      awardDate: '2026-01-02',
      description: null,
      cvInclude: true,
    })
    const updatedAward = await awardsApi.update(award.id, award.version, {
      title: award.title,
      issuer: award.issuer,
      awardDate: award.awardDate,
      description: 'Final-year project award.',
      cvInclude: false,
    })
    await awardsApi.remove(updatedAward.id, updatedAward.version)

    const activity = await activitiesApi.create({
      activityName: 'Robotics Club',
      roleTitle: 'Member',
      startDate: null,
      endDate: null,
      description: null,
      cvInclude: true,
    })
    await activitiesApi.remove(activity.id, activity.version)

    const experience = await experienceApi.create({
      organization: 'UOR',
      positionTitle: 'Assistant',
      location: null,
      startDate: '2026-01-01',
      endDate: null,
      currentRole: true,
      description: null,
      cvInclude: true,
    })
    await experienceApi.remove(experience.id, experience.version)
  })

  it('creates a Certificate before evidence upload and removes evidence independently', async () => {
    const certificate = await certificatesApi.create({
      title: 'Frontend Engineering',
      issuer: 'DCS',
      issueDate: '2026-03-10',
      credentialUrl: null,
      cvInclude: true,
    })
    server.use(
      http.put('/api/v1/me/profile/certificates/:id/evidence', () =>
        HttpResponse.json({
          ...certificate,
          version: certificate.version + 1,
          evidence: {
            fileId: '88888888-8888-4888-8888-888888888888',
            fileName: 'certificate.pdf',
            mimeType: 'application/pdf',
            fileSizeBytes: 3,
            url: 'https://files.example.edu/certificates/certificate.pdf',
            createdAt: '2026-07-01T08:00:00Z',
          },
        }),
      ),
      http.delete('/api/v1/me/profile/certificates/:id/evidence', () =>
        HttpResponse.json({ ...certificate, version: certificate.version + 2, evidence: null }),
      ),
    )
    const withEvidence = await uploadCertificateEvidence(
      certificate.id,
      certificate.version,
      new File(['pdf'], 'certificate.pdf', { type: 'application/pdf' }),
    )
    expect(withEvidence.evidence?.fileName).toBe('certificate.pdf')
    const withoutEvidence = await removeCertificateEvidence(withEvidence.id, withEvidence.version)
    expect(withoutEvidence.evidence).toBeNull()
  })

  it('rejects malformed collection responses and stale versions', async () => {
    server.use(
      http.get('/api/v1/me/profile/awards', () =>
        HttpResponse.json({ items: [{ id: 'bad' }], page: {} }),
      ),
    )
    await expect(awardsApi.list(firstPage)).rejects.toThrow()

    const certificate = (await certificatesApi.list(firstPage)).items[0]!
    await expect(
      certificatesApi.update(certificate.id, 999, {
        title: certificate.title,
        issuer: certificate.issuer,
        issueDate: certificate.issueDate,
        credentialUrl: certificate.credentialUrl,
        cvInclude: certificate.cvInclude,
      }),
    ).rejects.toMatchObject({ status: 412 })
  })

  it('enforces Activity and Experience cross-field date rules', () => {
    expect(
      activityFormSchema.safeParse({
        activityName: 'Club',
        roleTitle: 'Lead',
        startDate: '2026-05-01',
        endDate: '2026-04-01',
        description: '',
        cvInclude: true,
      }).success,
    ).toBe(false)
    expect(
      experienceFormSchema.safeParse({
        organization: 'Company',
        positionTitle: 'Intern',
        location: '',
        startDate: '2026-01-01',
        endDate: '',
        currentRole: false,
        description: '',
        cvInclude: true,
      }).success,
    ).toBe(false)
    expect(
      experienceFormSchema.safeParse({
        organization: 'Company',
        positionTitle: 'Engineer',
        location: '',
        startDate: '2026-01-01',
        endDate: '',
        currentRole: true,
        description: '',
        cvInclude: true,
      }).success,
    ).toBe(true)
  })

  it('accepts leap days and rejects impossible calendar dates at form boundaries', () => {
    const certificate = {
      title: 'Calendar Validation',
      issuer: 'DCS',
      credentialUrl: '',
      cvInclude: true,
    }
    const award = {
      title: 'Calendar Validation',
      issuer: 'DCS',
      description: '',
      cvInclude: true,
    }

    expect(
      certificateFormSchema.safeParse({ ...certificate, issueDate: '2024-02-29' }).success,
    ).toBe(true)
    for (const issueDate of [
      '2025-02-29',
      '2026-00-10',
      '2026-13-10',
      '2026-04-31',
      '2026-01-00',
      '2026-01-32',
      '2026-1-02',
      '2026-01-02T00:00:00Z',
    ]) {
      expect(certificateFormSchema.safeParse({ ...certificate, issueDate }).success).toBe(false)
    }
    expect(awardFormSchema.safeParse({ ...award, awardDate: '2026-02-30' }).success).toBe(false)
  })

  it('rejects impossible dates in API responses while preserving nullable activity dates', () => {
    const validCertificate = {
      id: '11111111-1111-4111-8111-111111111111',
      title: 'Certificate',
      issuer: 'DCS',
      issueDate: '2024-02-29',
      credentialUrl: null,
      evidence: null,
      cvInclude: true,
      version: 1,
      createdAt: '2026-07-01T08:00:00Z',
      updatedAt: '2026-07-01T08:00:00Z',
    }

    expect(certificateSchema.safeParse(validCertificate).success).toBe(true)
    expect(
      certificateSchema.safeParse({ ...validCertificate, issueDate: '2025-02-29' }).success,
    ).toBe(false)
    expect(
      activityFormSchema.safeParse({
        activityName: 'Club',
        roleTitle: 'Member',
        startDate: '',
        endDate: '',
        description: '',
        cvInclude: true,
      }).success,
    ).toBe(true)
  })
})
