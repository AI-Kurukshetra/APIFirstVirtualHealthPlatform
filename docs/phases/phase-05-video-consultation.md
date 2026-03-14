# Phase 5: Video Consultation

> **Scope: MVP** | **Features: 4** | **Depends on: Phase 4 (appointments)**

## Goal

Enable HIPAA-compliant video consultations between providers and patients, integrated with the appointment workflow. After this phase, a complete telehealth visit can be conducted — from booking to video call to post-visit documentation.

---

## Features (in build order)

### Feature 5.1: Video Call Infrastructure

**Sequence: 1** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Video call integration using a third-party provider (recommended: Daily.co or Twilio Video)
- Room creation on appointment confirmation (for VIDEO_CONSULTATION type)
- Unique, secure meeting URLs per appointment
- Video call UI components:
  - Local video preview
  - Remote participant video
  - Audio/video mute toggles
  - End call button
  - Connection status indicator
  - Full-screen toggle
- Waiting room (patient joins → waits until provider starts)

#### Implementation Details
- Use Daily.co (simpler setup, good free tier) or Twilio Video
- Create rooms server-side via API → store meeting URL in Appointment.meetingUrl
- Use their React SDK for the video UI
- Room tokens generated per-user with expiration

#### Key Files
```
lib/video/
├── client.ts                 // Video service client (Daily/Twilio)
├── room.ts                   // Room creation/management utilities

components/video/
├── VideoCall.tsx              // Main video call component
├── VideoControls.tsx          // Mute, camera, end call controls
├── WaitingRoom.tsx            // Pre-call waiting room
├── ParticipantView.tsx        // Individual participant video tile
├── ConnectionStatus.tsx       // Connection quality indicator

app/(dashboard)/
├── consultation/
│   └── [appointmentId]/
│       └── page.tsx           // Video consultation room page
```

#### API Endpoints
```
POST   /api/appointments/:id/room    — Create video room for appointment
GET    /api/appointments/:id/token   — Get join token for current user
DELETE /api/appointments/:id/room    — End/close video room
```

#### How to Test
- [ ] Video appointment type creates a meeting room on confirmation
- [ ] Meeting URL is generated and stored on the appointment
- [ ] Both patient and provider can access the video room page
- [ ] Video/audio preview works before joining
- [ ] Mute/unmute audio works
- [ ] Enable/disable camera works
- [ ] End call button works and redirects to post-call page
- [ ] Non-participants cannot join the room (token validation)

---

### Feature 5.2: Consultation Workflow

**Sequence: 2** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Pre-call checklist:
  - Patient: camera/mic permissions, connection test
  - Provider: review patient summary before joining
- Join flow:
  - Patient joins → enters waiting room
  - Provider joins → both see each other → call starts
  - Appointment status auto-transitions: CHECKED_IN → IN_PROGRESS
- End call flow:
  - Either party can end the call
  - Post-call: appointment status → COMPLETED
  - Provider redirected to post-visit documentation
  - Patient redirected to visit summary / feedback
- Call duration tracking

#### Database Model Additions
```
// Add to Appointment model:
  callStartedAt   DateTime?
  callEndedAt     DateTime?
  callDuration    Int?              // Duration in seconds
```

#### How to Test
- [ ] Patient joins video appointment → sees waiting room
- [ ] Provider joins → both videos appear → call is live
- [ ] Appointment status changes to IN_PROGRESS when call starts
- [ ] Call duration is tracked
- [ ] When provider ends call → appointment status → COMPLETED
- [ ] Provider is redirected to create a clinical note
- [ ] Patient sees visit summary page
- [ ] Call timestamps are recorded on the appointment

---

### Feature 5.3: In-Call Documentation

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Side panel during video call for provider to take notes
- Quick-access patient summary (allergies, medications, vitals, diagnoses)
- Scratch pad for real-time notes (auto-saved)
- Quick vitals entry
- Note converts to a clinical note draft after call ends

#### Components
```
components/video/
├── InCallPanel.tsx            // Side panel container
├── PatientSummary.tsx         // Quick patient overview
├── ScratchPad.tsx             // Real-time notes
├── QuickVitals.tsx            // Quick vitals entry form
```

#### How to Test
- [ ] Provider sees side panel during video call
- [ ] Side panel shows patient summary (allergies, medications, last vitals)
- [ ] Provider can type notes in scratch pad during call
- [ ] Notes auto-save (no data loss on disconnect)
- [ ] After call ends, scratch pad content is available as clinical note draft
- [ ] Provider can record vitals during the call
- [ ] Side panel is collapsible to maximize video area

---

### Feature 5.4: Screen Sharing

**Sequence: 4** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Screen share capability for both provider and patient
- Share screen / stop sharing toggle
- Screen share replaces main video view for the other participant
- Share specific window or entire screen

#### How to Test
- [ ] Provider can initiate screen share → patient sees shared screen
- [ ] Patient can initiate screen share → provider sees shared screen
- [ ] Stop sharing returns to normal video view
- [ ] Only one screen share active at a time
- [ ] Works across Chrome, Firefox, Safari, Edge

---

## Phase 5 Completion Criteria

After Phase 5, the following end-to-end telehealth visit flow works:

1. Patient books a video consultation appointment
2. Both parties receive meeting details
3. At appointment time, patient joins → waiting room
4. Provider reviews patient summary → joins call → video starts
5. During call, provider takes notes in side panel and records vitals
6. Provider can share screen to explain results/images
7. Call ends → appointment marked COMPLETED → call duration recorded
8. Provider creates clinical note (pre-populated from in-call notes)
9. Patient sees visit summary

## New Database Additions in Phase 5

- `Appointment` gains: `meetingUrl`, `callStartedAt`, `callEndedAt`, `callDuration`
- Video room/token management handled by third-party service (no local DB)
