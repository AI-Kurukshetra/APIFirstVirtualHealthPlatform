# Phase 4: Appointment Scheduling

> **Scope: MVP** | **Features: 5** | **Depends on: Phase 2 (users), Phase 3 (provider dashboard)**

## Goal

Full appointment lifecycle — provider sets availability, patients book appointments, automated reminders are sent, and appointments are managed through their lifecycle. After this phase, the scheduling workflow is complete end-to-end.

---

## Features (in build order)

### Feature 4.1: Provider Availability Management

**Sequence: 1** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Weekly recurring schedule setup (e.g., Mon-Fri 9am-5pm)
- Custom availability slots (override recurring schedule)
- Break/lunch blocks
- Time-off / unavailable days
- Appointment duration configuration (15, 30, 45, 60 min slots)
- Timezone support

#### Database Models
```
ProviderSchedule {
  id            String   @id @default(cuid())
  providerId    String
  dayOfWeek     Int      // 0=Sunday, 6=Saturday
  startTime     String   // "09:00"
  endTime       String   // "17:00"
  slotDuration  Int      @default(30) // minutes
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

ProviderTimeOff {
  id          String   @id @default(cuid())
  providerId  String
  startDate   DateTime
  endDate     DateTime
  reason      String?
  createdAt   DateTime @default(now())
}

ProviderBreak {
  id          String   @id @default(cuid())
  providerId  String
  dayOfWeek   Int
  startTime   String
  endTime     String
  label       String?
  createdAt   DateTime @default(now())
}
```

#### Routes
```
app/(dashboard)/scheduling/
├── manage/
│   ├── page.tsx              // View/manage weekly schedule
│   ├── availability/page.tsx // Set recurring availability
│   └── time-off/page.tsx     // Manage time-off requests
```

#### How to Test
- [ ] Provider can set recurring weekly hours (e.g., Mon-Fri 9am-5pm)
- [ ] Provider can add break blocks (e.g., 12pm-1pm lunch)
- [ ] Provider can mark specific dates as unavailable (time-off)
- [ ] Provider can configure slot duration (30 min, 60 min, etc.)
- [ ] Schedule changes reflect immediately in available slots
- [ ] Overlapping schedule entries are prevented

---

### Feature 4.2: Appointment Booking

**Sequence: 2** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Available slot calculation (from provider schedule minus existing bookings)
- Patient-facing booking flow:
  - Step 1: Select provider (browse/search providers)
  - Step 2: Select date → see available time slots
  - Step 3: Select appointment type (consultation, follow-up, etc.)
  - Step 4: Add reason/notes
  - Step 5: Confirm booking
- Provider-facing booking (book on behalf of patient)
- Double-booking prevention (optimistic locking)
- Booking confirmation feedback

#### Database Models
```
Appointment {
  id              String            @id @default(cuid())
  patientId       String
  providerId      String
  scheduledStart  DateTime
  scheduledEnd    DateTime
  type            AppointmentType
  status          AppointmentStatus @default(SCHEDULED)
  reason          String?
  notes           String?
  meetingUrl      String?
  callStartedAt   DateTime?         // Phase 5
  callEndedAt     DateTime?         // Phase 5
  callDuration    Int?              // Phase 5 (seconds)
  cancelReason    String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

enum AppointmentType {
  INITIAL_CONSULTATION
  FOLLOW_UP
  ROUTINE_CHECKUP
  URGENT
  VIDEO_CONSULTATION
  PHONE_CONSULTATION
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  CHECKED_IN
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
  RESCHEDULED
}
```

#### Routes
```
app/(dashboard)/patient/
├── appointments/
│   ├── book/
│   │   ├── page.tsx              // Start booking flow
│   │   ├── [providerId]/page.tsx // Select date/time for specific provider
│   │   └── confirm/page.tsx      // Confirm booking

app/(dashboard)/scheduling/
├── book/
│   └── page.tsx                  // Provider/staff books for patient
```

#### How to Test
- [ ] Patient can browse available providers
- [ ] Patient selects a provider → sees available dates
- [ ] Patient selects a date → sees available time slots (respects schedule + existing bookings)
- [ ] Patient books a slot → appointment created with SCHEDULED status
- [ ] Patient sees booking confirmation with details
- [ ] Double-booking the same slot is prevented
- [ ] Provider can book an appointment on behalf of a patient
- [ ] Booked slot disappears from available slots for other patients

---

### Feature 4.3: Appointment Calendar View

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Provider calendar view (day, week, month views)
- Color-coded appointment types
- Click appointment → view details
- Patient upcoming appointments list
- Admin view — all appointments across providers
- Today's appointment queue for provider dashboard

#### Routes
```
app/(dashboard)/scheduling/
├── calendar/
│   ├── page.tsx              // Calendar view (default: week)
│   └── [id]/page.tsx         // Appointment detail

app/(dashboard)/patient/
├── appointments/
│   └── page.tsx              // Upcoming appointments list

app/(dashboard)/admin/
├── appointments/
│   └── page.tsx              // All appointments (admin view)
```

#### How to Test
- [ ] Provider sees appointments in day/week/month calendar views
- [ ] Appointments are color-coded by type
- [ ] Clicking an appointment shows full details (patient, time, type, reason)
- [ ] Patient sees upcoming appointments as a list with key details
- [ ] Admin sees all appointments across all providers
- [ ] Provider dashboard "Today's appointments" section populated correctly

---

### Feature 4.4: Appointment Management (Reschedule, Cancel, Status)

**Sequence: 4** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Appointment status transitions:
  - SCHEDULED → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED
  - SCHEDULED → CANCELLED
  - SCHEDULED → RESCHEDULED (creates new appointment)
  - SCHEDULED → NO_SHOW
- Cancellation with reason (by patient or provider)
- Reschedule flow (cancel + rebook)
- Check-in functionality (patient arrives / joins)
- Complete appointment (provider marks as done)
- Appointment history (past appointments)

#### How to Test
- [ ] Provider can confirm a scheduled appointment
- [ ] Patient can check in (status → CHECKED_IN)
- [ ] Provider starts appointment (status → IN_PROGRESS)
- [ ] Provider completes appointment (status → COMPLETED)
- [ ] Patient can cancel appointment with reason → status changes to CANCELLED
- [ ] Provider can cancel appointment with reason
- [ ] Reschedule flow: cancels old + books new appointment
- [ ] Provider can mark no-show
- [ ] Past appointments visible in appointment history
- [ ] Status transitions are audit-logged

---

### Feature 4.5: Appointment Reminders & Notifications

**Sequence: 5** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Notification model for in-app notifications
- Appointment reminder scheduling:
  - 24 hours before appointment
  - 1 hour before appointment
  - Appointment confirmed notification
  - Appointment cancelled notification
- In-app notification bell with unread count
- Email notification integration (via Supabase or Resend)
- Notification preferences (patient can opt in/out)

#### Database Models
```
Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?
  isRead    Boolean          @default(false)
  readAt    DateTime?
  createdAt DateTime         @default(now())
}

enum NotificationType {
  APPOINTMENT_REMINDER
  APPOINTMENT_CONFIRMED
  APPOINTMENT_CANCELLED
  APPOINTMENT_RESCHEDULED
  GENERAL
  MESSAGE           // For Phase 7
  SYSTEM
}
```

#### How to Test
- [ ] Booking an appointment creates a confirmation notification for patient
- [ ] Notification bell shows unread count
- [ ] Clicking notification bell shows notification list
- [ ] Marking notification as read updates the count
- [ ] Cancellation creates notification for both parties
- [ ] Email reminders sent at configured intervals (check logs/email)
- [ ] Patient can manage notification preferences

---

## Phase 4 Completion Criteria

After Phase 4, the following end-to-end flow works:

1. Provider sets up weekly availability (Mon-Fri 9am-5pm, 30-min slots)
2. Patient browses providers → selects one → picks date → sees open slots
3. Patient books 10:00 AM slot → receives confirmation notification
4. Slot no longer available for other patients
5. Patient receives reminder notification before appointment
6. Provider sees appointment on calendar dashboard
7. Provider confirms → patient checks in → provider starts → completes appointment
8. Completed appointment appears in history for both parties

## New Database Tables Added in Phase 4

- `ProviderSchedule` (recurring weekly availability)
- `ProviderTimeOff` (time-off dates)
- `ProviderBreak` (break blocks)
- `Appointment` (core appointment record)
- `Notification` (in-app notifications)
