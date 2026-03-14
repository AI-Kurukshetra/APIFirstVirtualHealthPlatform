import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { updateDiagnosisStatusAction } from "./actions"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface DiagnosesPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ message?: string; error?: string }>
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-blue-100 text-blue-800",
    CHRONIC: "bg-orange-100 text-orange-800",
    RESOLVED: "bg-green-100 text-green-800",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

export default async function DiagnosesPage({
  params,
  searchParams,
}: DiagnosesPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "diagnoses:manage")

  const { id } = await params
  const { message, error } = await searchParams

  const patient = await db.user.findFirst({
    where: { id, role: Role.PATIENT },
    include: {
      patientProfile: {
        include: {
          diagnoses: {
            orderBy: { diagnosedDate: "desc" },
            include: {
              provider: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  })

  if (!patient) notFound()

  const allDiagnoses = patient.patientProfile?.diagnoses ?? []
  const active = allDiagnoses.filter(
    (d) => d.status === "ACTIVE" || d.status === "CHRONIC"
  )
  const resolved = allDiagnoses.filter((d) => d.status === "RESOLVED")

  const redirectTo = `/clinical/patients/${id}/diagnoses`

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
          <Link href={`/clinical/patients/${id}/diagnoses/new`}>
            Add diagnosis
          </Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Diagnoses — {patient.firstName} {patient.lastName}
        </h1>

        {allDiagnoses.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No diagnoses recorded yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-6">
            {active.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Active &amp; Chronic
                </h2>
                <div className="divide-y divide-border rounded-2xl border border-border">
                  {active.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-wrap items-start justify-between gap-3 p-4"
                    >
                      <div className="grid gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-medium">
                            {d.icdCode}
                          </span>
                          <StatusBadge status={d.status} />
                        </div>
                        <div className="text-sm">{d.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Diagnosed{" "}
                          {new Date(d.diagnosedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}{" "}
                          · {d.provider.firstName} {d.provider.lastName}
                        </div>
                        {d.notes && (
                          <div className="text-xs text-muted-foreground">
                            {d.notes}
                          </div>
                        )}
                      </div>
                      <form
                        action={updateDiagnosisStatusAction.bind(
                          null,
                          d.id,
                          "RESOLVED",
                          redirectTo
                        )}
                      >
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                        >
                          Mark resolved
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resolved.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Resolved
                </h2>
                <div className="divide-y divide-border rounded-2xl border border-border">
                  {resolved.map((d) => (
                    <div key={d.id} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {d.icdCode}
                        </span>
                        <StatusBadge status={d.status} />
                      </div>
                      <div className="mt-1 text-sm">{d.description}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Diagnosed{" "}
                        {new Date(d.diagnosedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {d.resolvedDate && (
                          <>
                            {" "}
                            · Resolved{" "}
                            {new Date(d.resolvedDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </>
                        )}{" "}
                        · {d.provider.firstName} {d.provider.lastName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
