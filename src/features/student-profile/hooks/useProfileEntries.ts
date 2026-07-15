import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activitiesApi,
  awardsApi,
  certificatesApi,
  contactLinksApi,
  experienceApi,
} from '../api/studentProfileEntriesApi'
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
  ProfileCollectionKind,
  ProfileCollectionQuery,
} from '../types/profileEntryTypes'
import { studentProfileKeys } from './studentProfileKeys'

type CollectionApi<TItem, TRequest> = {
  list: (query: ProfileCollectionQuery, signal?: AbortSignal) => Promise<PagedResponse<TItem>>
  create: (values: TRequest) => Promise<TItem>
  update: (id: string, version: number, values: TRequest) => Promise<TItem>
  remove: (id: string, version: number) => Promise<void>
}

function useCollection<TItem, TRequest>(
  kind: ProfileCollectionKind,
  api: CollectionApi<TItem, TRequest>,
  query: ProfileCollectionQuery,
) {
  return useQuery({
    queryKey: studentProfileKeys.collectionPage(kind, query),
    queryFn: ({ signal }) => api.list(query, signal),
    placeholderData: keepPreviousData,
  })
}

function useCollectionMutations<TItem, TRequest>(
  kind: ProfileCollectionKind,
  api: CollectionApi<TItem, TRequest>,
) {
  const queryClient = useQueryClient()
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: studentProfileKeys.collection(kind) })
  return {
    create: useMutation({
      mutationFn: (values: TRequest) => api.create(values),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, values, version }: { id: string; values: TRequest; version: number }) =>
        api.update(id, version, values),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: ({ id, version }: { id: string; version: number }) => api.remove(id, version),
      onSuccess: refresh,
    }),
  }
}

export const useContactLinks = (query: ProfileCollectionQuery) =>
  useCollection<ContactLink, ContactLinkRequest>('contact-links', contactLinksApi, query)
export const useCertificates = (query: ProfileCollectionQuery) =>
  useCollection<Certificate, CertificateRequest>('certificates', certificatesApi, query)
export const useAwards = (query: ProfileCollectionQuery) =>
  useCollection<Award, AwardRequest>('awards', awardsApi, query)
export const useActivities = (query: ProfileCollectionQuery) =>
  useCollection<Activity, ActivityRequest>('activities', activitiesApi, query)
export const useExperience = (query: ProfileCollectionQuery) =>
  useCollection<Experience, ExperienceRequest>('experience', experienceApi, query)
export const useContactLinkMutations = () =>
  useCollectionMutations<ContactLink, ContactLinkRequest>('contact-links', contactLinksApi)
export const useCertificateMutations = () =>
  useCollectionMutations<Certificate, CertificateRequest>('certificates', certificatesApi)
export const useAwardMutations = () =>
  useCollectionMutations<Award, AwardRequest>('awards', awardsApi)
export const useActivityMutations = () =>
  useCollectionMutations<Activity, ActivityRequest>('activities', activitiesApi)
export const useExperienceMutations = () =>
  useCollectionMutations<Experience, ExperienceRequest>('experience', experienceApi)
