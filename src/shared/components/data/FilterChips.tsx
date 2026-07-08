import { Chip } from '../ui/Chip'

export function FilterChips({ filters }: { filters: string[] }) {
  return (
    <div>
      {filters.map((filter) => (
        <Chip key={filter}>{filter}</Chip>
      ))}
    </div>
  )
}
