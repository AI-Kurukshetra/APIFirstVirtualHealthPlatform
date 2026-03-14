# Phase 6: Patient Portal

> **Scope: MVP** | **Features: 5** | **Depends on: Phases 2, 3, 4, 5**

## Goal

Build the complete patient-facing experience — a dashboard consolidating appointments, records, messages, and self-service capabilities. After this phase, the MVP is complete with a fully functional patient portal.

---

## Features (in build order)

### Feature 6.1: Patient Dashboard

**Sequence: 1** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Patient home dashboard with:
  - Next upcoming appointment card (with "Join Video" button if applicable)
  - Recent visit summary (last completed appointment)
  - Unread messages / notifications count
  - Quick action buttons (Book appointment, View records, Send message)
  - Health summary card (active medications, allergies count, active diagnoses)
- Welcome message with onboarding completion prompt if not yet done

#### Routes
```
app/(dashboard)/patient/
├── page.tsx                      // Patient dashboard home
```

#### Components
```
components/patient/
├── UpcomingAppointment.tsx        // Next appointment card
├── RecentVisit.tsx                // Last visit summary
├── HealthSummary.tsx              // Medications, allergies, diagnoses count
├── PatientQuickActions.tsx        // Action buttons
├── OnboardingPrompt.tsx           // Complete your profile prompt
```

#### How to Test
- [ ] Patient dashboard shows next upcoming appointment with date, provider, type
- [ ] "Join Video" button appears for video appointments within 15 min of start time
- [ ] Recent visit section shows last completed appointment details
- [ ] Health summary shows correct counts (medications, allergies, diagnoses)
- [ ] Quick actions navigate to correct pages
- [ ] Incomplete onboarding shows a prompt to complete profile
- [ ] Dashboard handles empty states gracefully (no appointments yet, etc.)

---

### Feature 6.2: View Medical Records (Patient Side)

**Sequence: 2** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Patient-facing medical records view (read-only):
  - Medications list (active and past)
  - Allergies list
  - Diagnoses list (active and resolved)
  - Vitals history with trends
  - Visit history with clinical notes (signed notes only)
  - Uploaded documents
- Download/print capability for records
- Records timeline view

#### Routes
```
app/(dashboard)/patient/
├── records/
│   ├── page.tsx              // Records overview / timeline
│   ├── medications/page.tsx  // Medications list
│   ├── allergies/page.tsx    // Allergies list
│   ├── diagnoses/page.tsx    // Diagnoses list
│   ├── vitals/page.tsx       // Vitals history
│   ├── visits/page.tsx       // Visit history
│   └── documents/page.tsx    // Documents list
```

#### How to Test
- [ ] Patient can view their medications (active highlighted)
- [ ] Patient can view their allergies with severity
- [ ] Patient can view diagnoses (active vs resolved)
- [ ] Patient can see vitals trends over time
- [ ] Patient can view signed clinical notes from visits
- [ ] Patient can view and download uploaded documents
- [ ] Draft/unsigned notes are NOT visible to patients
- [ ] Records timeline shows entries chronologically

---

### Feature 6.3: Self-Service Appointment Scheduling

**Sequence: 3** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Streamlined patient booking flow (leverages Phase 4 booking engine):
  - Browse providers with filters (specialty, availability, accepting new patients)
  - Provider profile cards (photo, specialty, bio, languages)
  - Date/time picker showing available slots
  - Appointment type selection
  - Booking confirmation with calendar add (ICS download)
- Upcoming appointments management:
  - View appointment details
  - Cancel appointment (with reason)
  - Request reschedule
- Past appointments history

#### Routes
```
app/(dashboard)/patient/
├── appointments/
│   ├── page.tsx              // Appointments list (upcoming + past tabs)
│   ├── book/page.tsx         // Booking flow start
│   └── [id]/page.tsx         // Appointment detail (with cancel/reschedule)
```

#### How to Test
- [ ] Patient can browse providers with filters (specialty, language)
- [ ] Provider cards show photo, specialty, bio
- [ ] Patient picks a date → sees available slots
- [ ] Patient books → confirmation shown with ICS download link
- [ ] Upcoming appointments listed with key details
- [ ] Patient can cancel an upcoming appointment with reason
- [ ] Patient can request reschedule (cancel + rebook flow)
- [ ] Past appointments visible in history tab
- [ ] Video appointments show "Join" button near start time

---

### Feature 6.4: Basic Patient-Provider Messaging

**Sequence: 4** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Simple secure messaging between patient and their providers
- Conversation-based (one thread per patient-provider pair)
- Message list with unread indicators
- Message compose with text (no attachments yet — that's Phase 7)
- Real-time message delivery (Supabase Realtime or polling)
- Notification on new message

#### Database Models
```
Conversation {
  id            String           @id @default(cuid())
  type          ConversationType @default(DIRECT)  // Phase 7 adds GROUP, BROADCAST
  name          String?                             // Phase 7 (for group conversations)
  patientId     String
  providerId    String
  lastMessageAt DateTime?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@unique([patientId, providerId])
}

Message {
  id              String    @id @default(cuid())
  conversationId  String
  senderId        String
  content         String
  attachments     Json?     // Phase 7
  isRead          Boolean   @default(false)
  readAt          DateTime?
  isDeleted       Boolean   @default(false)  // Phase 7
  deletedAt       DateTime?                   // Phase 7
  createdAt       DateTime  @default(now())
}
```

#### Routes
```
app/(dashboard)/patient/
├── messages/
│   ├── page.tsx              // Conversations list
│   └── [conversationId]/page.tsx // Chat view

app/(dashboard)/clinical/
├── messages/
│   ├── page.tsx              // Conversations list
│   └── [conversationId]/page.tsx // Chat view
```

#### How to Test
- [ ] Patient can start a new conversation with a provider
- [ ] Patient sends a message → provider sees it
- [ ] Provider replies → patient sees it
- [ ] Unread messages highlighted in conversation list
- [ ] Reading a message marks it as read
- [ ] New message triggers a notification
- [ ] Conversations sorted by most recent message
- [ ] Messages display timestamps
- [ ] Cannot message a provider you haven't interacted with (optional restriction)

---

### Feature 6.5: Patient Settings & Preferences

**Sequence: 5** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Patient settings page:
  - Edit personal information (name, phone, address)
  - Change password
  - Notification preferences (email on/off, in-app on/off per type)
  - Communication preferences (preferred contact method)
- Account deactivation request (submits to admin)

#### Routes
```
app/(dashboard)/patient/
├── settings/
│   ├── page.tsx              // Settings overview
│   ├── profile/page.tsx      // Edit personal info
│   ├── password/page.tsx     // Change password
│   └── notifications/page.tsx // Notification preferences
```

#### How to Test
- [ ] Patient can edit personal information → changes saved
- [ ] Patient can change password → works on next login
- [ ] Patient can toggle email notifications on/off
- [ ] Patient can toggle in-app notifications per type
- [ ] Settings persist across sessions
- [ ] Account deactivation request sends notification to admin

---

## Phase 6 Completion Criteria — MVP COMPLETE

After Phase 6, the **full MVP** is functional:

### Complete End-to-End MVP Flows

**Flow 1: Patient Onboarding & Records**
1. Patient registers → completes onboarding → sees dashboard
2. Patient views their health records (medications, allergies, vitals, diagnoses)
3. Patient views documents uploaded by provider

**Flow 2: Telehealth Visit**
1. Patient books a video consultation with a provider
2. Both receive confirmation notifications
3. At appointment time, both join the video call
4. Provider takes notes during the call, records vitals
5. Call ends → provider signs clinical note → patient sees visit summary

**Flow 3: Provider Workflow**
1. Provider logs in → sees dashboard with today's appointments, pending notes
2. Provider reviews patient chart before appointment
3. Conducts video visit → documents encounter → signs note
4. Provider manages schedule and availability

**Flow 4: Admin Management**
1. Admin creates provider accounts
2. Admin manages all users (activate, deactivate, edit)
3. Admin views all appointments, audit logs
4. Admin manages system-wide note templates

**Flow 5: Communication**
1. Patient sends message to provider → provider receives notification
2. Provider replies → patient sees message and notification
3. Both parties have a persistent conversation history

## New Database Tables Added in Phase 6

- `Conversation` (patient-provider messaging threads)
- `Message` (individual messages within conversations)
