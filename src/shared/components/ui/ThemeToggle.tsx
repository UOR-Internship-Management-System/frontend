import { useTheme } from '../../../app/providers/ThemeProvider'

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme()

  return (
    <button type="button" className="nav-link" onClick={toggleTheme} aria-label="Toggle color theme">
      {mode === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
