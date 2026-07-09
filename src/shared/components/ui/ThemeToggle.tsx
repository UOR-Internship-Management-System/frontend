import { useTheme } from '../../../app/providers/ThemeProvider'
import { Button } from './Button'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      aria-label="Toggle dark mode"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      variant="secondary"
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </Button>
  )
}
