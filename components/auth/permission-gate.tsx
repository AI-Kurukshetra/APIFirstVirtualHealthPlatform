import { type Role } from "@/prisma/generated/client"

import { hasPermission } from "@/lib/auth/guards"
import { type Permission } from "@/lib/auth/permissions"

interface PermissionGateProps {
  role: Role
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({
  role,
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  if (!hasPermission(role, permission)) {
    return fallback
  }

  return children
}
