import { useId } from 'react'

type LogoDrawRevealProps = {
  alt: string
  className?: string
  loop?: boolean
}

const logoStrokePath =
  'M1515 1055 C1325 1225 1000 1250 810 1055 C610 850 665 525 900 390 C1125 260 1405 350 1530 590 L1695 1055 L2075 345'

export function LogoDrawReveal({ alt, className = '', loop = false }: LogoDrawRevealProps) {
  const generatedTitleId = useId()
  const titleId = alt ? `logo-draw-title-${generatedTitleId.replaceAll(':', '')}` : undefined

  return (
    <svg
      aria-hidden={alt ? undefined : true}
      aria-labelledby={titleId}
      className={`logo-draw-reveal ${loop ? 'logo-draw-reveal--loop' : 'logo-draw-reveal--once'} ${className}`.trim()}
      role={alt ? 'img' : undefined}
      viewBox="0 0 2752 1536"
      xmlns="http://www.w3.org/2000/svg"
    >
      {alt ? <title id={titleId}>{alt}</title> : null}

      <g className="logo-draw-reveal__mark">
        <path className="logo-draw-reveal__mark-stroke" d={logoStrokePath} pathLength="1000" />
      </g>
    </svg>
  )
}
