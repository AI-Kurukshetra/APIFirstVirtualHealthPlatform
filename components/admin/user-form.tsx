import { type Role } from "@/prisma/generated/client"

import { SubmitButton } from "@/components/auth/submit-button"
import { getRoleLabel } from "@/lib/auth/session"

const inputClassName =
  "h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"

interface UserFormProps {
  action: (formData: FormData) => void | Promise<void>
  allowedRoles: Role[]
  error?: string
  initialValues?: {
    email: string
    firstName: string
    isActive: boolean
    lastName: string
    role: Role
  }
  redirectTo: string
  submitLabel: string
}

export function UserForm({
  action,
  allowedRoles,
  error,
  initialValues,
  redirectTo,
  submitLabel,
}: UserFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          First name
          <input
            className={inputClassName}
            defaultValue={initialValues?.firstName ?? ""}
            name="firstName"
            required
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Last name
          <input
            className={inputClassName}
            defaultValue={initialValues?.lastName ?? ""}
            name="lastName"
            required
            type="text"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Email
        <input
          className={inputClassName}
          defaultValue={initialValues?.email ?? ""}
          name="email"
          required
          type="email"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Role
        <select
          className={inputClassName}
          defaultValue={initialValues?.role ?? allowedRoles[0]}
          name="role"
          required
        >
          {allowedRoles.map((role) => (
            <option key={role} value={role}>
              {getRoleLabel(role)}
            </option>
          ))}
        </select>
      </label>

      {initialValues ? (
        <label className="grid gap-2 text-sm font-medium">
          Account status
          <select
            className={inputClassName}
            defaultValue={initialValues.isActive ? "active" : "inactive"}
            name="status"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  )
}
