import { useState, useCallback } from "react"

export function useCrudModal<T extends Record<string, unknown>>(initialValues: T) {
  const [isOpen, setIsOpen] = useState(false)
  const [values, setValues] = useState<T>(initialValues)

  const open = useCallback(() => setIsOpen(true), [])

  const close = useCallback(() => {
    setIsOpen(false)
    setValues(initialValues)
  }, [initialValues])

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setValues(initialValues), [initialValues])

  return { isOpen, open, close, values, setField, reset }
}
