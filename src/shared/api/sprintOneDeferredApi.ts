export class SprintOneDeferredApiError extends Error {
  constructor(featureName: string) {
    super(`${featureName} API integration is deferred beyond Sprint 1.`)
    this.name = 'SprintOneDeferredApiError'
  }
}

export function createSprintOneDeferredApi(featureName: string) {
  return async function deferredApiBoundary(): Promise<never> {
    throw new SprintOneDeferredApiError(featureName)
  }
}
