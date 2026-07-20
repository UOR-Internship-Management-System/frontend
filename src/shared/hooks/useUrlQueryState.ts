import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type UrlQueryStateConfig<TState> = {
  parse: (parameters: URLSearchParams) => TState
  serialize: (state: TState) => URLSearchParams
  ownedKeys?: readonly string[]
}

export function useUrlQueryState<TState>({
  ownedKeys,
  parse,
  serialize,
}: UrlQueryStateConfig<TState>) {
  const [parameters, setParameters] = useSearchParams()
  const serializedParameters = parameters.toString()
  const state = useMemo(
    () => parse(new URLSearchParams(serializedParameters)),
    [parse, serializedParameters],
  )

  const setState = useCallback(
    (next: TState, options: { replace?: boolean } = {}) => {
      const serialized = serialize(next)
      if (!ownedKeys) {
        setParameters(serialized, { replace: options.replace })
        return
      }

      const merged = new URLSearchParams(parameters)
      for (const key of ownedKeys) merged.delete(key)
      serialized.forEach((value, key) => merged.append(key, value))
      setParameters(merged, { replace: options.replace })
    },
    [ownedKeys, parameters, serialize, setParameters],
  )

  return [state, setState] as const
}

export function readNonnegativeInteger(value: string | null, fallback: number) {
  if (!value || !/^\d+$/.test(value)) return fallback
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : fallback
}
