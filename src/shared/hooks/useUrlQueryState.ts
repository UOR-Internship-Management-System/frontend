import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type UrlQueryStateConfig<TState> = {
  parse: (parameters: URLSearchParams) => TState
  serialize: (state: TState) => URLSearchParams
}

export function useUrlQueryState<TState>({ parse, serialize }: UrlQueryStateConfig<TState>) {
  const [parameters, setParameters] = useSearchParams()
  const serializedParameters = parameters.toString()
  const state = useMemo(
    () => parse(new URLSearchParams(serializedParameters)),
    [parse, serializedParameters],
  )

  const setState = useCallback(
    (next: TState, options: { replace?: boolean } = {}) => {
      setParameters(serialize(next), { replace: options.replace })
    },
    [serialize, setParameters],
  )

  return [state, setState] as const
}

export function readNonnegativeInteger(value: string | null, fallback: number) {
  if (!value || !/^\d+$/.test(value)) return fallback
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : fallback
}
