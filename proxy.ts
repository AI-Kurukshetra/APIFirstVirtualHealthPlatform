import { type NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { AUTH_ROUTES, PROTECTED_ROUTE_PREFIXES } from "@/lib/auth/constants"
import { updateSession } from "@/lib/supabase/middleware"

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export async function proxy(request: NextRequest) {
  const { supabase, response } = updateSession(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES)
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTE_PREFIXES)

  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)

    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
