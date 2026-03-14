import { Prisma } from "@/prisma/generated/client"

import { headers } from "next/headers"

import { db } from "@/lib/db"

interface AuditPayload {
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  details?: Record<string, unknown> | null
}

export interface RequestMetadata {
  ipAddress: string | null
  userAgent: string | null
}

export async function getRequestMetadata(): Promise<RequestMetadata> {
  const requestHeaders = await headers()
  const forwardedFor = requestHeaders.get("x-forwarded-for")

  return {
    ipAddress: forwardedFor?.split(",")[0]?.trim() ?? null,
    userAgent: requestHeaders.get("user-agent"),
  }
}

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  details,
}: AuditPayload) {
  try {
    const requestMetadata = await getRequestMetadata()

    await db.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        entity,
        entityId: entityId ?? null,
        details: (details ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: requestMetadata.ipAddress,
        userAgent: requestMetadata.userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to create audit log", error)
  }
}
