import { useTheme } from '../../../app/providers/ThemeProvider'
import { Button } from './Button'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Button
      aria-label={label}
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      title={label}
      variant="secondary"
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </Button>
  )
}
