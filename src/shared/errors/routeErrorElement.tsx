import { useRouteError } from 'react-router-dom'
import { ErrorState } from '../components/feedback/ErrorState'
import { safeErrorMessage } from './safeErrorMessage'

export function RouteErrorElement() {
  const error = useRouteError()
  return <ErrorState message={safeErrorMessage(error)} />
}
