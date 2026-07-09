import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="auth-route-canvas">
      <Outlet />
    </div>
  )
}
