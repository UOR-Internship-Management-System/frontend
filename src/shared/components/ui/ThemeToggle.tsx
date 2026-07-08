import { useTheme } from '../../../app/providers/ThemeProvider'
import { Button } from './Button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button aria-label="Toggle color theme" onClick={toggleTheme} variant="secondary">
      {theme === 'dark' ? 'Light' : 'Dark'}
    </Button>
  )
}
