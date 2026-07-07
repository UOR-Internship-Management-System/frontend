import type { InputHTMLAttributes } from 'react'

export function FileUploadField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" type="file" {...props} />
}
