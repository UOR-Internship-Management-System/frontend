import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  filenameFromContentDisposition,
  sanitizeDownloadFilename,
  saveBlobAsFile,
} from './downloadBlob'

describe('downloadBlob', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.replaceChildren()
  })

  it.each([
    ['../../private\\resume.exe', 'private-resume.exe.pdf'],
    ['  student   cv.PDF  ', 'student cv.pdf'],
    ['<script>|cv?.zip', 'script-cv-.zip.pdf'],
    ['', 'student-cv.pdf'],
  ])('sanitizes %j as %j', (input, expected) => {
    expect(sanitizeDownloadFilename(input)).toBe(expected)
  })

  it('parses encoded, quoted, and unquoted Content-Disposition filenames', () => {
    expect(
      filenameFromContentDisposition(
        "attachment; filename=old.pdf; filename*=UTF-8''student%20final.pdf",
      ),
    ).toBe('student final.pdf')
    expect(filenameFromContentDisposition('attachment; filename="student cv.pdf"')).toBe(
      'student cv.pdf',
    )
    expect(filenameFromContentDisposition('attachment; filename=student-cv')).toBe('student-cv.pdf')
    expect(filenameFromContentDisposition(null)).toBe('student-cv.pdf')
  })

  it('sanitizes CSV and ZIP filenames without falling back to a PDF extension', () => {
    expect(sanitizeDownloadFilename('../shortlist.exe', 'shortlist.csv', '.csv')).toBe(
      'shortlist.exe.csv',
    )
    expect(
      filenameFromContentDisposition('attachment; filename="../all candidates.zip"', {
        extension: '.zip',
        fallback: 'shortlist-cvs.zip',
      }),
    ).toBe('all candidates.zip')
    expect(
      filenameFromContentDisposition(null, {
        extension: '.csv',
        fallback: 'shortlist.csv',
      }),
    ).toBe('shortlist.csv')
  })

  it('clicks once and always removes the anchor and revokes the object URL', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:student-cv')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    saveBlobAsFile(new Blob(['pdf']), '../student cv')

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:student-cv')
    expect(document.querySelector('a')).toBeNull()
  })

  it('revokes the object URL when the browser click fails', () => {
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:student-cv'),
      revokeObjectURL,
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('click failed')
    })

    expect(() => saveBlobAsFile(new Blob(['pdf']), 'student-cv.pdf')).toThrow('click failed')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:student-cv')
    expect(document.querySelector('a')).toBeNull()
  })

  it('preserves an explicitly selected CSV extension during browser delivery', () => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:shortlist'),
      revokeObjectURL: vi.fn(),
    })
    let downloadedFilename = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloadedFilename = this.download
    })

    saveBlobAsFile(new Blob(['csv']), '../shortlist.csv', '.csv')

    expect(downloadedFilename).toBe('shortlist.csv')
  })
})
