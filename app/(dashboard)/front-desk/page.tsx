import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function FrontDeskPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/front-desk")

  return (
    <PagePlaceholder
      description="Front-desk scheduling, insurance, and billing flows will be layered in as MVP 2 features."
      eyebrow="Front Desk"
      title="Front-desk operations"
    />
  )
}
