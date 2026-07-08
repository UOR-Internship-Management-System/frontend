import { AppProviders } from './app/providers/AppProviders'
import { AppRouter } from './app/router/router'
import './App.css'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
