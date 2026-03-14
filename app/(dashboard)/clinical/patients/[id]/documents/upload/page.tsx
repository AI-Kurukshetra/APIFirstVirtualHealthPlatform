import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { addDocumentAction } from "../actions"
import { DocumentCategory, Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface UploadDocumentPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

const CATEGORY_LABELS: Record<string, string> = {
  LAB_REPORT: "Lab report",
  IMAGING: "Imaging",
  REFERRAL_LETTER: "Referral letter",
  INSURANCE_CARD: "Insurance card",
  CONSENT_FORM: "Consent form",
  DISCHARGE_SUMMARY: "Discharge summary",
  OTHER: "Other",
}

export default async function UploadDocumentPage({
  params,
  searchParams,
}: UploadDocumentPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "documents:upload")

  const { id } = await params
  const { error } = await searchParams

  const patient = await db.user.findFirst({
    where: { id, role: Role.PATIENT },
    select: { id: true, firstName: true, lastName: true },
  })

  if (!patient) notFound()

  const action = addDocumentAction.bind(null, id)
  const categories = Object.values(DocumentCategory)

  return (
    <section className="grid gap-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/clinical/patients/${id}/documents`}>
            ← Back to documents
          </Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Upload document — {patient.firstName} {patient.lastName}
        </h1>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={action} className="mt-6 grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Document name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. CBC Results March 2026"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="category" className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c] ?? c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="fileUrl" className="text-sm font-medium">
              File URL <span className="text-destructive">*</span>
            </label>
            <input
              id="fileUrl"
              name="fileUrl"
              type="url"
              required
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="fileType" className="text-sm font-medium">
                File type <span className="text-destructive">*</span>
              </label>
              <input
                id="fileType"
                name="fileType"
                type="text"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. application/pdf"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="fileSize" className="text-sm font-medium">
                File size (bytes)
              </label>
              <input
                id="fileSize"
                name="fileSize"
                type="number"
                min="0"
                step="1"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 204800"
              />
            </div>
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
              placeholder="Any notes about this document..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Upload</Button>
            <Button asChild variant="outline">
              <Link href={`/clinical/patients/${id}/documents`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
