function requireValue(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const env = {
  get supabaseUrl() {
    return requireValue(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL"
    )
  },
  get supabasePublishableKey() {
    return requireValue(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    )
  },
  get appUrl() {
    return requireValue(process.env.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL")
  },
}
