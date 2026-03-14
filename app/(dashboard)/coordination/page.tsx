import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function CoordinationPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/coordination")

  return (
    <PagePlaceholder
      description="This placeholder keeps the future care coordination route stable while the MVP 1 work focuses on auth and dashboard foundations."
      eyebrow="Coordination"
      title="Care coordination"
    />
  )
}
