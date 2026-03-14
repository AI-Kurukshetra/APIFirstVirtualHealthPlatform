import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { formatBP } from "@/lib/ehr/vitals"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface VitalsPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ message?: string; error?: string }>
}

export default async function VitalsPage({
  params,
  searchParams,
}: VitalsPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "vitals:read")

  const { id } = await params
  const { message, error } = await searchParams

  const patient = await db.user.findFirst({
    where: { id, role: Role.PATIENT },
    include: {
      patientProfile: {
        include: {
          vitalSigns: {
            orderBy: { recordedAt: "desc" },
            include: { recordedBy: { select: { firstName: true, lastName: true } } },
          },
        },
      },
    },
  })

  if (!patient) notFound()

  const vitals = patient.patientProfile?.vitalSigns ?? []
  const latest = vitals[0] ?? null

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
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/clinical/patients/${id}`}>
              ← Back to {patient.firstName} {patient.lastName}
            </Link>
          </Button>
        </div>
        <Button asChild>
          <Link href={`/clinical/patients/${id}/vitals/new`}>Record vitals</Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Vitals — {patient.firstName} {patient.lastName}
        </h1>

        {latest ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Blood pressure
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {formatBP(latest.systolicBP, latest.diastolicBP)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">mmHg</div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Heart rate
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {latest.heartRate ?? "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">bpm</div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Temperature
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {latest.temperature ?? "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">°F</div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                O₂ saturation
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {latest.oxygenSaturation != null
                  ? `${latest.oxygenSaturation}%`
                  : "—"}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Weight
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {latest.weight ?? "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">kg</div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                BMI
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {latest.bmi ?? "—"}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">All readings</h2>

        {vitals.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No vitals recorded yet. Use the button above to record the first
            reading.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">BP (mmHg)</th>
                  <th className="pb-3 pr-4 font-medium">HR (bpm)</th>
                  <th className="pb-3 pr-4 font-medium">Temp (°F)</th>
                  <th className="pb-3 pr-4 font-medium">Weight (kg)</th>
                  <th className="pb-3 pr-4 font-medium">O₂ sat</th>
                  <th className="pb-3 font-medium">Recorded by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vitals.map((v) => (
                  <tr key={v.id} className="py-3">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(v.recordedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 pr-4 font-medium">
                      {formatBP(v.systolicBP, v.diastolicBP)}
                    </td>
                    <td className="py-3 pr-4">{v.heartRate ?? "—"}</td>
                    <td className="py-3 pr-4">{v.temperature ?? "—"}</td>
                    <td className="py-3 pr-4">{v.weight ?? "—"}</td>
                    <td className="py-3 pr-4">
                      {v.oxygenSaturation != null
                        ? `${v.oxygenSaturation}%`
                        : "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {v.recordedBy.firstName} {v.recordedBy.lastName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
