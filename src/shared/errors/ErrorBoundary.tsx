import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { ErrorState } from '../components/feedback/ErrorState'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void error
    void info
    return undefined
  }

  render() {
    if (this.state.error) {
      return <ErrorState message="The route shell failed to render." />
    }

    return this.props.children
  }
}
