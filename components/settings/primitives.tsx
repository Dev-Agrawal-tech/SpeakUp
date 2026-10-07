import type { ReactNode } from 'react'

export function SettingsHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-white/40 mt-1">{description}</p>
      )}
    </div>
  )
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="mb-6">
      {title && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-white/30 mt-0.5">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export function SettingsCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 sm:p-5 ${className}`}
    >
      {children}
    </div>
  )
}
