# Phase Status Tracker

Last updated: 2026-03-14

Status values:
- `pending`: not started in the codebase
- `in_progress`: partially implemented, but not complete against the phase doc
- `done`: implemented and verified against the phase doc

Tracking rule:
- This file is the live delivery tracker.
- Phase docs under `docs/phases/phase-*.md` remain the specification.
- Status here should reflect actual implementation in the repo, not intent.

## Current Snapshot

- Phases 1-3 are `done`
- Phases 4-16 are `pending`

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
| Feature 4.1: Provider Availability Management | `pending` | Prisma models exist, app features not built. |
| Feature 4.2: Appointment Booking | `pending` | Prisma model exists, app features not built. |
| Feature 4.3: Appointment Calendar View | `pending` | |
| Feature 4.4: Appointment Management (Reschedule, Cancel, Status) | `pending` | |
| Feature 4.5: Appointment Reminders & Notifications | `pending` | Notification model exists, delivery flows not built. |

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
| Feature 6.3: Self-Service Appointment Scheduling | `pending` | |
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
