# Healthie Platform - Master Development Plan

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Frontend       | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend        | Next.js API Routes / Server Actions             |
| Database       | PostgreSQL via Prisma ORM                        |
| Auth           | Supabase Auth                                    |
| Payments       | Stripe                                           |
| Email          | Resend / SendGrid                                |
| Deployment     | Vercel                                           |
| Real-time      | Supabase Realtime / WebSockets                   |
| Video          | Third-party (e.g., Twilio Video / Daily.co)     |
| File Storage   | Supabase Storage                                 |
| AI             | Claude API (Anthropic)                           |

## Architecture Decisions

- **Single Portal, Multiple Personas**: One unified app with permission-driven UI
- **Permission-Based Access Control (PBAC)**: Roles map to permission sets via config — middleware, routes, navigation, and API guards all check **permissions**, never roles directly. Adding a new persona = one config entry, zero code changes.
- **All 7 Roles Defined in Phase 1**: The `Role` enum includes all personas from day 1. MVP 1 activates 3 (Admin, Provider, Patient). MVP 2 activates the remaining 4 — no database migration needed for roles.
- **Capability-Based Routes**: Routes are grouped by domain (`/clinical/*`, `/scheduling/*`, `/front-desk/*`), not persona (`/provider/*`). Multiple roles can share routes with different permission levels.
- **Single Database**: No multi-tenancy — one PostgreSQL database
- **Schema-First**: All database entities and enums defined upfront across all phases to enable smooth transitions between MVP stages
- **Web Only**: No mobile apps — responsive web application
- **Next.js App Router**: Server Components by default, Client Components where needed

---

## Personas

| Persona              | Role Enum          | Description                                                                                              | Phases Active        |
| -------------------- | ------------------ | -------------------------------------------------------------------------------------------------------- | -------------------- |
| **Super Admin**      | `SUPER_ADMIN`      | Platform owner — system configuration, user lifecycle, compliance oversight, billing management, analytics | All phases           |
| **Admin**            | `ADMIN`            | Operational administrator — manages users, consent templates, billing codes, fee schedules, lab catalogs  | All phases           |
| **Provider**         | `PROVIDER`         | Clinician/Doctor — manages patients, appointments, clinical records, prescriptions, lab orders            | All phases           |
| **Nurse**            | `NURSE`            | Clinical support — assists providers, records vitals, manages care plan activities, handles triage        | Phases 3, 4, 9, 11  |
| **Care Coordinator** | `CARE_COORDINATOR` | Non-clinical care team — manages care plans, coordinates referrals, tracks patient engagement             | Phases 9, 15         |
| **Staff**            | `STAFF`            | Front-desk / billing clerk — manages appointments, handles billing, processes insurance, answers messages | Phases 4, 7, 12, 13  |
| **Patient**          | `PATIENT`          | End user — books appointments, views records, communicates with providers, pays invoices                  | All phases           |

### Persona Permissions Matrix

| Capability                        | Super Admin | Admin | Provider | Nurse | Care Coordinator | Staff | Patient |
| --------------------------------- | :---------: | :---: | :------: | :---: | :--------------: | :---: | :-----: |
| System configuration              |      ✓      |       |          |       |                  |       |         |
| User lifecycle (create/deactivate)|      ✓      |   ✓   |          |       |                  |       |         |
| View audit logs                   |      ✓      |   ✓   |          |       |                  |       |         |
| Manage consent templates          |      ✓      |   ✓   |          |       |                  |       |         |
| Manage billing codes / fee schedules |   ✓      |   ✓   |          |       |                  |       |         |
| Manage lab test catalog           |      ✓      |   ✓   |          |       |                  |       |         |
| View analytics dashboards         |      ✓      |   ✓   |          |       |                  |       |         |
| Manage workflows                  |      ✓      |   ✓   |          |       |                  |       |         |
| Create clinical notes             |             |       |    ✓     |       |                  |       |         |
| Sign clinical notes               |             |       |    ✓     |       |                  |       |         |
| Record vitals                     |             |       |    ✓     |   ✓   |                  |       |         |
| Manage diagnoses                  |             |       |    ✓     |       |                  |       |         |
| Create prescriptions              |             |       |    ✓     |       |                  |       |         |
| Create lab orders                 |             |       |    ✓     |       |                  |       |         |
| Enter lab results                 |             |       |    ✓     |   ✓   |                  |       |         |
| Create / manage care plans        |             |       |    ✓     |       |    ✓             |       |         |
| Manage referrals                  |             |       |    ✓     |       |    ✓             |       |         |
| Conduct video consultations       |             |       |    ✓     |       |                  |       |         |
| Manage provider schedule          |             |       |    ✓     |       |                  |   ✓   |         |
| Book appointments (on behalf)     |             |       |    ✓     |       |                  |   ✓   |         |
| Process insurance verification    |             |       |    ✓     |       |                  |   ✓   |         |
| Manage invoices / claims          |             |       |          |       |                  |   ✓   |         |
| Process payments                  |             |       |          |       |                  |   ✓   |         |
| Book own appointments             |             |       |          |       |                  |       |    ✓    |
| View own medical records          |             |       |          |       |                  |       |    ✓    |
| Request prescription refills      |             |       |          |       |                  |       |    ✓    |
| Send / receive messages           |             |       |    ✓     |   ✓   |    ✓             |   ✓   |    ✓    |
| Sign consent forms                |             |       |          |       |                  |       |    ✓    |
| Pay invoices                      |             |       |          |       |                  |       |    ✓    |

---

## Phase Overview & Sequence

| Phase | Name                                | Scope          | Features | Testable Outcome                                         |
| ----- | ----------------------------------- | -------------- | -------- | -------------------------------------------------------- |
| 1     | Foundation & Auth Infrastructure    | **MVP 1**      | 5        | Login/Register, role-based dashboards, audit logging      |
| 2     | User & Patient Management           | **MVP 1**      | 4        | Admin manages users, patients register with intake forms |
| 3     | Provider Dashboard & EHR Core       | **MVP 1**      | 4        | Provider views patients, creates records & clinical notes|
| 4     | Appointment Scheduling              | **MVP 1**      | 5        | Full appointment lifecycle — book, manage, remind        |
| 5     | Video Consultation                  | **MVP 1**      | 4        | Live video call between patient and provider             |
| 6     | Patient Portal                      | **MVP 1**      | 5        | Patient dashboard, records, self-scheduling, messaging   |
| 7     | Secure Messaging & Notifications    | **MVP 2**      | 4        | Full messaging flow, email & in-app notifications        |
| 8     | Consent Management                  | **MVP 2**      | 3        | Digital consent capture, versioning, tracking            |
| 9     | Care Plans & Team Coordination      | **MVP 2**      | 5        | Care plans, team assignment, collaboration               |
| 10    | Prescription Management             | **MVP 2**      | 4        | E-prescribing, drug alerts, refill management            |
| 11    | Lab & Diagnostic Integration        | **MVP 2**      | 3        | Lab orders, results integration, diagnostic tracking     |
| 12    | Billing & Claims Processing         | **MVP 2**      | 5        | Invoicing, claims, payments                              |
| 13    | Insurance Verification              | **MVP 2**      | 3        | Eligibility checking, benefits verification              |
| 14    | Reporting & Analytics               | **MVP 2**      | 4        | Dashboards for clinical, operational, engagement metrics |
| 15    | Workflow Automation                 | **MVP 2**      | 3        | Care pathways, automated tasks, protocol workflows       |
| 16    | Advanced Features & AI              | Enhancement    | 6+       | AI clinical support, predictive analytics, voice assist  |

---

## MVP 1 Boundary (Phases 1–6)

Per the PRD, MVP 1 includes:
- Patient registration & onboarding
- Appointment scheduling
- Basic video consultations
- Simple clinical documentation
- Patient portal
- Provider dashboard
- HIPAA-compliant infrastructure
- Fundamental API endpoints (auth, patients, appointments, medical records)

**After completing Phases 1–6, we have a fully testable end-to-end MVP** where:
1. Super Admin / Admin can manage the platform and users
2. Providers can manage patients, records, appointments, and conduct video visits
3. Patients can register, book appointments, join video calls, view records, and message providers

---

## MVP 2 Boundary (Phases 7–15)

MVP 2 expands the platform into a full-featured clinical operations system:
- Enhanced messaging with attachments, group/broadcast, email delivery
- Digital consent management with versioning
- Care plans with goals, activities, and multi-provider team coordination
- E-prescribing with drug interaction checks and refill management
- Lab orders, results entry, and patient-facing lab views
- Full billing lifecycle: invoicing, insurance claims, Stripe payments
- Insurance eligibility verification and benefits lookup
- Reporting dashboards for admin, provider, and patient engagement
- Workflow automation with care pathways and protocol-driven tasks

**After completing Phases 7–15:**
1. Nurses can assist with vitals, lab results, and triage
2. Care Coordinators can manage care plans and referrals across providers
3. Staff can handle front-desk scheduling, billing, insurance processing
4. The platform supports the complete clinical + operational workflow end-to-end

---

## Complete Database Schema (All Phases)

### Enums

```
// Phase 1
enum Role {
  SUPER_ADMIN
  ADMIN
  PROVIDER
  NURSE
  CARE_COORDINATOR
  STAFF
  PATIENT
}

// Phase 3
enum RecordType {
  VITALS
  DIAGNOSIS
  PROCEDURE
  MEDICAL_HISTORY
  FAMILY_HISTORY
  SURGICAL_HISTORY
  SOCIAL_HISTORY
  IMMUNIZATION
}

enum NoteType {
  SOAP
  PROGRESS
  PROCEDURE
  CONSULTATION
  DISCHARGE
  FOLLOW_UP
}

enum NoteStatus {
  DRAFT
  SIGNED
  AMENDED
  ADDENDUM
}

enum DocumentCategory {
  LAB_REPORT
  IMAGING
  REFERRAL_LETTER
  INSURANCE_CARD
  CONSENT_FORM
  DISCHARGE_SUMMARY
  OTHER
}

// Phase 4
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

enum NotificationType {
  APPOINTMENT_REMINDER
  APPOINTMENT_CONFIRMED
  APPOINTMENT_CANCELLED
  APPOINTMENT_RESCHEDULED
  LAB_RESULT_READY
  PRESCRIPTION_REFILL
  MESSAGE_RECEIVED
  CONSENT_REQUIRED
  INVOICE_CREATED
  PAYMENT_RECEIVED
  GENERAL
  SYSTEM
}

// Phase 7
enum ConversationType {
  DIRECT
  GROUP
  BROADCAST
}

// Phase 8
enum ConsentType {
  GENERAL
  TELEHEALTH
  TREATMENT
  HIPAA_NOTICE
  RESEARCH
  DATA_SHARING
}

enum ConsentStatus {
  PENDING
  SIGNED
  REVOKED
  EXPIRED
}

// Phase 9
enum CarePlanStatus {
  DRAFT
  ACTIVE
  ON_HOLD
  COMPLETED
  DISCONTINUED
}

enum GoalStatus {
  NOT_STARTED
  IN_PROGRESS
  ACHIEVED
  NOT_ACHIEVED
  CANCELLED
}

enum ActivityStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
  OVERDUE
}

enum CareTeamRole {
  PRIMARY_PROVIDER
  SPECIALIST
  CARE_COORDINATOR
  THERAPIST
  NURSE
  PHARMACIST
  OTHER
}

enum ReferralUrgency {
  ROUTINE
  URGENT
  EMERGENT
}

enum ReferralStatus {
  PENDING
  ACCEPTED
  SCHEDULED
  COMPLETED
  DECLINED
  CANCELLED
}

// Phase 10
enum PrescriptionStatus {
  DRAFT
  ACTIVE
  FILLED
  PARTIALLY_FILLED
  CANCELLED
  EXPIRED
  DISCONTINUED
}

enum RefillStatus {
  PENDING
  APPROVED
  DENIED
  CANCELLED
}

// Phase 11
enum LabOrderStatus {
  ORDERED
  COLLECTED
  PROCESSING
  RESULTED
  REVIEWED
  CANCELLED
}

enum ResultFlag {
  NORMAL
  LOW
  HIGH
  CRITICAL_LOW
  CRITICAL_HIGH
}

// Phase 12
enum InvoiceStatus {
  DRAFT
  SENT
  PARTIALLY_PAID
  PAID
  OVERDUE
  VOID
  REFUNDED
}

enum ClaimStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  PARTIALLY_APPROVED
  DENIED
  APPEALED
  PAID
  VOID
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  BANK_TRANSFER
  INSURANCE
  CASH
  CHECK
  OTHER
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

// Phase 13
enum InsurancePlanType {
  HMO
  PPO
  EPO
  POS
  HDHP
  MEDICARE
  MEDICAID
  OTHER
}

enum InsurancePriority {
  PRIMARY
  SECONDARY
  TERTIARY
}

enum EligibilityStatus {
  VERIFIED
  NOT_VERIFIED
  INACTIVE
  ERROR
  MANUAL_OVERRIDE
}

// Phase 15
enum WorkflowTrigger {
  MANUAL
  DIAGNOSIS_ADDED
  APPOINTMENT_COMPLETED
  PATIENT_REGISTERED
  LAB_RESULT_ABNORMAL
  CUSTOM
}

enum StepActionType {
  CREATE_TASK
  SEND_NOTIFICATION
  SCHEDULE_APPOINTMENT
  CREATE_LAB_ORDER
  SEND_MESSAGE
  UPDATE_CARE_PLAN
  CUSTOM
}

enum WorkflowExecutionStatus {
  IN_PROGRESS
  COMPLETED
  PAUSED
  CANCELLED
  FAILED
}
```

### Models by Phase

#### Phase 1 — Foundation & Auth

```
model User {
  id            String    @id @default(cuid())
  supabaseId    String    @unique
  email         String    @unique
  firstName     String
  lastName      String
  role          Role      @default(PATIENT)
  phone         String?
  avatarUrl     String?
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String
  entity      String
  entityId    String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}
```

#### Phase 2 — User & Patient Management

```
model ProviderProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  title           String?
  specialty       String[]
  licenseNumber   String?
  licenseState    String?
  npiNumber       String?
  bio             String?
  education       String?
  languages       String[]
  acceptingNew    Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model PatientProfile {
  id                    String    @id @default(cuid())
  userId                String    @unique
  dateOfBirth           DateTime?
  gender                String?
  bloodType             String?
  address               Json?
  emergencyContact      Json?
  onboardingCompleted   Boolean   @default(false)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Allergy {
  id          String   @id @default(cuid())
  patientId   String
  allergen    String
  severity    String   // mild, moderate, severe
  reaction    String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Medication {
  id            String    @id @default(cuid())
  patientId     String
  name          String
  dosage        String?
  frequency     String?
  prescribedBy  String?
  startDate     DateTime?
  endDate       DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

#### Phase 3 — Provider Dashboard & EHR Core

```
model MedicalRecord {
  id          String     @id @default(cuid())
  patientId   String
  providerId  String
  type        RecordType
  date        DateTime
  data        Json?
  notes       String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model VitalSign {
  id                String   @id @default(cuid())
  patientId         String
  recordedById      String
  systolicBP        Float?
  diastolicBP       Float?
  heartRate         Float?
  temperature       Float?
  respiratoryRate   Float?
  oxygenSaturation  Float?
  weight            Float?
  height            Float?
  bmi               Float?
  notes             String?
  recordedAt        DateTime @default(now())
  createdAt         DateTime @default(now())
}

model Diagnosis {
  id            String    @id @default(cuid())
  patientId     String
  providerId    String
  icdCode       String
  description   String
  status        String    @default("ACTIVE") // ACTIVE, RESOLVED, CHRONIC
  diagnosedDate DateTime
  resolvedDate  DateTime?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model ClinicalNote {
  id            String     @id @default(cuid())
  patientId     String
  providerId    String
  appointmentId String?
  type          NoteType   @default(SOAP)
  status        NoteStatus @default(DRAFT)
  subjective    String?
  objective     String?
  assessment    String?
  plan          String?
  signedAt      DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model NoteTemplate {
  id          String   @id @default(cuid())
  name        String
  type        NoteType
  subjective  String?
  objective   String?
  assessment  String?
  plan        String?
  specialty   String?
  isSystem    Boolean  @default(false)
  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Document {
  id          String           @id @default(cuid())
  patientId   String
  uploadedById String
  name        String
  category    DocumentCategory
  fileUrl     String
  fileType    String
  fileSize    Int
  notes       String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```

#### Phase 4 — Appointment Scheduling

```
model ProviderSchedule {
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

model ProviderTimeOff {
  id          String   @id @default(cuid())
  providerId  String
  startDate   DateTime
  endDate     DateTime
  reason      String?
  createdAt   DateTime @default(now())
}

model ProviderBreak {
  id          String   @id @default(cuid())
  providerId  String
  dayOfWeek   Int
  startTime   String
  endTime     String
  label       String?
  createdAt   DateTime @default(now())
}

model Appointment {
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

model Notification {
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
```

#### Phase 6 — Patient Portal (Basic Messaging)

```
model Conversation {
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

model Message {
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

#### Phase 7 — Enhanced Messaging

```
model ConversationParticipant {
  id              String    @id @default(cuid())
  conversationId  String
  userId          String
  joinedAt        DateTime  @default(now())
  leftAt          DateTime?

  @@unique([conversationId, userId])
}
```

#### Phase 8 — Consent Management

```
model ConsentTemplate {
  id              String      @id @default(cuid())
  name            String
  type            ConsentType
  version         Int         @default(1)
  content         String      // Rich text
  acknowledgments Json?       // Checkbox items
  isActive        Boolean     @default(true)
  effectiveDate   DateTime    @default(now())
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model ConsentRecord {
  id              String        @id @default(cuid())
  patientId       String
  templateId      String
  templateVersion Int
  status          ConsentStatus @default(PENDING)
  signedAt        DateTime?
  signedName      String?
  signedIp        String?
  revokedAt       DateTime?
  revokeReason    String?
  expiresAt       DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

#### Phase 9 — Care Plans & Team Coordination

```
model CarePlan {
  id          String         @id @default(cuid())
  patientId   String
  createdById String
  title       String
  description String?
  status      CarePlanStatus @default(DRAFT)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model CarePlanGoal {
  id          String     @id @default(cuid())
  carePlanId  String
  description String
  targetDate  DateTime?
  metric      String?
  targetValue String?
  status      GoalStatus @default(NOT_STARTED)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model CarePlanActivity {
  id            String         @id @default(cuid())
  carePlanId    String
  goalId        String?
  description   String
  frequency     String?
  assignedToId  String?
  status        ActivityStatus @default(PENDING)
  dueDate       DateTime?
  completedAt   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model CareTeamMember {
  id          String       @id @default(cuid())
  patientId   String
  providerId  String
  role        CareTeamRole
  isPrimary   Boolean      @default(false)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([patientId, providerId])
}

model Referral {
  id            String          @id @default(cuid())
  patientId     String
  referringId   String
  referredToId  String?
  reason        String
  urgency       ReferralUrgency @default(ROUTINE)
  status        ReferralStatus  @default(PENDING)
  notes         String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}
```

#### Phase 10 — Prescription Management

```
model Prescription {
  id                String             @id @default(cuid())
  patientId         String
  prescriberId      String
  drugName          String
  drugCode          String?            // RxNorm / NDC
  dosage            String
  strength          String?
  form              String?            // tablet, capsule, liquid
  frequency         String
  route             String?            // oral, topical, injection
  quantity           Int?
  daysSupply        Int?
  refillsAllowed    Int               @default(0)
  refillsUsed       Int               @default(0)
  instructions      String?
  pharmacy          String?
  status            PrescriptionStatus @default(DRAFT)
  startDate         DateTime?
  endDate           DateTime?
  discontinuedReason String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}

model RefillRequest {
  id              String       @id @default(cuid())
  prescriptionId  String
  patientId       String
  status          RefillStatus @default(PENDING)
  reviewedById    String?
  reviewedAt      DateTime?
  denyReason      String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}
```

#### Phase 11 — Lab & Diagnostic Integration

```
model LabTestCatalog {
  id              String   @id @default(cuid())
  code            String   @unique // LOINC code
  name            String
  category        String   // Chemistry, Hematology, Microbiology, etc.
  specimenType    String?
  fastingRequired Boolean  @default(false)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model LabOrder {
  id                  String         @id @default(cuid())
  patientId           String
  orderedById         String
  priority            String         @default("ROUTINE") // ROUTINE, URGENT, STAT
  status              LabOrderStatus @default(ORDERED)
  clinicalIndication  String?
  specialInstructions String?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
}

model LabOrderItem {
  id          String   @id @default(cuid())
  labOrderId  String
  testId      String
  status      String   @default("ORDERED")
  createdAt   DateTime @default(now())
}

model LabResult {
  id              String     @id @default(cuid())
  labOrderId      String
  labOrderItemId  String
  testName        String
  value           String
  unit            String?
  referenceRange  String?
  flag            ResultFlag @default(NORMAL)
  interpretation  String?
  enteredById     String
  reviewedById    String?
  reviewedAt      DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}
```

#### Phase 12 — Billing & Claims Processing

```
model BillingCode {
  id            String   @id @default(cuid())
  code          String   @unique
  type          String   // CPT, ICD10, HCPCS
  description   String
  category      String?
  defaultPrice  Float?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model FeeSchedule {
  id            String    @id @default(cuid())
  billingCodeId String
  price         Float
  effectiveDate DateTime
  endDate       DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Invoice {
  id              String        @id @default(cuid())
  invoiceNumber   String        @unique
  patientId       String
  providerId      String?
  appointmentId   String?
  status          InvoiceStatus @default(DRAFT)
  subtotal        Float         @default(0)
  taxAmount       Float         @default(0)
  discountAmount  Float         @default(0)
  totalAmount     Float         @default(0)
  paidAmount      Float         @default(0)
  balanceDue      Float         @default(0)
  dueDate         DateTime?
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model InvoiceLineItem {
  id            String   @id @default(cuid())
  invoiceId     String
  billingCodeId String?
  description   String
  quantity      Int      @default(1)
  unitPrice     Float
  totalPrice    Float
  createdAt     DateTime @default(now())
}

model InsuranceClaim {
  id                    String      @id @default(cuid())
  claimNumber           String      @unique
  invoiceId             String
  patientId             String
  payerName             String
  status                ClaimStatus @default(DRAFT)
  claimAmount           Float
  approvedAmount        Float?
  paidAmount            Float?
  patientResponsibility Float?
  denialReason          String?
  submittedAt           DateTime?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
}

model Payment {
  id              String        @id @default(cuid())
  invoiceId       String
  patientId       String
  amount          Float
  method          PaymentMethod
  stripePaymentId String?
  status          PaymentStatus @default(PENDING)
  receiptUrl      String?
  refundedAmount  Float?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

#### Phase 13 — Insurance Verification

```
model InsurancePayer {
  id        String   @id @default(cuid())
  name      String
  payerId   String   @unique
  address   Json?
  phone     String?
  website   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PatientInsurance {
  id            String            @id @default(cuid())
  patientId     String
  payerId       String
  planName      String?
  planType      InsurancePlanType?
  memberId      String
  groupNumber   String?
  priority      InsurancePriority @default(PRIMARY)
  policyHolder  Json?
  coverageStart DateTime?
  coverageEnd   DateTime?
  cardFrontUrl  String?
  cardBackUrl   String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model EligibilityCheck {
  id                  String            @id @default(cuid())
  patientInsuranceId  String
  checkedById         String
  status              EligibilityStatus @default(NOT_VERIFIED)
  isEligible          Boolean?
  coverageActive      Boolean?
  copay               Float?
  deductible          Float?
  deductibleMet       Float?
  outOfPocketMax      Float?
  outOfPocketMet      Float?
  responseData        Json?
  createdAt           DateTime          @default(now())
}
```

#### Phase 15 — Workflow Automation

```
model Workflow {
  id                String          @id @default(cuid())
  name              String
  description       String?
  triggerType        WorkflowTrigger
  triggerCondition  Json?
  isActive          Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model WorkflowStep {
  id            String         @id @default(cuid())
  workflowId    String
  stepOrder     Int
  name          String
  actionType    StepActionType
  actionConfig  Json?
  delayDays     Int            @default(0)
  delayHours    Int            @default(0)
  assigneeRole  String?
  isRequired    Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model WorkflowExecution {
  id            String                  @id @default(cuid())
  workflowId    String
  patientId     String
  triggeredById String?
  status        WorkflowExecutionStatus @default(IN_PROGRESS)
  currentStep   Int                     @default(1)
  startedAt     DateTime                @default(now())
  completedAt   DateTime?
  createdAt     DateTime                @default(now())
  updatedAt     DateTime                @updatedAt
}
```

---

## Schema Summary by Phase

| Phase | New Tables                                                                                  | Total Tables |
| ----- | ------------------------------------------------------------------------------------------- | :----------: |
| 1     | User, AuditLog                                                                              |      2       |
| 2     | ProviderProfile, PatientProfile, Allergy, Medication                                        |      6       |
| 3     | MedicalRecord, VitalSign, Diagnosis, ClinicalNote, NoteTemplate, Document                   |     12       |
| 4     | ProviderSchedule, ProviderTimeOff, ProviderBreak, Appointment, Notification                 |     17       |
| 5     | *(adds fields to Appointment — no new tables)*                                              |     17       |
| 6     | Conversation, Message                                                                       |     19       |
| 7     | ConversationParticipant *(+ fields on Conversation, Message)*                               |     20       |
| 8     | ConsentTemplate, ConsentRecord                                                              |     22       |
| 9     | CarePlan, CarePlanGoal, CarePlanActivity, CareTeamMember, Referral                          |     27       |
| 10    | Prescription, RefillRequest                                                                 |     29       |
| 11    | LabTestCatalog, LabOrder, LabOrderItem, LabResult                                           |     33       |
| 12    | BillingCode, FeeSchedule, Invoice, InvoiceLineItem, InsuranceClaim, Payment                 |     39       |
| 13    | InsurancePayer, PatientInsurance, EligibilityCheck                                          |     42       |
| 14    | *(no new tables — aggregation/visualization of existing data)*                              |     42       |
| 15    | Workflow, WorkflowStep, WorkflowExecution                                                   |     45       |
| 16    | *(extends existing tables — AI generation logs, FHIR mappings as needed)*                   |     45+      |

---

## Feature Sequencing Philosophy

Features are ordered so that:
1. **Each completed feature is independently testable end-to-end**
2. **Dependencies flow downward** — no feature requires a later phase
3. **Database schema evolves incrementally** — each phase adds tables/columns without breaking prior ones
4. **UI surfaces build progressively** — dashboards gain functionality with each phase
5. **Enhancement features** that don't block core workflows are deferred to later phases
6. **All schema is defined upfront** — enabling smooth migration from MVP 1 to MVP 2

---

## Individual Phase Documents

### MVP 1 (Phases 1–6)
- [Phase 1: Foundation & Auth](./phase-01-foundation-and-auth.md)
- [Phase 2: User & Patient Management](./phase-02-user-patient-management.md)
- [Phase 3: Provider Dashboard & EHR Core](./phase-03-provider-dashboard-ehr.md)
- [Phase 4: Appointment Scheduling](./phase-04-appointment-scheduling.md)
- [Phase 5: Video Consultation](./phase-05-video-consultation.md)
- [Phase 6: Patient Portal](./phase-06-patient-portal.md)

### MVP 2 (Phases 7–15)
- [Phase 7: Secure Messaging & Notifications](./phase-07-messaging-notifications.md)
- [Phase 8: Consent Management](./phase-08-consent-management.md)
- [Phase 9: Care Plans & Team Coordination](./phase-09-care-plans-coordination.md)
- [Phase 10: Prescription Management](./phase-10-prescription-management.md)
- [Phase 11: Lab & Diagnostic Integration](./phase-11-lab-diagnostics.md)
- [Phase 12: Billing & Claims Processing](./phase-12-billing-claims.md)
- [Phase 13: Insurance Verification](./phase-13-insurance-verification.md)
- [Phase 14: Reporting & Analytics](./phase-14-reporting-analytics.md)
- [Phase 15: Workflow Automation](./phase-15-workflow-automation.md)

### Enhancement
- [Phase 16: Advanced Features & AI](./phase-16-advanced-features.md)
