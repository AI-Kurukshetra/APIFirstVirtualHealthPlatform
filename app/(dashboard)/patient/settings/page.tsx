import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function PatientSettingsPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/settings")

  return (
    <PagePlaceholder
      description="Settings and preference management will expand with profile management and notification controls in later phases."
      eyebrow="Settings"
      title="Account settings"
    />
  )
}
