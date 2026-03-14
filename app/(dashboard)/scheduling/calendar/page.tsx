import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function SchedulingCalendarPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/scheduling/calendar")

  return (
    <PagePlaceholder
      description="Scheduling and availability controls will be implemented in Phase 4 on top of the existing appointment schema."
      eyebrow="Scheduling"
      title="Calendar"
    />
  )
}
