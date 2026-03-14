import { type Role } from "@/prisma/generated/client"

import { hasAnyPermission } from "@/lib/auth/guards"
import { type Permission } from "@/lib/auth/permissions"

export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  "/admin": ["users:read"],
  "/admin/users": ["users:read"],
  "/admin/audit-logs": ["audit:read"],
  "/admin/settings": ["system:configure"],
  "/clinical": ["patients:read"],
  "/clinical/patients": ["patients:read"],
  "/clinical/notes": ["notes:create"],
  "/clinical/vitals": ["vitals:create"],
  "/clinical/documents": ["documents:read"],
  "/scheduling": ["appointments:read"],
  "/scheduling/calendar": ["appointments:read"],
  "/scheduling/manage": ["schedule:manage"],
  "/patient": ["patients:read_own"],
  "/patient/records": ["patients:read_own"],
  "/patient/appointments": ["appointments:read_own"],
  "/patient/messages": ["messages:read"],
  "/patient/settings": ["settings:manage_own"],
  "/coordination": ["careplans:create"],
  "/coordination/care-plans": ["careplans:manage"],
  "/coordination/referrals": ["referrals:manage"],
  "/front-desk": ["appointments:create"],
  "/front-desk/billing": ["invoices:create"],
  "/front-desk/insurance": ["insurance:verify"],
  "/prescriptions": ["prescriptions:create"],
  "/labs": ["labs:order"],
  "/analytics": ["analytics:view"],
  "/workflows": ["workflows:manage"],
  "/consent": ["consent_templates:manage"],
}

export function getRequiredPermissionsForPath(pathname: string) {
  const matchedPrefix = Object.keys(ROUTE_PERMISSIONS)
    .sort((left, right) => right.length - left.length)
    .find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

  return matchedPrefix ? ROUTE_PERMISSIONS[matchedPrefix] : null
}

export function canAccessPath(role: Role, pathname: string) {
  const requiredPermissions = getRequiredPermissionsForPath(pathname)

  if (!requiredPermissions) {
    return true
  }

  return hasAnyPermission(role, requiredPermissions)
}
