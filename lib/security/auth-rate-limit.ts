import { Prisma } from "@/prisma/generated/client"

import { db } from "@/lib/db"

interface AuthRateLimitInput {
  action: "LOGIN" | "REGISTER" | "PASSWORD_RESET_REQUEST"
  identifier: string
  ipAddress: string | null
  maxAttempts: number
  windowMinutes: number
}

interface AuthRateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
  attempts: number
}

export async function enforceAuthRateLimit({
  action,
  identifier,
  ipAddress,
  maxAttempts,
  windowMinutes,
}: AuthRateLimitInput): Promise<AuthRateLimitResult> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
  const relevantActions = [`${action}_FAILED`, `${action}_RATE_LIMITED`]

  const rows = await db.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count
    FROM audit_logs
    WHERE created_at >= ${windowStart}
      AND action IN (${Prisma.join(relevantActions)})
      AND (
        details ->> 'identifier' = ${identifier}
        ${ipAddress ? Prisma.sql`OR ip_address = ${ipAddress}` : Prisma.empty}
      )
  `)

  const attempts = Number(rows[0]?.count ?? 0)

  return {
    allowed: attempts < maxAttempts,
    retryAfterSeconds: windowMinutes * 60,
    attempts,
  }
}
