import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { env } from './app/config/env'
import './index.css'
import './styles/skeleton-system.css'
import './styles/sprint78-wireframe-alignment.css'
import './styles/internship-management-complete.css'
import './styles/shortlisted-page.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Application root element was not found.')
}

async function enableDevelopmentMocks() {
  if (!env.enableApiMocks || env.isProduction) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

void enableDevelopmentMocks().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
