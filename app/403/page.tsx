import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-6">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Access denied
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          You do not have permission to access this route.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Route protection is enforced server-side against your application role
          and permission map.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/">Return to workspace</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
