import { createClient } from "@supabase/supabase-js"

import { env } from "@/lib/env"

export function hasSupabaseAdminAccess() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}
