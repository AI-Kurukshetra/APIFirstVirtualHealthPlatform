import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { addDiagnosisAction } from "../actions"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface NewDiagnosisPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function NewDiagnosisPage({
  params,
  searchParams,
}: NewDiagnosisPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "diagnoses:manage")

  const { id } = await params
  const { error } = await searchParams

  const patient = await db.user.findFirst({
    where: { id, role: Role.PATIENT },
    select: { id: true, firstName: true, lastName: true },
  })

  if (!patient) notFound()

  const action = addDiagnosisAction.bind(null, id)

  return (
    <section className="grid gap-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/clinical/patients/${id}/diagnoses`}>
            ← Back to diagnoses
          </Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Add diagnosis — {patient.firstName} {patient.lastName}
        </h1>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={action} className="mt-6 grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="icdCode" className="text-sm font-medium">
                ICD code <span className="text-destructive">*</span>
              </label>
              <input
                id="icdCode"
                name="icdCode"
                type="text"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. E11.9"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                defaultValue="ACTIVE"
              >
                <option value="ACTIVE">Active</option>
                <option value="CHRONIC">Chronic</option>
              </select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>
            <input
              id="description"
              name="description"
              type="text"
              required
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Type 2 diabetes mellitus without complications"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="diagnosedDate" className="text-sm font-medium">
              Diagnosed date <span className="text-destructive">*</span>
            </label>
            <input
              id="diagnosedDate"
              name="diagnosedDate"
              type="date"
              required
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Any additional context..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Add diagnosis</Button>
            <Button asChild variant="outline">
              <Link href={`/clinical/patients/${id}/diagnoses`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
