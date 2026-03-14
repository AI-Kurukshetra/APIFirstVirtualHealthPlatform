import { type Permission } from "@/lib/auth/permissions"

export type NavIcon =
  | "shield"
  | "users"
  | "layout"
  | "calendar"
  | "file-text"
  | "message-square"
  | "heart"
  | "send"
  | "wallet"
  | "pill"
  | "test-tube"
  | "bar-chart"
  | "workflow"
  | "settings"

export interface NavItem {
  label: string
  href: string
  icon: NavIcon
  requiredPermission: Permission
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Admin",
    href: "/admin",
    icon: "shield",
    requiredPermission: "users:read",
  },
  {
    label: "Dashboard",
    href: "/clinical",
    icon: "layout",
    requiredPermission: "patients:read",
  },
  {
    label: "Patient Directory",
    href: "/clinical/patients",
    icon: "users",
    requiredPermission: "patients:read",
  },
  {
    label: "Schedule",
    href: "/scheduling/calendar",
    icon: "calendar",
    requiredPermission: "appointments:read",
  },
  {
    label: "My Dashboard",
    href: "/patient",
    icon: "layout",
    requiredPermission: "patients:read_own",
  },
  {
    label: "Appointments",
    href: "/patient/appointments",
    icon: "calendar",
    requiredPermission: "appointments:read_own",
  },
  {
    label: "My Records",
    href: "/patient/records",
    icon: "file-text",
    requiredPermission: "patients:read_own",
  },
  {
    label: "Messages",
    href: "/patient/messages",
    icon: "message-square",
    requiredPermission: "messages:read",
  },
  {
    label: "Coordination",
    href: "/coordination",
    icon: "heart",
    requiredPermission: "careplans:create",
  },
  {
    label: "Front Desk",
    href: "/front-desk",
    icon: "wallet",
    requiredPermission: "appointments:create",
  },
  {
    label: "Settings",
    href: "/patient/settings",
    icon: "settings",
    requiredPermission: "settings:manage_own",
  },
]
