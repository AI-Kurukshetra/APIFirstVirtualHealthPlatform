import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function ClinicalPatientsPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/clinical/patients")

  return (
    <PagePlaceholder
      description="Patient lists and detail views arrive in Phase 2, then become the anchor for notes, vitals, and records in Phase 3."
      eyebrow="Clinical"
      title="Patients"
    />
  )
}
