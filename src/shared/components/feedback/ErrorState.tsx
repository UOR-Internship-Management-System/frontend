export function ErrorState({ message }: { message: string }) {
  return (
    <div className="section-card" role="alert">
      <h2>Unable to load this shell</h2>
      <p>{message}</p>
    </div>
  )
}
