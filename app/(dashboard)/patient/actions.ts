"use server"

import { Prisma } from "@/prisma/generated/client"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import {
  buildJsonField,
  parseAllergyLines,
  parseDateInput,
  parseMedicationLines,
} from "@/lib/patient/profile"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function getSafeRedirectPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : null
}

function buildUrl(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://localhost")

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const query = url.searchParams.toString()

  return `${url.pathname}${query ? `?${query}` : ""}`
}

interface PatientProfileInput {
  address: Prisma.InputJsonValue | typeof Prisma.JsonNull
  bloodType: string | null
  dateOfBirth: Date | null
  emergencyContact: Prisma.InputJsonValue | typeof Prisma.JsonNull
  gender: string | null
  onboardingCompleted: boolean
}

async function upsertPatientProfile(userId: string, data: PatientProfileInput) {
  return db.patientProfile.upsert({
    where: { userId },
    update: data,
    create: {
      ...data,
      userId,
    },
  })
}

async function replaceMedicalBasics(
  patientProfileId: string,
  allergiesText: string,
  medicationsText: string
) {
  const allergies = parseAllergyLines(allergiesText)
  const medications = parseMedicationLines(medicationsText)

  await db.$transaction([
    db.allergy.deleteMany({
      where: { patientId: patientProfileId },
    }),
    db.medication.deleteMany({
      where: { patientId: patientProfileId },
    }),
    ...(allergies.length > 0
      ? [
          db.allergy.createMany({
            data: allergies.map((allergy) => ({
              allergen: allergy.allergen,
              notes: allergy.notes ?? null,
              patientId: patientProfileId,
              reaction: allergy.reaction ?? null,
              severity: allergy.severity,
            })),
          }),
        ]
      : []),
    ...(medications.length > 0
      ? [
          db.medication.createMany({
            data: medications.map((medication) => ({
              dosage: medication.dosage ?? null,
              frequency: medication.frequency ?? null,
              isActive: true,
              name: medication.name,
              patientId: patientProfileId,
              prescribedBy: medication.prescribedBy ?? null,
            })),
          }),
        ]
      : []),
  ])
}

export async function savePatientOnboardingStepAction(formData: FormData) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/onboarding")

  const step = Number(getString(formData, "step") || "1")
  const skip = getString(formData, "skip") === "1"

  if (step === 1) {
    const dateOfBirth = parseDateInput(getString(formData, "dateOfBirth"))
    const gender = getString(formData, "gender")
    const bloodType = getString(formData, "bloodType")
    const phone = getString(formData, "phone")
    const address = buildJsonField({
      city: getString(formData, "city"),
      country: getString(formData, "country"),
      line1: getString(formData, "line1"),
      line2: getString(formData, "line2"),
      postalCode: getString(formData, "postalCode"),
      state: getString(formData, "state"),
    })

    await db.$transaction(async (tx) => {
      await tx.patientProfile.upsert({
        where: { userId: user.id },
        update: {
          address,
          bloodType: bloodType || null,
          dateOfBirth,
          emergencyContact: Prisma.JsonNull,
          gender: gender || null,
          onboardingCompleted: false,
        },
        create: {
          address,
          bloodType: bloodType || null,
          dateOfBirth,
          emergencyContact: Prisma.JsonNull,
          gender: gender || null,
          onboardingCompleted: false,
          userId: user.id,
        },
      })

      await tx.user.update({
        where: { id: user.id },
        data: {
          phone: phone || null,
        },
      })
    })

    redirect("/patient/onboarding?step=2")
  }

  const profile = await db.patientProfile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) {
    redirect(
      buildUrl("/patient/onboarding", {
        error: "Complete personal information before moving forward.",
      })
    )
  }

  if (step === 2) {
    await db.patientProfile.update({
      where: { id: profile.id },
      data: {
        emergencyContact: skip
          ? Prisma.JsonNull
          : buildJsonField({
              name: getString(formData, "emergencyName"),
              phone: getString(formData, "emergencyPhone"),
              relationship: getString(formData, "emergencyRelationship"),
            }),
      },
    })

    redirect("/patient/onboarding?step=3")
  }

  if (!skip) {
    await replaceMedicalBasics(
      profile.id,
      getString(formData, "allergies"),
      getString(formData, "medications")
    )
  }

  await db.patientProfile.update({
    where: { id: profile.id },
    data: {
      onboardingCompleted: true,
    },
  })

  await logAudit({
    action: "PATIENT_ONBOARDING_COMPLETED",
    entity: "PatientProfile",
    entityId: profile.id,
    userId: user.id,
  })

  redirect("/patient/onboarding/complete")
}

export async function updatePatientProfileAction(formData: FormData) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/profile")

  const redirectTo =
    getSafeRedirectPath(getString(formData, "redirectTo")) ??
    "/patient/profile/edit"
  const dateOfBirth = parseDateInput(getString(formData, "dateOfBirth"))
  const gender = getString(formData, "gender")
  const bloodType = getString(formData, "bloodType")
  const phone = getString(formData, "phone")
  const allergies = getString(formData, "allergies")
  const medications = getString(formData, "medications")

  const profile = await upsertPatientProfile(user.id, {
    address: buildJsonField({
      city: getString(formData, "city"),
      country: getString(formData, "country"),
      line1: getString(formData, "line1"),
      line2: getString(formData, "line2"),
      postalCode: getString(formData, "postalCode"),
      state: getString(formData, "state"),
    }),
    bloodType: bloodType || null,
    dateOfBirth,
    emergencyContact: buildJsonField({
      name: getString(formData, "emergencyName"),
      phone: getString(formData, "emergencyPhone"),
      relationship: getString(formData, "emergencyRelationship"),
    }),
    gender: gender || null,
    onboardingCompleted: true,
  })

  await db.user.update({
    where: { id: user.id },
    data: {
      phone: phone || null,
    },
  })

  await replaceMedicalBasics(profile.id, allergies, medications)

  await logAudit({
    action: "PATIENT_PROFILE_UPDATED",
    entity: "PatientProfile",
    entityId: profile.id,
    userId: user.id,
  })

  redirect(
    buildUrl(redirectTo, {
      message: "Patient profile saved.",
    })
  )
}
