"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useBreadcrumbs } from "@/lib/breadcrumb-context"

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const { labels } = useBreadcrumbs()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link className="transition-colors hover:text-foreground" href="/">
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`
          const label = labels[segment] ?? formatSegment(segment)

          return (
            <li className="flex items-center gap-2" key={href}>
              <span>/</span>
              <Link className="transition-colors hover:text-foreground" href={href}>
                {label}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
