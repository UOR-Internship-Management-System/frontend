export type MetricCardProps = {
  label: string
  value: string
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="section-card">
      <strong>{value}</strong>
      <p>{label}</p>
    </article>
  )
}
