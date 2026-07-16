import type { FileAsset } from './profileFileTypes'

export const PROFILE_SECTION_PAGE_SIZE = 5

export type ProfileCollectionKind =
  'contact-links' | 'certificates' | 'awards' | 'activities' | 'experience'

export type ProfileCollectionQuery = {
  page: number
  size: number
  sort: string
  search: string
}

export type PageMetadata = {
  page: number
  size: number
  totalElements: number
  totalPages: number
  sort: string
}

export type PagedResponse<T> = { items: T[]; page: PageMetadata }

export type VersionedProfileEntry = {
  id: string
  version: number
  createdAt: string
  updatedAt: string
  cvInclude: boolean
}

export type ContactLink = VersionedProfileEntry & {
  label: string
  url: string
  displayOrder: number
}
export type Certificate = VersionedProfileEntry & {
  title: string
  issuer: string
  issueDate: string
  credentialUrl: string | null
  evidence: FileAsset | null
}
export type Award = VersionedProfileEntry & {
  title: string
  issuer: string
  awardDate: string
  description: string | null
}
export type Activity = VersionedProfileEntry & {
  activityName: string
  roleTitle: string
  startDate: string | null
  endDate: string | null
  description: string | null
}
export type Experience = VersionedProfileEntry & {
  organization: string
  positionTitle: string
  location: string | null
  startDate: string
  endDate: string | null
  currentRole: boolean
  description: string | null
}

export type ContactLinkFormValues = {
  label: string
  url: string
  displayOrder: string
  cvInclude: boolean
}
export type CertificateFormValues = {
  title: string
  issuer: string
  issueDate: string
  credentialUrl: string
  cvInclude: boolean
}
export type AwardFormValues = {
  title: string
  issuer: string
  awardDate: string
  description: string
  cvInclude: boolean
}
export type ActivityFormValues = {
  activityName: string
  roleTitle: string
  startDate: string
  endDate: string
  description: string
  cvInclude: boolean
}
export type ExperienceFormValues = {
  organization: string
  positionTitle: string
  location: string
  startDate: string
  endDate: string
  currentRole: boolean
  description: string
  cvInclude: boolean
}

export type ContactLinkRequest = {
  label: string
  url: string
  displayOrder: number
  cvInclude: boolean
}
export type CertificateRequest = {
  title: string
  issuer: string
  issueDate: string
  credentialUrl: string | null
  cvInclude: boolean
}
export type AwardRequest = {
  title: string
  issuer: string
  awardDate: string
  description: string | null
  cvInclude: boolean
}
export type ActivityRequest = {
  activityName: string
  roleTitle: string
  startDate: string | null
  endDate: string | null
  description: string | null
  cvInclude: boolean
}
export type ExperienceRequest = {
  organization: string
  positionTitle: string
  location: string | null
  startDate: string
  endDate: string | null
  currentRole: boolean
  description: string | null
  cvInclude: boolean
}
