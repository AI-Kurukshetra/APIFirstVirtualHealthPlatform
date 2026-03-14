"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Breadcrumbs() {
  const pathname = usePathname()
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
          const label = segment
            .split("-")
            .map((part) => part[0]?.toUpperCase() + part.slice(1))
            .join(" ")

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
