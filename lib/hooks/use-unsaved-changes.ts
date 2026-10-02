'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Tracks whether a form has unsaved changes.
 * Shows a browser beforeunload prompt and can be queried before navigation.
 */
export function useUnsavedChanges(isDirty: boolean) {
  const dirtyRef = useRef(isDirty)

  useEffect(() => {
    dirtyRef.current = isDirty
  }, [isDirty])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  const confirmDiscard = useCallback(() => {
    if (!dirtyRef.current) return true
    return window.confirm('You have unsaved changes. Discard them?')
  }, [])

  return { confirmDiscard }
}

/**
 * Simple dirty state tracker for forms that don't use react-hook-form.
 */
export function useDirtyState<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [isDirty, setIsDirty] = useState(false)

  const update = useCallback((newValue: T) => {
    setValue(newValue)
    setIsDirty(true)
  }, [])

  const reset = useCallback((newInitial?: T) => {
    if (newInitial !== undefined) setValue(newInitial)
    setIsDirty(false)
  }, [])

  return { value, isDirty, update, reset }
}
