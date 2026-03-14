import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { saveTemplateAction } from "../actions"
import { NoteType } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface NewTemplatePageProps {
  searchParams: Promise<{ error?: string }>
}

const NOTE_TYPE_LABELS: Record<string, string> = {
  SOAP: "SOAP",
  PROGRESS: "Progress note",
  PROCEDURE_NOTE: "Procedure note",
  CONSULTATION: "Consultation",
  DISCHARGE: "Discharge summary",
  FOLLOW_UP: "Follow-up",
}

export default async function NewTemplatePage({
  searchParams,
}: NewTemplatePageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical")
  requirePermission(currentUser.role, "notes:create")

  const { error } = await searchParams

  const noteTypes = Object.values(NoteType)

  return (
    <section className="grid gap-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/clinical/templates">← Back to templates</Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">New template</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a reusable template to pre-populate note fields.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={saveTemplateAction} className="mt-6 grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Template name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Diabetes follow-up SOAP"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="type" className="text-sm font-medium">
                Note type <span className="text-destructive">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a type...</option>
                {noteTypes.map((t) => (
                  <option key={t} value={t}>
                    {NOTE_TYPE_LABELS[t] ?? t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="specialty" className="text-sm font-medium">
              Specialty <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="specialty"
              name="specialty"
              type="text"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Endocrinology"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="subjective" className="text-sm font-medium">
              Subjective <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="subjective"
              name="subjective"
              rows={3}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Default subjective template text..."
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="objective" className="text-sm font-medium">
              Objective <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="objective"
              name="objective"
              rows={3}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Default objective template text..."
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="assessment" className="text-sm font-medium">
              Assessment <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="assessment"
              name="assessment"
              rows={3}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Default assessment template text..."
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="plan" className="text-sm font-medium">
              Plan <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="plan"
              name="plan"
              rows={3}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Default plan template text..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Save template</Button>
            <Button asChild variant="outline">
              <Link href="/clinical/templates">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
