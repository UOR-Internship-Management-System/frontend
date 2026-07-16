import { http, HttpResponse } from 'msw'
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
  VersionedProfileEntry,
} from '../../features/student-profile/types/profileEntryTypes'
import type { ProfileUploadPolicy } from '../../features/student-profile/types/profileFileTypes'
import type {
  StudentProfileResponseDto,
  StudentProfileUpdateRequest,
} from '../../features/student-profile/types/studentProfileTypes'
import { getStudentDashboardFixture } from '../fixtures/studentDashboard.fixture'
import { createStudentProfileFixture } from '../fixtures/studentProfile.fixture'

const apiBase = '/api/v1'
const editableProfileFields = new Set([
  'fullName',
  'personalEmail',
  'headline',
  'summary',
  'phone',
  'location',
])
const uploadPolicy: ProfileUploadPolicy = {
  profilePhoto: {
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    maxSizeBytes: 2_000_000,
  },
  certificateEvidence: {
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeBytes: 5_000_000,
  },
}

let idCounter = 100
const nextId = () => `00000000-0000-4000-8000-${String(idCounter++).padStart(12, '0')}`
const timestamp = () => new Date().toISOString()

function baseEntry(id = nextId(), version = 1) {
  return { id, version, createdAt: '2026-07-01T08:00:00Z', updatedAt: '2026-07-01T08:00:00Z' }
}

type MockProfileState = {
  profile: StudentProfileResponseDto
  contactLinks: ContactLink[]
  certificates: Certificate[]
  awards: Award[]
  activities: Activity[]
  experience: Experience[]
}

function createInitialState(): MockProfileState {
  return {
    profile: createStudentProfileFixture(),
    contactLinks: [
      {
        ...baseEntry('10000000-0000-4000-8000-000000000001'),
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/test-student',
        displayOrder: 0,
        cvInclude: true,
      },
      {
        ...baseEntry('10000000-0000-4000-8000-000000000002'),
        label: 'GitHub',
        url: 'https://github.com/test-student',
        displayOrder: 1,
        cvInclude: true,
      },
      {
        ...baseEntry('10000000-0000-4000-8000-000000000003'),
        label: 'Portfolio',
        url: 'https://portfolio.example.com',
        displayOrder: 2,
        cvInclude: true,
      },
      {
        ...baseEntry('10000000-0000-4000-8000-000000000004'),
        label: 'Blog',
        url: 'https://blog.example.com',
        displayOrder: 3,
        cvInclude: false,
      },
      {
        ...baseEntry('10000000-0000-4000-8000-000000000005'),
        label: 'Research',
        url: 'https://research.example.com',
        displayOrder: 4,
        cvInclude: true,
      },
      {
        ...baseEntry('10000000-0000-4000-8000-000000000006'),
        label: 'Personal Website',
        url: 'https://student.example.com',
        displayOrder: 5,
        cvInclude: false,
      },
    ] satisfies ContactLink[],
    certificates: [
      {
        ...baseEntry('20000000-0000-4000-8000-000000000001'),
        title: 'AWS Cloud Foundations',
        issuer: 'Amazon Web Services',
        issueDate: '2026-02-15',
        credentialUrl: 'https://example.com/credential/aws',
        evidence: null,
        cvInclude: true,
      },
    ] satisfies Certificate[],
    awards: [
      {
        ...baseEntry('30000000-0000-4000-8000-000000000001'),
        title: 'Faculty Coding Challenge Winner',
        issuer: 'University of Ruhuna',
        awardDate: '2025-11-20',
        description: 'First place in the annual faculty coding challenge.',
        cvInclude: true,
      },
    ] satisfies Award[],
    activities: [
      {
        ...baseEntry('40000000-0000-4000-8000-000000000001'),
        activityName: 'Computer Science Students Society',
        roleTitle: 'Committee Member',
        startDate: '2024-01-01',
        endDate: null,
        description: 'Organized technical workshops for undergraduates.',
        cvInclude: true,
      },
    ] satisfies Activity[],
    experience: [
      {
        ...baseEntry('50000000-0000-4000-8000-000000000001'),
        organization: 'Example Software',
        positionTitle: 'Software Engineering Intern',
        location: 'Colombo',
        startDate: '2025-06-01',
        endDate: '2025-09-30',
        currentRole: false,
        description: 'Contributed to frontend reliability improvements.',
        cvInclude: true,
      },
    ] satisfies Experience[],
  }
}

let state = createInitialState()

export function resetStudentProfileMock() {
  idCounter = 100
  state = createInitialState()
}

function problem(
  status: number,
  code: string,
  message: string,
  fieldErrors?: Array<{ field: string; code: string; message: string }>,
) {
  return {
    type: `https://uor-cv-system/errors/${code.toLowerCase().replaceAll('_', '-')}`,
    title:
      status === 422
        ? 'Validation failed'
        : status === 412
          ? 'Precondition failed'
          : 'Request failed',
    status,
    code,
    message,
    correlationId: `mock-${status}-${idCounter}`,
    ...(fieldErrors ? { fieldErrors } : {}),
  }
}

function versionFailure(request: Request, version: number) {
  const value = request.headers.get('If-Match')
  if (!value)
    return HttpResponse.json(
      problem(428, 'PRECONDITION_REQUIRED', 'A quoted If-Match version is required.'),
      { status: 428 },
    )
  if (value !== `"${version}"`)
    return HttpResponse.json(
      problem(412, 'STALE_VERSION', 'The record changed after it was loaded.'),
      { status: 412 },
    )
  return null
}

function markCvSourceChanged() {
  state.profile = { ...state.profile, cvSourceUpdatedAt: timestamp() }
}

function paged<T>(request: Request, items: T[], searchable: (item: T) => string) {
  const url = new URL(request.url)
  const page = Math.max(0, Number(url.searchParams.get('page') ?? 0))
  const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') ?? 5)))
  const sort = url.searchParams.get('sort') ?? 'updatedAt,desc'
  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
  const filtered = search
    ? items.filter((item) => searchable(item).toLowerCase().includes(search))
    : items
  return {
    items: filtered.slice(page * size, page * size + size),
    page: {
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      sort,
    },
  }
}

type CollectionConfig<T extends VersionedProfileEntry, R extends Record<string, unknown>> = {
  path: string
  get: () => T[]
  set: (items: T[]) => void
  build: (request: R, previous?: T) => Omit<T, keyof VersionedProfileEntry>
  searchable: (item: T) => string
}

function collectionHandlers<T extends VersionedProfileEntry, R extends Record<string, unknown>>(
  config: CollectionConfig<T, R>,
) {
  return [
    http.get(config.path, ({ request }) =>
      HttpResponse.json(paged(request, config.get(), config.searchable)),
    ),
    http.post(config.path, async ({ request }) => {
      const body = (await request.json()) as R
      const now = timestamp()
      const item = {
        ...config.build(body),
        id: nextId(),
        version: 0,
        createdAt: now,
        updatedAt: now,
      } as T
      config.set([...config.get(), item])
      markCvSourceChanged()
      return HttpResponse.json(item, { status: 201 })
    }),
    http.patch(`${config.path}/:id`, async ({ params, request }) => {
      const index = config.get().findIndex((item) => item.id === params.id)
      if (index < 0)
        return HttpResponse.json(problem(404, 'NOT_FOUND', 'The entry no longer exists.'), {
          status: 404,
        })
      const previous = config.get()[index]!
      const failure = versionFailure(request, previous.version)
      if (failure) return failure
      const body = (await request.json()) as R
      const item = {
        ...previous,
        ...config.build(body, previous),
        version: previous.version + 1,
        updatedAt: timestamp(),
      } as T
      const items = [...config.get()]
      items[index] = item
      config.set(items)
      markCvSourceChanged()
      return HttpResponse.json(item)
    }),
    http.delete(`${config.path}/:id`, ({ params, request }) => {
      const item = config.get().find((candidate) => candidate.id === params.id)
      if (!item)
        return HttpResponse.json(problem(404, 'NOT_FOUND', 'The entry no longer exists.'), {
          status: 404,
        })
      const failure = versionFailure(request, item.version)
      if (failure) return failure
      config.set(config.get().filter((candidate) => candidate.id !== item.id))
      markCvSourceChanged()
      return new HttpResponse(null, { status: 204 })
    }),
  ]
}

const contactHandlers = collectionHandlers<
  ContactLink,
  ContactLinkRequest & Record<string, unknown>
>({
  path: `${apiBase}/me/profile/contact-links`,
  get: () => state.contactLinks,
  set: (items) => {
    state.contactLinks = items
  },
  searchable: (item) => `${item.label} ${item.url}`,
  build: (body, previous) => ({
    label: body.label ?? previous!.label,
    url: body.url ?? previous!.url,
    displayOrder: body.displayOrder ?? previous?.displayOrder ?? 0,
    cvInclude: body.cvInclude ?? previous?.cvInclude ?? true,
  }),
})
const certificateHandlers = collectionHandlers<
  Certificate,
  CertificateRequest & Record<string, unknown>
>({
  path: `${apiBase}/me/profile/certificates`,
  get: () => state.certificates,
  set: (items) => {
    state.certificates = items
  },
  searchable: (item) => `${item.title} ${item.issuer}`,
  build: (body, previous) => ({
    title: body.title ?? previous!.title,
    issuer: body.issuer ?? previous!.issuer,
    issueDate: body.issueDate ?? previous!.issueDate,
    credentialUrl: body.credentialUrl ?? null,
    evidence: previous?.evidence ?? null,
    cvInclude: body.cvInclude ?? previous?.cvInclude ?? true,
  }),
})
const awardHandlers = collectionHandlers<Award, AwardRequest & Record<string, unknown>>({
  path: `${apiBase}/me/profile/awards`,
  get: () => state.awards,
  set: (items) => {
    state.awards = items
  },
  searchable: (item) => `${item.title} ${item.issuer} ${item.description ?? ''}`,
  build: (body, previous) => ({
    title: body.title ?? previous!.title,
    issuer: body.issuer ?? previous!.issuer,
    awardDate: body.awardDate ?? previous!.awardDate,
    description: body.description ?? null,
    cvInclude: body.cvInclude ?? previous?.cvInclude ?? true,
  }),
})
const activityHandlers = collectionHandlers<Activity, ActivityRequest & Record<string, unknown>>({
  path: `${apiBase}/me/profile/activities`,
  get: () => state.activities,
  set: (items) => {
    state.activities = items
  },
  searchable: (item) => `${item.activityName} ${item.roleTitle} ${item.description ?? ''}`,
  build: (body, previous) => ({
    activityName: body.activityName ?? previous!.activityName,
    roleTitle: body.roleTitle ?? previous!.roleTitle,
    startDate: body.startDate ?? null,
    endDate: body.endDate ?? null,
    description: body.description ?? null,
    cvInclude: body.cvInclude ?? previous?.cvInclude ?? true,
  }),
})
const experienceHandlers = collectionHandlers<
  Experience,
  ExperienceRequest & Record<string, unknown>
>({
  path: `${apiBase}/me/profile/experience`,
  get: () => state.experience,
  set: (items) => {
    state.experience = items
  },
  searchable: (item) => `${item.organization} ${item.positionTitle} ${item.location ?? ''}`,
  build: (body, previous) => ({
    organization: body.organization ?? previous!.organization,
    positionTitle: body.positionTitle ?? previous!.positionTitle,
    location: body.location ?? null,
    startDate: body.startDate ?? previous!.startDate,
    endDate: body.currentRole ? null : (body.endDate ?? null),
    currentRole: body.currentRole ?? previous?.currentRole ?? false,
    description: body.description ?? null,
    cvInclude: body.cvInclude ?? previous?.cvInclude ?? true,
  }),
})

export const studentHandlers = [
  http.get(`${apiBase}/me/dashboard/metrics`, () =>
    HttpResponse.json(getStudentDashboardFixture()),
  ),
  http.get(`${apiBase}/me/profile`, () => HttpResponse.json(state.profile)),
  http.patch(`${apiBase}/me/profile`, async ({ request }) => {
    const failure = versionFailure(request, state.profile.version)
    if (failure) return failure
    const body = (await request.json()) as Record<string, unknown>
    const unsupported = Object.keys(body).filter((field) => !editableProfileFields.has(field))
    if (unsupported.length || Object.keys(body).length === 0)
      return HttpResponse.json(
        problem(
          422,
          'VALIDATION_FAILED',
          'One or more fields are invalid.',
          unsupported.map((field) => ({
            field,
            code: 'FIELD_NOT_EDITABLE',
            message: 'This field cannot be updated.',
          })),
        ),
        { status: 422 },
      )
    const now = timestamp()
    state.profile = {
      ...state.profile,
      ...(body as StudentProfileUpdateRequest),
      version: state.profile.version + 1,
      updatedAt: now,
      cvSourceUpdatedAt: now,
    }
    return HttpResponse.json(state.profile)
  }),
  http.get(`${apiBase}/me/profile/upload-policy`, () => HttpResponse.json(uploadPolicy)),
  http.put(`${apiBase}/me/profile/photo`, async ({ request }) => {
    const failure = versionFailure(request, state.profile.version)
    if (failure) return failure
    const file = (await request.formData()).get('file')
    if (!(file instanceof File))
      return HttpResponse.json(
        problem(422, 'VALIDATION_FAILED', 'The multipart field "file" is required.'),
        { status: 422 },
      )
    if (!uploadPolicy.profilePhoto.allowedMimeTypes.includes(file.type))
      return HttpResponse.json(
        problem(415, 'UNSUPPORTED_MEDIA_TYPE', 'The selected picture type is not supported.'),
        { status: 415 },
      )
    if (file.size > uploadPolicy.profilePhoto.maxSizeBytes)
      return HttpResponse.json(
        problem(413, 'FILE_TOO_LARGE', 'The selected picture is too large.'),
        { status: 413 },
      )
    const now = timestamp()
    state.profile = {
      ...state.profile,
      profilePhoto: {
        fileId: nextId(),
        fileName: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        url: `https://files.example.edu/profile/${encodeURIComponent(file.name)}`,
        createdAt: now,
      },
      version: state.profile.version + 1,
      updatedAt: now,
      cvSourceUpdatedAt: now,
    }
    return HttpResponse.json(state.profile)
  }),
  http.delete(`${apiBase}/me/profile/photo`, ({ request }) => {
    const failure = versionFailure(request, state.profile.version)
    if (failure) return failure
    const now = timestamp()
    state.profile = {
      ...state.profile,
      profilePhoto: null,
      version: state.profile.version + 1,
      updatedAt: now,
      cvSourceUpdatedAt: now,
    }
    return HttpResponse.json(state.profile)
  }),
  ...contactHandlers,
  ...certificateHandlers,
  http.put(`${apiBase}/me/profile/certificates/:id/evidence`, async ({ params, request }) => {
    const index = state.certificates.findIndex((item) => item.id === params.id)
    if (index < 0)
      return HttpResponse.json(problem(404, 'NOT_FOUND', 'The Certificate no longer exists.'), {
        status: 404,
      })
    const previous = state.certificates[index]!
    const failure = versionFailure(request, previous.version)
    if (failure) return failure
    const file = (await request.formData()).get('file')
    if (!(file instanceof File))
      return HttpResponse.json(
        problem(422, 'VALIDATION_FAILED', 'The multipart field "file" is required.'),
        { status: 422 },
      )
    if (!uploadPolicy.certificateEvidence.allowedMimeTypes.includes(file.type))
      return HttpResponse.json(
        problem(415, 'UNSUPPORTED_MEDIA_TYPE', 'The evidence type is not supported.'),
        { status: 415 },
      )
    if (file.size > uploadPolicy.certificateEvidence.maxSizeBytes)
      return HttpResponse.json(problem(413, 'FILE_TOO_LARGE', 'The evidence file is too large.'), {
        status: 413,
      })
    const now = timestamp()
    const item = {
      ...previous,
      evidence: {
        fileId: nextId(),
        fileName: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        url: `https://files.example.edu/certificates/${encodeURIComponent(file.name)}`,
        createdAt: now,
      },
      version: previous.version + 1,
      updatedAt: now,
    }
    state.certificates[index] = item
    markCvSourceChanged()
    return HttpResponse.json(item)
  }),
  http.delete(`${apiBase}/me/profile/certificates/:id/evidence`, ({ params, request }) => {
    const index = state.certificates.findIndex((item) => item.id === params.id)
    if (index < 0)
      return HttpResponse.json(problem(404, 'NOT_FOUND', 'The Certificate no longer exists.'), {
        status: 404,
      })
    const previous = state.certificates[index]!
    const failure = versionFailure(request, previous.version)
    if (failure) return failure
    const item = {
      ...previous,
      evidence: null,
      version: previous.version + 1,
      updatedAt: timestamp(),
    }
    state.certificates[index] = item
    markCvSourceChanged()
    return HttpResponse.json(item)
  }),
  ...awardHandlers,
  ...activityHandlers,
  ...experienceHandlers,
]
