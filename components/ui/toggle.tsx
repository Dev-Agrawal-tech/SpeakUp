'use client'

import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  id?: string
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  id,
}: ToggleProps) {
  const toggleId = id || label?.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={toggleId}
              className="text-sm font-medium text-white/80 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-white/35 mt-0.5">{description}</p>
          )}
        </div>
      )}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
          border transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
          disabled:cursor-not-allowed disabled:opacity-40
          ${checked
            ? 'bg-blue-500/30 border-blue-500/40'
            : 'bg-white/[0.06] border-white/[0.1]'
          }
        `}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            block h-4 w-4 rounded-full shadow-sm
            ${checked ? 'bg-blue-400' : 'bg-white/40'}
          `}
          style={{ marginLeft: checked ? '22px' : '4px' }}
        />
      </button>
    </div>
  )
}
