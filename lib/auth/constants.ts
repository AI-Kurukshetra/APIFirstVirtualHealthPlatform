export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const

export const PROTECTED_ROUTE_PREFIXES = [
  "/admin",
  "/clinical",
  "/coordination",
  "/front-desk",
  "/patient",
  "/scheduling",
  "/analytics",
  "/consent",
  "/labs",
  "/prescriptions",
  "/workflows",
] as const
