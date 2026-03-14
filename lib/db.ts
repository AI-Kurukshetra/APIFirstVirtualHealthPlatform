import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/generated/client'

// Use the pooled connection string for the app (Supabase Transaction pooler: port 6543)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
