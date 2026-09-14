import { useEffect, useState } from 'react'

export type WindowSizeClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extra-large'

function classifyWidth(width: number): WindowSizeClass {
  if (width < 600) return 'compact'
  if (width < 840) return 'medium'
  if (width < 1200) return 'expanded'
  if (width < 1600) return 'large'
  return 'extra-large'
}

/** M3 window size class breakpoints (compact <600, medium <840, expanded <1200, large <1600, extra-large 1600+). */
export function useBreakpoint(): WindowSizeClass {
  const [sizeClass, setSizeClass] = useState<WindowSizeClass>(() =>
    typeof window === 'undefined' ? 'expanded' : classifyWidth(window.innerWidth),
  )

  useEffect(() => {
    const update = () => setSizeClass(classifyWidth(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return sizeClass
}

/** True below the medium/expanded boundary (840px), where M3 recommends single-pane layouts. */
export function useIsCompactLayout(): boolean {
  const sizeClass = useBreakpoint()
  return sizeClass === 'compact' || sizeClass === 'medium'
}
