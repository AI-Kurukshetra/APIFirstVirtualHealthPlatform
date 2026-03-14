"use client"

import { useEffect } from "react"
import { useBreadcrumbs } from "@/lib/breadcrumb-context"

interface BreadcrumbLabelProps {
  segment: string
  label: string
}

export function BreadcrumbLabel({ segment, label }: BreadcrumbLabelProps) {
  const { setLabel } = useBreadcrumbs()

  useEffect(() => {
    setLabel(segment, label)
  }, [segment, label, setLabel])

  return null
}
