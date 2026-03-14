"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type NavItem } from "@/lib/config/navigation"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  items: NavItem[]
}

export function MobileNav({ items }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        aria-expanded={open}
        aria-label="Open navigation"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        size="icon-sm"
        type="button"
        variant="outline"
      >
        <Menu />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation backdrop"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85vw] max-w-sm flex-col border-r border-border bg-background p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">
                  Workspace
                </p>
                <p className="mt-2 text-lg font-semibold">Healthie Console</p>
              </div>
              <Button
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X />
              </Button>
            </div>
            <nav className="mt-8 flex flex-1 flex-col gap-2">
              {items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    className={cn(
                      "rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  )
}
