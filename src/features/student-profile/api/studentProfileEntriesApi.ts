import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import type { ZodType } from 'zod'
import {
  activitySchema,
  awardSchema,
  certificateSchema,
  contactLinkSchema,
  experienceSchema,
  pagedResponseSchema,
} from '../schemas/profileEntrySchemas'
import type {
  Activity,
  ActivityRequest,
  Award,
  AwardRequest,
  Certificate,
  CertificateRequest,
  ContactLink,
  ContactLinkRequest,
  Experience,
  ExperienceRequest,
  PagedResponse,
  ProfileCollectionQuery,
} from '../types/profileEntryTypes'

function collectionPath(path: string, query: ProfileCollectionQuery) {
  const parameters = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    sort: query.sort,
  })
  if (query.search.trim()) parameters.set('search', query.search.trim())
  return `${path}?${parameters.toString()}`
}

function createCollectionApi<TItem, TRequest>(path: string, itemSchema: ZodType<TItem>) {
  const pageSchema = pagedResponseSchema(itemSchema)
  return {
    async list(query: ProfileCollectionQuery, signal?: AbortSignal): Promise<PagedResponse<TItem>> {
      return pageSchema.parse(
        await httpClient<unknown>(collectionPath(path, query), { signal }),
      ) as PagedResponse<TItem>
    },
    async create(values: TRequest): Promise<TItem> {
      return itemSchema.parse(
        await httpClient<unknown>(path, { method: 'POST', body: values }),
      ) as TItem
    },
    async update(id: string, version: number, values: TRequest): Promise<TItem> {
      return itemSchema.parse(
        await httpClient<unknown>(`${path}/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: values,
          headers: { 'If-Match': formatIfMatchVersion(version) },
        }),
      ) as TItem
    },
    async remove(id: string, version: number): Promise<void> {
      await httpClient<void>(`${path}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'If-Match': formatIfMatchVersion(version) },
      })
    },
  }
}

export const contactLinksApi = createCollectionApi<ContactLink, ContactLinkRequest>(
  '/me/profile/contact-links',
  contactLinkSchema,
)
export const certificatesApi = createCollectionApi<Certificate, CertificateRequest>(
  '/me/profile/certificates',
  certificateSchema,
)
export const awardsApi = createCollectionApi<Award, AwardRequest>('/me/profile/awards', awardSchema)
export const activitiesApi = createCollectionApi<Activity, ActivityRequest>(
  '/me/profile/activities',
  activitySchema,
)
export const experienceApi = createCollectionApi<Experience, ExperienceRequest>(
  '/me/profile/experience',
  experienceSchema,
)

export async function uploadCertificateEvidence(
  certificateId: string,
  version: number,
  file: File,
) {
  const body = new FormData()
  body.set('file', file)
  return certificateSchema.parse(
    await httpClient<unknown>(
      `/me/profile/certificates/${encodeURIComponent(certificateId)}/evidence`,
      { method: 'PUT', body, headers: { 'If-Match': formatIfMatchVersion(version) } },
    ),
  )
}

export async function removeCertificateEvidence(certificateId: string, version: number) {
  return certificateSchema.parse(
    await httpClient<unknown>(
      `/me/profile/certificates/${encodeURIComponent(certificateId)}/evidence`,
      { method: 'DELETE', headers: { 'If-Match': formatIfMatchVersion(version) } },
    ),
  )
}
