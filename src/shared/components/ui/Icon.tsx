export type IconProps = {
  name: 'foundation' | 'shield' | 'route'
  className?: string
}

export function Icon({ name, className = '' }: IconProps) {
  const label = name === 'shield' ? 'Security' : name === 'route' ? 'Routing' : 'Foundation'

  return (
    <span aria-label={label} className={className} role="img">
      {name === 'shield' ? '◇' : name === 'route' ? '◆' : '●'}
    </span>
  )
}
