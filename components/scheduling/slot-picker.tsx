"use client"

import { useState, useEffect, useTransition, useRef } from "react"

import { formatInTimeZone } from "date-fns-tz"

import type { TimeSlot } from "@/lib/scheduling/slots"

interface Provider {
  id: string
  label: string // "Dr. Jane Smith — Cardiology"
}

interface Patient {
  id: string
  label: string // "Jane Doe"
  timezone: string // IANA timezone
}

interface SlotPickerProps {
  providers: Provider[]
  defaultProviderId?: string

  // ── Staff / admin mode: show patient selector ──
  patients?: Patient[]
  defaultPatientId?: string

  // ── Patient self-booking mode: skip patient selector ──
  // When provided, the component operates as a single-patient picker.
  selfPatientId?: string
  selfTimezone?: string // patient's own IANA timezone
}

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90 min" },
]

/** Returns today's date as "YYYY-MM-DD" */
function todayStr() {
  return new Date().toISOString().split("T")[0]
}

/** Returns "YYYY-MM-DD" 90 days from now */
function maxDateStr() {
  const d = new Date()
  d.setDate(d.getDate() + 90)
  return d.toISOString().split("T")[0]
}

export function SlotPicker({
  providers,
  defaultProviderId = "",
  patients,
  defaultPatientId = "",
  selfPatientId,
  selfTimezone = "UTC",
}: SlotPickerProps) {
  const isSelfMode = !!selfPatientId

  const [providerId, setProviderId] = useState(defaultProviderId)
  const [patientId, setPatientId] = useState(
    isSelfMode ? selfPatientId : defaultPatientId
  )
  const [date, setDate] = useState("")
  const [durationMin, setDurationMin] = useState(30)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [slots, setSlots] = useState<TimeSlot[] | null>(null)
  const [viewerTimezone, setViewerTimezone] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Track the last fetch so stale responses don't overwrite newer ones
  const fetchIdRef = useRef(0)

  // Re-fetch whenever provider, patient, date, or duration changes
  useEffect(() => {
    setSelectedSlot(null)
    setSlots(null)
    setViewerTimezone(null)
    setFetchError(null)

    const hasPatient = isSelfMode ? true : !!patientId
    if (!providerId || !hasPatient || !date) return

    const patientTz = isSelfMode
      ? selfTimezone
      : (patients?.find((p) => p.id === patientId)?.timezone ?? "UTC")

    const fetchId = ++fetchIdRef.current

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/scheduling/slots?providerId=${encodeURIComponent(providerId)}&date=${encodeURIComponent(date)}&duration=${durationMin}&viewerTimezone=${encodeURIComponent(patientTz)}`
        )
        const json = await res.json()

        if (fetchId !== fetchIdRef.current) return // stale

        if (!res.ok) {
          setFetchError(json.error ?? "Failed to load slots.")
          setSlots([])
        } else {
          setSlots(json.slots ?? [])
          setViewerTimezone(json.viewerTimezone ?? null)
        }
      } catch {
        if (fetchId !== fetchIdRef.current) return
        setFetchError("Network error. Please try again.")
        setSlots([])
      }
    })
  }, [providerId, patientId, date, durationMin, isSelfMode, selfTimezone, patients])

  const inputCls =
    "rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary w-full"

  const timezoneLabel = isSelfMode ? "your" : "patient's"

  return (
    <div className="grid gap-5">
      {/* ── Patient (staff/admin mode only) ── */}
      {isSelfMode ? (
        <input type="hidden" name="patientUserId" value={selfPatientId} />
      ) : (
        <div className="grid gap-1.5">
          <label htmlFor="patientUserId" className="text-sm font-medium">
            Patient <span className="text-destructive">*</span>
          </label>
          <select
            id="patientUserId"
            name="patientUserId"
            required
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value)
              setSelectedSlot(null)
            }}
            className={inputCls}
          >
            <option value="" disabled>
              Select a patient
            </option>
            {(patients ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Provider ── */}
      <div className="grid gap-1.5">
        <label htmlFor="providerUserId" className="text-sm font-medium">
          Provider <span className="text-destructive">*</span>
        </label>
        <select
          id="providerUserId"
          name="providerUserId"
          required
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          className={inputCls}
        >
          <option value="" disabled>
            Select a provider
          </option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Duration ── */}
      <div className="grid gap-1.5">
        <label htmlFor="durationSelect" className="text-sm font-medium">
          Duration
        </label>
        <select
          id="durationSelect"
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value))}
          className={inputCls}
        >
          {DURATION_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Date ── */}
      <div className="grid gap-1.5">
        <label htmlFor="dateInput" className="text-sm font-medium">
          Date <span className="text-destructive">*</span>
        </label>
        <input
          id="dateInput"
          type="date"
          min={todayStr()}
          max={maxDateStr()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
          required
        />
      </div>

      {/* ── Slot grid ── */}
      {providerId && (isSelfMode || patientId) && date && (
        <div className="grid gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium">
              Available slots
              {isPending && (
                <span className="ml-2 text-xs text-muted-foreground">
                  Loading…
                </span>
              )}
            </p>
            {viewerTimezone && !isPending && slots && slots.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Times shown in {timezoneLabel} timezone:{" "}
                <span className="font-medium text-foreground">
                  {formatInTimeZone(new Date(), viewerTimezone, "zzz")}{" "}
                  ({viewerTimezone})
                </span>
              </p>
            )}
          </div>

          {fetchError && (
            <p className="text-sm text-destructive">{fetchError}</p>
          )}

          {!isPending && slots !== null && slots.length === 0 && !fetchError && (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No available slots on this date.
              <br />
              <span className="text-xs">
                The provider may be off, fully booked, or hasn&apos;t set up availability yet.
              </span>
            </div>
          )}

          {slots && slots.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => setSelectedSlot(isSelected ? null : slot)}
                    className={[
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary hover:bg-primary/5",
                    ].join(" ")}
                  >
                    {slot.label.split(" – ")[0]}
                    <span className="block text-xs font-normal opacity-70">
                      – {slot.label.split(" – ")[1]}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-1 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Selected: <strong>{selectedSlot.label}</strong> ({durationMin} min)
              {viewerTimezone && (
                <span className="ml-1 text-green-600">
                  · {formatInTimeZone(new Date(), viewerTimezone, "zzz")}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Hidden inputs submitted with the form ── */}
      <input
        type="hidden"
        name="scheduledStart"
        value={selectedSlot?.start ?? ""}
        required
      />
      <input
        type="hidden"
        name="durationMin"
        value={selectedSlot ? String(durationMin) : ""}
      />

      {/* Slot required hint */}
      {providerId && (isSelfMode || patientId) && date && !isPending && slots !== null && slots.length > 0 && !selectedSlot && (
        <p className="text-xs text-muted-foreground">
          Please select a time slot above before booking.
        </p>
      )}
    </div>
  )
}
