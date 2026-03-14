import { Role, type Prisma } from "@/prisma/generated/client"

export const ADMIN_USER_PAGE_SIZE = 12

export const USER_STATUS_FILTERS = ["all", "active", "inactive"] as const

export type UserStatusFilter = (typeof USER_STATUS_FILTERS)[number]

export const ADMIN_INVITE_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROVIDER,
  Role.NURSE,
  Role.CARE_COORDINATOR,
  Role.STAFF,
  Role.PATIENT,
]

export const SUPER_ADMIN_INVITE_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROVIDER,
  Role.NURSE,
  Role.CARE_COORDINATOR,
  Role.STAFF,
  Role.PATIENT,
] as const

export function parseRoleFilter(value: string | undefined) {
  if (!value) {
    return undefined
  }

  return Object.values(Role).includes(value as Role) ? (value as Role) : undefined
}

export function parseStatusFilter(value: string | undefined): UserStatusFilter {
  return USER_STATUS_FILTERS.includes(value as UserStatusFilter)
    ? (value as UserStatusFilter)
    : "all"
}

export function getInvitableRoles(actorRole: Role) {
  return actorRole === Role.SUPER_ADMIN
    ? [...SUPER_ADMIN_INVITE_ROLES]
    : [...ADMIN_INVITE_ROLES]
}

export function canManageRole(actorRole: Role, targetRole: Role) {
  return getInvitableRoles(actorRole).includes(targetRole)
}

export function buildUserManagementWhere(input: {
  query: string
  role?: Role
  status: UserStatusFilter
}): Prisma.UserWhereInput | undefined {
  const and: Prisma.UserWhereInput[] = []

  if (input.query) {
    and.push({
      OR: [
        { email: { contains: input.query, mode: "insensitive" } },
        { firstName: { contains: input.query, mode: "insensitive" } },
        { lastName: { contains: input.query, mode: "insensitive" } },
      ],
    })
  }

  if (input.role) {
    and.push({ role: input.role })
  }

  if (input.status === "active") {
    and.push({ isActive: true })
  }

  if (input.status === "inactive") {
    and.push({ isActive: false })
  }

  return and.length > 0 ? { AND: and } : undefined
}
