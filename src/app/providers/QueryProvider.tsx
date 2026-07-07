import { type ReactNode } from 'react'

interface QueryProviderProps {
  readonly children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return <>{children}</>
}
