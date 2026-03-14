import { redirect } from "next/navigation"

import { type Role } from "@/prisma/generated/client"

import { type Permission } from "@/lib/auth/permissions"
import { ROLE_PERMISSIONS } from "@/lib/auth/role-permissions"

export function hasPermission(role: Role, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: Role, permissions: Permission[]) {
  return permissions.some((permission) => hasPermission(role, permission))
}

export function hasAllPermissions(role: Role, permissions: Permission[]) {
  return permissions.every((permission) => hasPermission(role, permission))
}

export function getPermissionsForRole(role: Role) {
  return ROLE_PERMISSIONS[role] ?? []
}

export function requirePermission(role: Role, permission: Permission) {
  if (!hasPermission(role, permission)) {
    redirect("/403")
  }
}

export function requireAnyPermission(role: Role, permissions: Permission[]) {
  if (!hasAnyPermission(role, permissions)) {
    redirect("/403")
  }
}
