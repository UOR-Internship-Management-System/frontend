import { forwardRef, type InputHTMLAttributes } from 'react'

export const FileUploadField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function FileUploadField(props, ref) {
    return <input ref={ref} className="input" type="file" {...props} />
  },
)
