import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { formatFileSize } from "@/lib/ehr/vitals"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface DocumentsPageProps {
  params: Promise<{ id: string }>
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

export default async function DocumentsPage({
  params,
  searchParams,
}: DocumentsPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "documents:read")

  const { id } = await params
  const { message, error } = await searchParams

  const patient = await db.user.findFirst({
    where: { id, role: Role.PATIENT },
    include: {
      patientProfile: {
        include: {
          documents: {
            orderBy: { createdAt: "desc" },
            include: {
              uploadedBy: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  })

  if (!patient) notFound()

  const documents = patient.patientProfile?.documents ?? []

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/clinical/patients/${id}`}>
            ← Back to {patient.firstName} {patient.lastName}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/clinical/patients/${id}/documents/upload`}>
            Upload document
          </Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Documents — {patient.firstName} {patient.lastName}
        </h1>

        {documents.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="mt-5 divide-y divide-border rounded-2xl border border-border">
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
                    · {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
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
