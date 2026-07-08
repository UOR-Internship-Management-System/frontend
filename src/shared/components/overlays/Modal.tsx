import type { ReactNode } from 'react'

export function Modal({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="modal-backdrop">
      <section aria-modal="true" className="modal-card card" role="dialog">
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  )
}
