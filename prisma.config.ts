import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join(import.meta.dirname, 'prisma/schema.prisma'),
  // Use the direct (non-pooled) Supabase URL for CLI commands (migrations, introspection)
  // DATABASE_URL_DIRECT = postgres://...@db.<project>.supabase.co:5432/postgres
  datasource: {
    url: process.env.DATABASE_URL_DIRECT!,
  },
})
