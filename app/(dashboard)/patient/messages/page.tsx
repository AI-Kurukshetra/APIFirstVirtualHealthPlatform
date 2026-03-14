import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function PatientMessagesPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/messages")

  return (
    <PagePlaceholder
      description="Basic patient-provider messaging is reserved for Phase 6, with richer attachments and preferences in Phase 7."
      eyebrow="Patient"
      title="Messages"
    />
  )
}
