"use client"

import { useEffect } from "react"

import { createBrowserSupabaseClient } from "@/lib/supabase/client"

const IDLE_TIMEOUT_MS = 15 * 60 * 1000
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"]

export function SessionTimeout() {
  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    let timeout = window.setTimeout(logout, IDLE_TIMEOUT_MS)

    async function logout() {
      await supabase.auth.signOut()
      window.location.assign("/login?message=Your session expired after inactivity.")
    }

    function resetTimeout() {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(logout, IDLE_TIMEOUT_MS)
    }

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimeout, { passive: true })
    })

    return () => {
      window.clearTimeout(timeout)

      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimeout)
      })
    }
  }, [])

  return null
}
