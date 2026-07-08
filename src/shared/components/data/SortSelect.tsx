import type { SelectHTMLAttributes } from 'react'
import { SelectField } from '../forms/SelectField'

export function SortSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <SelectField aria-label="Sort" {...props} />
}
