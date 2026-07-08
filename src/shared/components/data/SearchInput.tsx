import type { InputHTMLAttributes } from 'react'
import { TextInput } from '../forms/TextInput'

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <TextInput aria-label="Search" type="search" {...props} />
}
