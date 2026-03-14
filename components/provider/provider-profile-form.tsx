import { SubmitButton } from "@/components/auth/submit-button"
import { TimezoneCombobox } from "@/components/ui/timezone-combobox"

const inputClassName =
  "h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"

const textAreaClassName =
  "min-h-28 rounded-2xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"

interface ProviderProfileFormProps {
  action: (formData: FormData) => void | Promise<void>
  error?: string
  initialValues?: {
    acceptingNew: boolean
    avatarUrl: string
    bio: string
    education: string
    languages: string
    licenseNumber: string
    licenseState: string
    npiNumber: string
    specialty: string
    timezone: string
    title: string
  }
  redirectTo: string
  submitLabel: string
}

export function ProviderProfileForm({
  action,
  error,
  initialValues,
  redirectTo,
  submitLabel,
}: ProviderProfileFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <input name="redirectTo" type="hidden" value={redirectTo} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Professional title
          <input
            className={inputClassName}
            defaultValue={initialValues?.title ?? ""}
            name="title"
            placeholder="MD, DO, NP, RN"
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          NPI number
          <input
            className={inputClassName}
            defaultValue={initialValues?.npiNumber ?? ""}
            name="npiNumber"
            placeholder="1234567890"
            type="text"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Specialties
        <textarea
          className={textAreaClassName}
          defaultValue={initialValues?.specialty ?? ""}
          name="specialty"
          placeholder="Cardiology, Internal Medicine"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          License number
          <input
            className={inputClassName}
            defaultValue={initialValues?.licenseNumber ?? ""}
            name="licenseNumber"
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          License state
          <input
            className={inputClassName}
            defaultValue={initialValues?.licenseState ?? ""}
            name="licenseState"
            placeholder="CA"
            type="text"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Languages
        <textarea
          className={textAreaClassName}
          defaultValue={initialValues?.languages ?? ""}
          name="languages"
          placeholder="English, Spanish"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Education
        <textarea
          className={textAreaClassName}
          defaultValue={initialValues?.education ?? ""}
          name="education"
          placeholder="Short credentials or training summary"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Biography
        <textarea
          className={textAreaClassName}
          defaultValue={initialValues?.bio ?? ""}
          name="bio"
          placeholder="Clinical focus, care philosophy, and experience"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Profile photo URL
        <input
          className={inputClassName}
          defaultValue={initialValues?.avatarUrl ?? ""}
          name="avatarUrl"
          placeholder="https://..."
          type="url"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Timezone
        <TimezoneCombobox
          defaultValue={initialValues?.timezone ?? "UTC"}
          name="timezone"
        />
        <span className="text-xs text-muted-foreground">
          Your schedule times are interpreted in this timezone.
        </span>
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium">
        <input
          defaultChecked={initialValues?.acceptingNew ?? true}
          name="acceptingNew"
          type="checkbox"
        />
        Accepting new patients
      </label>

      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  )
}
