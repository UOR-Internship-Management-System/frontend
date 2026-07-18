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
})
