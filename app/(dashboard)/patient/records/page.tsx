import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function PatientRecordsPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/records")

  return (
    <PagePlaceholder
      description="Patient-facing record access will be added once the provider-side EHR workflows are in place."
      eyebrow="Patient"
      title="Medical records"
    />
  )
}
