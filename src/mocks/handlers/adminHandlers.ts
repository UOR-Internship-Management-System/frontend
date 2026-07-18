import { http, HttpResponse } from 'msw'
import { adminDashboardMetricsFixture } from '../fixtures/adminDashboard.fixture'
import { registeredStudentsFixture } from '../fixtures/registeredStudents.fixture'

const apiBase = '/api/v1'

export const adminHandlers = [
  http.get(`${apiBase}/admin/dashboard/metrics`, () =>
    HttpResponse.json(adminDashboardMetricsFixture),
  ),
  http.get(`${apiBase}/admin/students`, ({ request }) => {
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const level = url.searchParams.get('level')
    const sort = url.searchParams.get('sort') ?? 'fullName,asc'
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 20)
    const filtered = registeredStudentsFixture.filter((student) => {
      const searchable =
        `${student.fullName} ${student.indexNumber} ${student.universityEmail} ${student.academicBatch}`.toLowerCase()
      return (
        (!search || searchable.includes(search)) &&
        (!level || String(student.currentLevel) === level)
      )
    })
    const sorted = [...filtered].sort((left, right) => {
      if (sort === 'officialGpa,desc' || sort === 'officialGpa,asc') {
        const leftGpa = left.officialGpa
        const rightGpa = right.officialGpa
        if (leftGpa === null) return 1
        if (rightGpa === null) return -1
        return sort.endsWith('desc') ? rightGpa - leftGpa : leftGpa - rightGpa
      }
      if (sort === 'indexNumber,asc') return left.indexNumber.localeCompare(right.indexNumber)
      return left.fullName.localeCompare(right.fullName)
    })
    const items = sorted.slice(page * size, page * size + size)
    return HttpResponse.json({
      items,
      page: {
        page,
        size,
        totalElements: sorted.length,
        totalPages: Math.ceil(sorted.length / size),
        sort,
      },
    })
  }),
]
