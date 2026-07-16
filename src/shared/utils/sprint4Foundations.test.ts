import { describe, expect, it } from 'vitest'
import { pageMetadataSchema } from '../validation/paginationSchemas'
import { buildQueryString } from './buildQueryString'
import { clampPage } from './clampPage'

describe('Sprint 4 shared foundations', () => {
  it('validates strict OpenAPI page metadata', () => {
    const metadata = {
      page: 0,
      size: 20,
      totalElements: 21,
      totalPages: 2,
      sort: 'name,asc',
    }

    expect(pageMetadataSchema.parse(metadata)).toEqual(metadata)
    expect(() => pageMetadataSchema.parse({ ...metadata, page: -1 })).toThrow()
    expect(() => pageMetadataSchema.parse({ ...metadata, unknown: true })).toThrow()
  })

  it('encodes supported query values and omits empty values', () => {
    expect(
      buildQueryString({
        page: 0,
        size: 20,
        search: 'React & TypeScript',
        categoryId: undefined,
        clusterId: '',
        active: true,
        sort: ['name,asc', null],
      }),
    ).toBe('?page=0&size=20&search=React+%26+TypeScript&active=true&sort=name%2Casc')
  })

  it('clamps zero-based pages after totals shrink', () => {
    expect(clampPage(3, 31, 10)).toBe(3)
    expect(clampPage(3, 30, 10)).toBe(2)
    expect(clampPage(1, 0, 10)).toBe(0)
    expect(clampPage(-1, 10, 10)).toBe(0)
  })
})
