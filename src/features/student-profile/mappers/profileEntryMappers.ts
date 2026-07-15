import type {
  ActivityFormValues,
  ActivityRequest,
  AwardFormValues,
  AwardRequest,
  CertificateFormValues,
  CertificateRequest,
  ContactLinkFormValues,
  ContactLinkRequest,
  ExperienceFormValues,
  ExperienceRequest,
} from '../types/profileEntryTypes'

const nullable = (value: string) => value.trim() || null

export const mapContactLinkRequest = (value: ContactLinkFormValues): ContactLinkRequest => ({
  label: value.label.trim(),
  url: value.url.trim(),
  displayOrder: Number(value.displayOrder),
  cvInclude: value.cvInclude,
})
export const mapCertificateRequest = (value: CertificateFormValues): CertificateRequest => ({
  title: value.title.trim(),
  issuer: value.issuer.trim(),
  issueDate: value.issueDate,
  credentialUrl: nullable(value.credentialUrl),
  cvInclude: value.cvInclude,
})
export const mapAwardRequest = (value: AwardFormValues): AwardRequest => ({
  title: value.title.trim(),
  issuer: value.issuer.trim(),
  awardDate: value.awardDate,
  description: nullable(value.description),
  cvInclude: value.cvInclude,
})
export const mapActivityRequest = (value: ActivityFormValues): ActivityRequest => ({
  activityName: value.activityName.trim(),
  roleTitle: value.roleTitle.trim(),
  startDate: nullable(value.startDate),
  endDate: nullable(value.endDate),
  description: nullable(value.description),
  cvInclude: value.cvInclude,
})
export const mapExperienceRequest = (value: ExperienceFormValues): ExperienceRequest => ({
  organization: value.organization.trim(),
  positionTitle: value.positionTitle.trim(),
  location: nullable(value.location),
  startDate: value.startDate,
  endDate: value.currentRole ? null : nullable(value.endDate),
  currentRole: value.currentRole,
  description: nullable(value.description),
  cvInclude: value.cvInclude,
})
