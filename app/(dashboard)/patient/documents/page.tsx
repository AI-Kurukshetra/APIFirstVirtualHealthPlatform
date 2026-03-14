import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { formatFileSize } from "@/lib/ehr/vitals"

export const dynamic = "force-dynamic"

interface PatientDocumentsPageProps {
  searchParams: Promise<{ message?: string; error?: string }>
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

const CATEGORY_COLORS: Record<string, string> = {
  LAB_REPORT: "bg-blue-100 text-blue-800",
  IMAGING: "bg-purple-100 text-purple-800",
  REFERRAL_LETTER: "bg-orange-100 text-orange-800",
  INSURANCE_CARD: "bg-teal-100 text-teal-800",
  CONSENT_FORM: "bg-yellow-100 text-yellow-800",
  DISCHARGE_SUMMARY: "bg-red-100 text-red-800",
  OTHER: "bg-gray-100 text-gray-800",
}

export default async function PatientDocumentsPage({
  searchParams,
}: PatientDocumentsPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/patient")
  requirePermission(currentUser.role, "documents:read")

  const { message, error } = await searchParams

  const patientProfile = await db.patientProfile.findUnique({
    where: { userId: currentUser.id },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: { select: { firstName: true, lastName: true } },
        },
      },
    },
  })

  const documents = patientProfile?.documents ?? []

  return (
    <section className="grid gap-6">
      {message && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              My records
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Documents
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your uploaded health documents and records.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No documents on file yet. Your care team will upload documents here
            as needed.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{doc.name}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[doc.category] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {doc.fileType} · {formatFileSize(doc.fileSize)} ·{" "}
                    {new Date(doc.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · Uploaded by {doc.uploadedBy.firstName}{" "}
                    {doc.uploadedBy.lastName}
                  </div>
                  {doc.notes && (
                    <div className="text-xs text-muted-foreground">
                      {doc.notes}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">Open ↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
