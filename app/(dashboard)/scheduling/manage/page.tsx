import Link from "next/link"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import {
  addTimeOffAction,
  deleteTimeOffAction,
  saveWeeklyScheduleAction,
} from "./actions"

export const dynamic = "force-dynamic"

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

interface PageProps {
  searchParams: Promise<{ message?: string; error?: string }>
}

export default async function ScheduleManagePage({ searchParams }: PageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/scheduling/manage")
  requirePermission(user.role, "schedule:manage")

  const { message, error } = await searchParams

  const [schedules, timeOffs] = await Promise.all([
    db.providerSchedule.findMany({
      where: { providerId: user.id },
      orderBy: { dayOfWeek: "asc" },
    }),
    db.providerTimeOff.findMany({
      where: {
        providerId: user.id,
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
    }),
  ])

  const scheduleByDay = new Map(schedules.map((s) => [s.dayOfWeek, s]))

  return (
    <section className="grid gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/scheduling/calendar">← Back to calendar</Link>
        </Button>
      </div>

      {message && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Weekly availability */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Weekly availability</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the days and hours you are available for appointments.
        </p>

        <form action={saveWeeklyScheduleAction} className="mt-6 grid gap-3">
          {DAYS.map((day, index) => {
            const existing = scheduleByDay.get(index)
            const isActive = !!existing?.isActive

            return (
              <div
                key={index}
                className="grid items-center gap-3 rounded-2xl border border-border p-4 sm:grid-cols-[160px_1fr_1fr_120px]"
              >
                {/* Day toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`day_${index}_active`}
                    name={`day_${index}_active`}
                    defaultChecked={isActive}
                    className="size-4 rounded"
                  />
                  <label
                    htmlFor={`day_${index}_active`}
                    className="text-sm font-medium"
                  >
                    {day}
                  </label>
                </div>

                {/* Start time */}
                <div className="grid gap-1">
                  <label
                    htmlFor={`day_${index}_start`}
                    className="text-xs text-muted-foreground"
                  >
                    Start
                  </label>
                  <input
                    id={`day_${index}_start`}
                    name={`day_${index}_start`}
                    type="time"
                    defaultValue={existing?.startTime ?? "09:00"}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* End time */}
                <div className="grid gap-1">
                  <label
                    htmlFor={`day_${index}_end`}
                    className="text-xs text-muted-foreground"
                  >
                    End
                  </label>
                  <input
                    id={`day_${index}_end`}
                    name={`day_${index}_end`}
                    type="time"
                    defaultValue={existing?.endTime ?? "17:00"}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Slot duration */}
                <div className="grid gap-1">
                  <label
                    htmlFor={`day_${index}_duration`}
                    className="text-xs text-muted-foreground"
                  >
                    Slot (min)
                  </label>
                  <select
                    id={`day_${index}_duration`}
                    name={`day_${index}_duration`}
                    defaultValue={existing?.slotDuration ?? 30}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[15, 20, 30, 45, 60].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}

          <div className="mt-2">
            <Button type="submit">Save availability</Button>
          </div>
        </form>
      </div>

      {/* Time off */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Upcoming time off</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Block out dates when you are unavailable.
        </p>

        {timeOffs.length > 0 ? (
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {timeOffs.map((to) => {
              const deleteAction = deleteTimeOffAction.bind(null, to.id)
              return (
                <div
                  key={to.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {to.startDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      –{" "}
                      {to.endDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {to.reason && (
                      <p className="text-xs text-muted-foreground">
                        {to.reason}
                      </p>
                    )}
                  </div>
                  <form action={deleteAction}>
                    <Button type="submit" variant="outline" size="sm">
                      Remove
                    </Button>
                  </form>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No upcoming time off scheduled.
          </p>
        )}

        {/* Add time off form */}
        <form action={addTimeOffAction} className="mt-6 grid gap-4">
          <h3 className="text-sm font-semibold">Add time off</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <label htmlFor="startDate" className="text-xs text-muted-foreground">
                Start date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="endDate" className="text-xs text-muted-foreground">
                End date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="reason" className="text-xs text-muted-foreground">
                Reason (optional)
              </label>
              <input
                id="reason"
                name="reason"
                type="text"
                placeholder="e.g. Conference, vacation"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <Button type="submit" variant="outline" size="sm">
              Add time off
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
