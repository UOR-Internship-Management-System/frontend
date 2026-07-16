export type PageMetadata = {
  page: number
  size: number
  totalElements: number
  totalPages: number
  sort: string
}

export type PagedResponse<T> = {
  items: T[]
  page: PageMetadata
}

export type PagedQuery = {
  page: number
  size: number
  sort?: string
  search?: string
}
