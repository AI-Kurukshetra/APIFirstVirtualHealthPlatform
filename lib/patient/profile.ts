import { Prisma } from "@/prisma/generated/client"

export interface ParsedAllergyInput {
  allergen: string
  notes?: string
  reaction?: string
  severity: string
}

export interface ParsedMedicationInput {
  dosage?: string
  frequency?: string
  name: string
  prescribedBy?: string
}

function parseLine(value: string) {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
}

export function parseDateInput(value: string) {
  if (!value) {
    return null
  }

  const parsed = new Date(`${value}T00:00:00`)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDateInput(value: Date | null | undefined) {
  if (!value) {
    return ""
  }

  return value.toISOString().slice(0, 10)
}

export function parseAllergyLines(value: string): ParsedAllergyInput[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [allergen = "", severity = "mild", reaction = "", notes = ""] =
        parseLine(line)

      return {
        allergen,
        notes: notes || undefined,
        reaction: reaction || undefined,
        severity: severity.toLowerCase(),
      }
    })
    .filter((item) => item.allergen)
}

export function parseMedicationLines(value: string): ParsedMedicationInput[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", dosage = "", frequency = "", prescribedBy = ""] =
        parseLine(line)

      return {
        dosage: dosage || undefined,
        frequency: frequency || undefined,
        name,
        prescribedBy: prescribedBy || undefined,
      }
    })
    .filter((item) => item.name)
}

export function stringifyAllergies(
  allergies: Array<{
    allergen: string
    notes: string | null
    reaction: string | null
    severity: string
  }>
) {
  return allergies
    .map((allergy) =>
      [
        allergy.allergen,
        allergy.severity,
        allergy.reaction ?? "",
        allergy.notes ?? "",
      ]
        .filter(Boolean)
        .join(" | ")
    )
    .join("\n")
}

export function stringifyMedications(
  medications: Array<{
    dosage: string | null
    frequency: string | null
    name: string
    prescribedBy: string | null
  }>
) {
  return medications
    .map((medication) =>
      [
        medication.name,
        medication.dosage ?? "",
        medication.frequency ?? "",
        medication.prescribedBy ?? "",
      ]
        .filter(Boolean)
        .join(" | ")
    )
    .join("\n")
}

export function buildJsonField(input: Record<string, string>) {
  const entries = Object.entries(input).filter(([, value]) => value.trim())

  if (entries.length === 0) {
    return Prisma.JsonNull
  }

  return Object.fromEntries(entries) as Prisma.InputJsonObject
}

export function readJsonField(
  value: Prisma.JsonValue | null | undefined,
  key: string
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return ""
  }

  const record = value as Record<string, unknown>
  const field = record[key]

  return typeof field === "string" ? field : ""
}

export function calculateAge(dateOfBirth: Date | null | undefined) {
  if (!dateOfBirth) {
    return null
  }

  const now = new Date()
  let age = now.getFullYear() - dateOfBirth.getFullYear()
  const monthDifference = now.getMonth() - dateOfBirth.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && now.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1
  }

  return age
}

export function formatJsonSummary(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "Not provided"
  }

  const record = value as Record<string, unknown>
  const parts = Object.values(record).filter(
    (entry): entry is string => typeof entry === "string" && Boolean(entry.trim())
  )

  return parts.length > 0 ? parts.join(", ") : "Not provided"
}

export function getPatientProfileCompleteness(input: {
  allergiesCount: number
  dateOfBirth: Date | null | undefined
  emergencyContact: Prisma.JsonValue | null | undefined
  medicationsCount: number
  address: Prisma.JsonValue | null | undefined
  gender: string | null | undefined
}) {
  const checkpoints = [
    Boolean(input.dateOfBirth),
    Boolean(input.gender),
    formatJsonSummary(input.address) !== "Not provided",
    formatJsonSummary(input.emergencyContact) !== "Not provided",
    input.allergiesCount > 0,
    input.medicationsCount > 0,
  ]

  const completed = checkpoints.filter(Boolean).length

  return Math.round((completed / checkpoints.length) * 100)
}
