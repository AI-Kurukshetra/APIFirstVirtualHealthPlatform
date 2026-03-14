# Healthie — AI-Powered Virtual Health Platform

A full-stack digital health management platform built for the AI Mahakurukshetra Hackathon 2026. Healthie enables end-to-end clinical workflows — from patient onboarding and provider management to EHR documentation, appointment scheduling, and AI-assisted clinical notes.

**Live:** https://ai-healthie-app.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma v7 |
| Auth | Supabase Auth |
| UI | shadcn/ui + Tailwind CSS v4 |
| Deployment | Vercel |

---

## Features Delivered

### Phase 1 — Foundation & Auth
- Supabase Auth — login, registration, forgot/reset password, invite flow
- Permission-Based Access Control (PBAC) — 60+ granular permissions across 7 roles
- Role-filtered navigation — each persona sees only their relevant sections
- HIPAA foundations — audit logging, secure sessions, rate limiting, inactivity timeout

### Phase 2 — User & Patient Management
- Admin user management — invite, edit, deactivate/reactivate, resend invite
- Provider profile — specialty, NPI, license, bio, languages, completeness score
- Patient onboarding wizard — 3-step flow (personal info, emergency contact, medical basics)
- Patient demographics — profile view/edit, summary card, admin and provider views

### Phase 3 — Provider Dashboard & EHR Core
- Provider clinical dashboard — stat cards, recent patients, pending notes
- Vitals — record BP, HR, temperature, O₂, weight/height with auto-calculated BMI
- Diagnoses — ICD codes, Active/Chronic/Resolved grouping, mark resolved
- SOAP Notes — draft, edit, sign (immutable after signing), delete drafts
- Note templates — provider and system-level templates, admin promotion
- Medical records timeline
- Document management — categorized uploads, audit logged

### Phase 4 — Appointment Scheduling
- Appointment calendar — list view grouped by date (upcoming 60 days + past 30 days), stat cards
- Book appointment — select patient, provider, type, date/time, duration, reason
- Appointment detail — full info, status transitions with guard rails (SCHEDULED → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED)
- Status management — confirm, check-in, start visit, complete, cancel (with reason), no-show, reschedule
- Provider availability — set weekly schedule (per day: on/off, start/end time, slot duration)
- Time off management — add/remove blocked date ranges
- Patient appointment portal — `/patient/appointments` shows own upcoming and past appointments
- Role-aware views — providers see own appointments; admins/staff see all; patients see own portal

---

## Roles

| Role | Dashboard | Access |
|---|---|---|
| `SUPER_ADMIN` / `ADMIN` | `/admin` | Full platform management |
| `PROVIDER` | `/clinical` | Patient care, EHR, notes |
| `NURSE` | `/clinical` | Clinical workflows |
| `CARE_COORDINATOR` | `/coordination` | Care plans, referrals |
| `STAFF` | `/front-desk` | Billing, appointments |
| `PATIENT` | `/patient` | Own records, portal |

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Supabase project (PostgreSQL + Auth)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase and database credentials

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
DATABASE_URL=
DATABASE_URL_DIRECT=
```

---

## Project Structure

```
app/
├── (auth)/          # Login, register, forgot/reset password
├── (dashboard)/
│   ├── admin/       # Admin — users, patients, providers, audit logs
│   ├── clinical/    # Provider — patients, EHR, notes, documents
│   ├── patient/     # Patient portal
│   ├── scheduling/  # Appointment calendar (Phase 4)
│   └── ...
components/
├── layout/          # Dashboard shell, sidebar, nav, breadcrumbs
├── ui/              # shadcn/ui components
├── admin/           # Admin-specific components
├── patient/         # Patient summary card
└── provider/        # Provider profile form
lib/
├── auth/            # PBAC guards, permissions, route access
├── db.ts            # Prisma client
├── audit.ts         # Audit logging
└── supabase/        # Supabase server/client helpers
prisma/
└── schema.prisma    # Full schema — all 16 phases modelled
```

---

## Roadmap

| Phase | Feature | Status |
|---|---|---|
| 1 | Foundation & Auth | Done |
| 2 | User & Patient Management | Done |
| 3 | Provider Dashboard & EHR | Done |
| 4 | Appointment Scheduling | Done |
| 5 | Video Consultation | Pending |
| 6 | Patient Portal | Pending |
| 7 | Messaging & Notifications | Pending |
| 8 | Consent Management | Pending |
| 9 | Care Plans & Coordination | Pending |
| 10 | Prescription Management | Pending |
| 11 | Lab & Diagnostics | Pending |
| 12 | Billing & Claims | Pending |
| 13 | Insurance Verification | Pending |
| 14 | Reporting & Analytics | Pending |
| 15 | Workflow Automation | Pending |
| 16 | AI Clinical Notes & FHIR | Pending |
