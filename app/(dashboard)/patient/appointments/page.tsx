import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function PatientAppointmentsPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/appointments")

  return (
    <PagePlaceholder
      description="Self-service appointment management is planned for Phase 6 and will build on the appointment lifecycle delivered in Phase 4."
      eyebrow="Patient"
      title="Appointments"
    />
  )
}
