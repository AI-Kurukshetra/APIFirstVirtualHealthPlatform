"use client"

import { createContext, useCallback, useContext, useState } from "react"

interface BreadcrumbContextValue {
  labels: Record<string, string>
  setLabel: (segment: string, label: string) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  labels: {},
  setLabel: () => {},
})

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [labels, setLabels] = useState<Record<string, string>>({})

  const setLabel = useCallback((segment: string, label: string) => {
    setLabels((prev) => {
      if (prev[segment] === label) return prev
      return { ...prev, [segment]: label }
    })
  }, [])

  return (
    <BreadcrumbContext.Provider value={{ labels, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumbs() {
  return useContext(BreadcrumbContext)
}
