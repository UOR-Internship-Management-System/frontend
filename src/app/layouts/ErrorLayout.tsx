import { Outlet } from 'react-router-dom'

export function ErrorLayout() {
  return (
    <section className="section-card">
      <Outlet />
    </section>
  )
}
