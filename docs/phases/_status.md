# Phase Status Tracker

Last updated: 2026-03-15

Status values:
- `pending`: not started in the codebase
- `in_progress`: partially implemented, but not complete against the phase doc
- `done`: implemented and verified against the phase doc

Tracking rule:
- This file is the live delivery tracker.
- Phase docs under `docs/phases/phase-*.md` remain the specification.
- Status here should reflect actual implementation in the repo, not intent.

## Current Snapshot

- Phases 1–4 are `done` (Phase 4 deferred items D4-1 and D4-3 resolved; D4-2, D4-4, D4-5, D4-6 remain deferred)
- Phase 6 Feature 6.3 (self-service scheduling) resolved as part of Phase 4 completion
- Phases 5–16 are `pending`

## Phase 1: Foundation & Auth Infrastructure
Source: `docs/phases/phase-01-foundation-and-auth.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 1.1: Project Scaffolding & Configuration | `done` | App Router route structure, Prisma v7 schema/migrations, Supabase connection helpers, env handling, shadcn/Tailwind setup, and base route middleware are now in place. |
| Feature 1.2: Authentication (Supabase Auth) | `done` | Login, registration, forgot-password, reset-password, callback handling, session-aware redirects, and Prisma user sync are implemented. Supabase email delivery still needs environment-level verification outside the codebase. |
| Feature 1.3: Permission-Based Access Control (PBAC) | `done` | Permission catalog, role-permission mapping, route access config, server-side guards, and permission-filtered navigation are implemented. |
| Feature 1.4: Base Layout & Navigation | `done` | Protected dashboard shell, sidebar, top nav, breadcrumbs, theme toggle, logout, persona landing pages, and mobile navigation are implemented. |
| Feature 1.5: HIPAA Compliance Foundations | `done` | Auth audit logging, security headers, secure cookie-based session handling, inactivity timeout, database-backed auth rate limiting, and a read-only audit log UI are implemented. |

## Phase 2: User & Patient Management
Source: `docs/phases/phase-02-user-patient-management.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 2.1: Admin - User Management | `done` | User list, search, role/status filters, pagination, create (invite), edit, deactivate/reactivate, detail view all implemented. |
| Feature 2.2: Provider Profile Management | `done` | Profile view/edit, specialty, license, NPI, bio, education, languages, completeness %, admin provider list/detail all implemented. **Deferred:** profile photo upload to Supabase Storage — `avatarUrl` field exists, implement later (Phase 16 or standalone). |
| Feature 2.3: Patient Registration & Onboarding | `done` | 3-step onboarding wizard (personal info, emergency contact, medical basics), skip support, completion tracking, redirect logic all implemented. |
| Feature 2.4: Patient Demographics & Profile View | `done` | Admin and provider patient list/detail, patient profile view/edit, reusable summary card, completeness indicator all implemented. DOB search skipped (low value, field exists on PatientProfile). |

## Phase 3: Provider Dashboard & EHR Core
Source: `docs/phases/phase-03-provider-dashboard-ehr.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 3.1: Electronic Health Records (EHR) | `done` | Vitals (record, history, auto-BMI), diagnoses (add, group active/chronic/resolved, mark resolved), medical records timeline all implemented. |
| Feature 3.2: Clinical Documentation (SOAP Notes) | `done` | Create/edit drafts, sign (immutable), delete drafts, note templates (provider + system), `?templateId=` pre-population, admin template management at `/admin/templates`. |
| Feature 3.3: Provider Dashboard | `done` | Real stat cards (patients, pending drafts, appointments placeholder, profile %), pending notes list, recent patients from activity, quick actions. |
| Feature 3.4: Document Management | `done` | Upload form, categorized list, patient read-only view, audit logged. **Deferred:** actual file upload to Supabase Storage — currently uses manual URL input. DB record, permissions, and audit log are fully wired; replace `fileUrl` source when Storage is configured. |

## Phase 4: Appointment Scheduling
Source: `docs/phases/phase-04-appointment-scheduling.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 4.1: Provider Availability Management | `done` | Weekly schedule grid (toggle per day, start/end time, slot duration) at `/scheduling/manage`. Time-off add/remove with ownership check. `ProviderBreak` model exists and is respected by the slot engine — **UI to add/edit breaks is deferred** (see D4-5 below). |
| Feature 4.2: Appointment Booking | `done` | Slot engine (`lib/scheduling/slots.ts`) computes open slots from schedule, time off, breaks, and existing appointments. Past slots filtered via UTC comparison (timezone-agnostic). Authenticated API at `GET /api/scheduling/slots` accepts `viewerTimezone` — slot labels returned in patient's timezone. Interactive `SlotPicker` client component supports both staff mode (patient selector) and self-booking mode. Staff/provider/admin booking at `/scheduling/new`. Patient self-service booking at `/patient/appointments/new`. Double-booking prevented server-side for both provider and patient. |
| Feature 4.3: Appointment Calendar View | `done` | List view grouped by date at `/scheduling/calendar`. Stat cards (upcoming, today, completed 30d, cancelled 30d). Role-filtered: providers see own; admins/staff see all. Patient portal at `/patient/appointments` (read-only list). **Day/week/month calendar grid views and admin `/admin/appointments` route are deferred** (see D4-6 below). |
| Feature 4.4: Appointment Management (Reschedule, Cancel, Status) | `done` | Full status lifecycle enforced server-side: `SCHEDULED → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED` with `CANCELLED` (with reason), `NO_SHOW`, `RESCHEDULED` branches. IDOR-protected: providers can only update own appointments; ADMIN/SUPER_ADMIN/STAFF can update any. All transitions audit-logged. **Reschedule currently only marks status = RESCHEDULED — it does not create a new linked appointment** (see D4-2 below). **Patient cancel own appointment deferred** (see D4-4 below). |
| Feature 4.5: Appointment Reminders & Notifications | `pending` | `Notification` model exists in schema. In-app notification bell, reminder scheduling (24h/1h before), email delivery, and notification preferences not built. Deferred to Phase 7. |

### Phase 4 Deferred Items

| ID | Item | Where to implement | Notes |
| --- | --- | --- | --- |
| D4-1 | ~~Patient self-service booking UI~~ | **DONE** | Implemented at `/patient/appointments/new`. `SlotPicker` runs in `selfPatientId` mode — no patient selector, slots shown in patient's own timezone. `bookAppointmentAction` redirects patients to `/patient/appointments` after booking. "Book appointment" button added to patient appointments list. |
| D4-2 | **Reschedule creates a new linked appointment** | `app/(dashboard)/scheduling/actions.ts` + schema | Add optional `rescheduledFromId String?` to `Appointment` model. `updateAppointmentStatusAction` on `RESCHEDULED` transition should mark old appointment and redirect to `/scheduling/new?rescheduledFrom=<id>`. Show reschedule chain on detail page. |
| D4-3 | ~~Timezone-aware datetime display and slot engine~~ | **DONE** | `timezone String @default("UTC")` added to `User` model (all roles). 45-timezone IANA combobox on all profile edit pages (provider, patient, admin user edit). `date-fns-tz` used throughout: slot labels in patient's timezone, calendar/detail pages in viewer's timezone, slot engine past-guard uses UTC comparison. |
| D4-4 | **Patient can cancel own appointment** | `app/(dashboard)/patient/appointments/page.tsx` + new action | Add `cancelOwnAppointmentAction` gated on `appointments:create_own`. Verify appointment belongs to patient. Only allow cancel on `SCHEDULED` or `CONFIRMED`. |
| D4-5 | **Provider breaks UI** | `app/(dashboard)/scheduling/manage/page.tsx` + `manage/actions.ts` | `ProviderBreak` model exists and slot engine already excludes breaks. Add "Breaks" section to manage page. Form: day of week + start time + end time + label. Actions: `addBreakAction` / `deleteBreakAction` following same pattern as time off. |
| D4-6 | **Day/week/month calendar grid views** | `app/(dashboard)/scheduling/calendar/page.tsx` | Current view is a date-grouped list. A visual grid calendar requires a client-side calendar library (e.g. `react-big-calendar` or custom). Also add `app/(dashboard)/admin/appointments/page.tsx` for admin-specific view. |

## Phase 5: Video Consultation
Source: `docs/phases/phase-05-video-consultation.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 5.1: Video Call Infrastructure | `pending` | |
| Feature 5.2: Consultation Workflow | `pending` | |
| Feature 5.3: In-Call Documentation | `pending` | |
| Feature 5.4: Screen Sharing | `pending` | |

## Phase 6: Patient Portal
Source: `docs/phases/phase-06-patient-portal.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 6.1: Patient Dashboard | `pending` | |
| Feature 6.2: View Medical Records (Patient Side) | `pending` | |
| Feature 6.3: Self-Service Appointment Scheduling | `done` | Implemented as part of Phase 4 completion. Patient books at `/patient/appointments/new` — provider selector, slot picker in patient's own timezone, no patient selector (self only). Ownership enforced server-side. |
| Feature 6.4: Basic Patient-Provider Messaging | `pending` | Conversation and message models exist, app features not built. |
| Feature 6.5: Patient Settings & Preferences | `pending` | |

## Phase 7: Messaging & Notifications
Source: `docs/phases/phase-07-messaging-notifications.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 7.1: Enhanced Messaging - Attachments & Rich Content | `pending` | Schema support exists, app features not built. |
| Feature 7.2: Broadcast & Group Messaging | `pending` | Schema support exists, app features not built. |
| Feature 7.3: Email Notification Delivery | `pending` | |
| Feature 7.4: Notification Center & Preferences | `pending` | |

## Phase 8: Consent Management
Source: `docs/phases/phase-08-consent-management.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 8.1: Digital Consent Forms | `pending` | Prisma models exist, app features not built. |
| Feature 8.2: Consent Version Control | `pending` | Prisma models exist, app features not built. |
| Feature 8.3: Consent Tracking & Reporting | `pending` | |

## Phase 9: Care Plans & Team Coordination
Source: `docs/phases/phase-09-care-plans-coordination.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 9.1: Care Plan Creation & Management | `pending` | Prisma models exist, app features not built. |
| Feature 9.2: Care Team Assignment | `pending` | Prisma models exist, app features not built. |
| Feature 9.3: Shared Care Plans | `pending` | |
| Feature 9.4: Handoff Protocols | `pending` | |
| Feature 9.5: Care Team Task Management | `pending` | |

## Phase 10: Prescription Management
Source: `docs/phases/phase-10-prescription-management.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 10.1: Prescription Creation & Management | `pending` | Prisma models exist, app features not built. |
| Feature 10.2: Drug Interaction Checking | `pending` | |
| Feature 10.3: Refill Management | `pending` | Prisma models exist, app features not built. |
| Feature 10.4: Prescription Tracking & Reporting | `pending` | |

## Phase 11: Lab & Diagnostic Integration
Source: `docs/phases/phase-11-lab-diagnostics.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 11.1: Lab Order Management | `pending` | Prisma models exist, app features not built. |
| Feature 11.2: Lab Results Integration | `pending` | Prisma models exist, app features not built. |
| Feature 11.3: Patient Lab Results View | `pending` | |

## Phase 12: Billing & Claims Processing
Source: `docs/phases/phase-12-billing-claims.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 12.1: Billing Codes Management | `pending` | Prisma models exist, app features not built. |
| Feature 12.2: Invoice Generation | `pending` | Prisma models exist, app features not built. |
| Feature 12.3: Insurance Claims Submission | `pending` | Prisma models exist, app features not built. |
| Feature 12.4: Payment Processing | `pending` | Prisma models exist, app features not built. |
| Feature 12.5: Billing Dashboard & Reporting | `pending` | |

## Phase 13: Insurance Verification
Source: `docs/phases/phase-13-insurance-verification.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 13.1: Insurance Plan Management | `pending` | Prisma models exist, app features not built. |
| Feature 13.2: Eligibility Checking | `pending` | Prisma models exist, app features not built. |
| Feature 13.3: Benefits Verification | `pending` | |

## Phase 14: Reporting & Analytics
Source: `docs/phases/phase-14-reporting-analytics.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 14.1: Admin Analytics Dashboard | `pending` | |
| Feature 14.2: Clinical Outcomes Reporting | `pending` | |
| Feature 14.3: Provider Performance Metrics | `pending` | |
| Feature 14.4: Patient Engagement Analytics | `pending` | |

## Phase 15: Workflow Automation
Source: `docs/phases/phase-15-workflow-automation.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 15.1: Care Pathway Templates | `pending` | Prisma models exist, app features not built. |
| Feature 15.2: Automated Task Assignments | `pending` | Prisma models exist, app features not built. |
| Feature 15.3: Protocol-Driven Workflows | `pending` | Prisma models exist, app features not built. |

## Phase 16: Advanced Features & AI
Source: `docs/phases/phase-16-advanced-features.md`

| Feature | Status | Notes |
| --- | --- | --- |
| Feature 16.1: AI-Powered Clinical Note Generation | `pending` | |
| Feature 16.2: AI Clinical Decision Support | `pending` | |
| Feature 16.3: Predictive Health Analytics | `pending` | |
| Feature 16.4: Voice-Enabled Clinical Assistant | `pending` | |
| Feature 16.5: Social Determinants of Health (SDOH) Tracking | `pending` | |
| Feature 16.6: Interoperability Hub (FHIR) | `pending` | |
