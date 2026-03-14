import { PatientSummaryCard } from "@/components/patient/summary-card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface AdminPatientsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminPatientsPage({
  searchParams,
}: AdminPatientsPageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/admin")

  const params = await searchParams
  const query = typeof params.q === "string" ? params.q.trim() : ""

  const where = {
    role: Role.PATIENT,
    ...(query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" as const } },
            { firstName: { contains: query, mode: "insensitive" as const } },
            { lastName: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [patients, totalPatients, completedOnboarding] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        patientProfile: {
          include: {
            allergies: { select: { id: true } },
            medications: { select: { id: true } },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    db.user.count({ where: { role: Role.PATIENT } }),
    db.user.count({
      where: {
        role: Role.PATIENT,
        patientProfile: {
          is: {
            onboardingCompleted: true,
          },
        },
      },
    }),
  ])

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Patients
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          Review onboarding readiness and open full demographic profiles for all
          patient users.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Total patients
            </div>
            <div className="mt-3 text-3xl font-semibold">{totalPatients}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Onboarding complete
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {completedOnboarding}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Pending completion
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {totalPatients - completedOnboarding}
            </div>
          </div>
        </div>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            className="h-11 flex-1 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            defaultValue={query}
            name="q"
            placeholder="Search patient name or email"
            type="search"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="grid gap-4">
        {patients.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-sm">
            No patients matched the current filter.
          </div>
        ) : (
          patients.map((patient) => (
            <PatientSummaryCard
              href={`/admin/patients/${patient.id}`}
              key={patient.id}
              patient={patient}
            />
          ))
        )}
      </div>
    </section>
  )
}
