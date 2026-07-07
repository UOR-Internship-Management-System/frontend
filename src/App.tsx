import './App.css'
import { AppProviders } from './app/providers/AppProviders'
import { AppRouter } from './app/router/router'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
