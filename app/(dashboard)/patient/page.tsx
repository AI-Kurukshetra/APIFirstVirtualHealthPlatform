import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function PatientDashboardPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient")

  return (
    <PagePlaceholder
      description="Patients land in a self-service workspace with protected routes already scoped to their own permissions."
      eyebrow="Patient"
      title="Patient dashboard"
    />
  )
}
