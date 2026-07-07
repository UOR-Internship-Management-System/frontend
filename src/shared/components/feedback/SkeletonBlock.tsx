export type SkeletonBlockProps = {
  lines?: number
  label?: string
}

export function SkeletonBlock({
  label = 'Foundation placeholder panel',
  lines = 3,
}: SkeletonBlockProps) {
  return (
    <div aria-label={label} className="skeleton-block" role="status">
      {Array.from({ length: lines }, (_, index) => (
        <span className="skeleton-line" key={index} />
      ))}
    </div>
  )
}
