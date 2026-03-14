# Phase 3: Provider Dashboard & EHR Core

> **Scope: MVP** | **Features: 4** | **Depends on: Phase 2**

## Goal

Build the clinical core — provider dashboard with patient queue, electronic health records, clinical documentation (SOAP notes), and document management. After this phase, providers have a functional workspace to manage patient records.

---

## Features (in build order)

### Feature 3.1: Electronic Health Records (EHR)

**Sequence: 1** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Comprehensive patient medical record model
- Medical history management (conditions, surgeries, family history)
- Vitals recording (BP, heart rate, temp, weight, height, BMI)
- Diagnoses tracking (ICD-10 codes)
- Procedures tracking (CPT codes)
- Medical record timeline view (chronological history of all entries)

#### Database Models
```
MedicalRecord {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  providerId      String
  provider        ProviderProfile @relation(fields: [providerId])
  type            RecordType     // VITALS, DIAGNOSIS, PROCEDURE, HISTORY, NOTE
  date            DateTime  @default(now())
  data            Json      // Flexible JSON for different record types
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

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

VitalSign {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  recordedById    String
  recordedBy      User      @relation(fields: [recordedById])
  bloodPressureSystolic   Int?
  bloodPressureDiastolic  Int?
  heartRate       Int?
  temperature     Float?
  respiratoryRate Int?
  oxygenSaturation Float?
  weight          Float?
  height          Float?
  bmi             Float?
  notes           String?
  recordedAt      DateTime  @default(now())
}

Diagnosis {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  providerId      String
  provider        ProviderProfile @relation(fields: [providerId])
  icdCode         String?           // ICD-10 code
  description     String
  status          DiagnosisStatus   // ACTIVE, RESOLVED, CHRONIC
  diagnosedDate   DateTime
  resolvedDate    DateTime?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum DiagnosisStatus {
  ACTIVE
  RESOLVED
  CHRONIC
}
```

#### Routes
```
app/(dashboard)/provider/
├── patients/
│   └── [id]/
│       ├── records/
│       │   ├── page.tsx          // Medical record timeline
│       │   └── new/page.tsx      // Add new record entry
│       ├── vitals/
│       │   ├── page.tsx          // Vitals history (chart + table)
│       │   └── new/page.tsx      // Record new vitals
│       ├── diagnoses/
│       │   ├── page.tsx          // Active/resolved diagnoses
│       │   └── new/page.tsx      // Add diagnosis
```

#### How to Test
- [ ] Provider can navigate to a patient's medical records
- [ ] Provider can add a new vital sign reading → appears in vitals history
- [ ] Vitals display as a chart (trend over time) and a table
- [ ] Provider can add a diagnosis with ICD-10 code → appears in diagnosis list
- [ ] Provider can mark a diagnosis as resolved
- [ ] Medical record timeline shows all entries in chronological order
- [ ] All record actions are audit-logged

---

### Feature 3.2: Clinical Documentation (SOAP Notes)

**Sequence: 2** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- SOAP note creation (Subjective, Objective, Assessment, Plan)
- Progress notes
- Note templates (predefined templates for common visit types)
- Note status management (draft, signed, amended)
- Rich text editor for note content
- Note history / versioning

#### Database Models
```
ClinicalNote {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  providerId      String
  provider        ProviderProfile @relation(fields: [providerId])
  appointmentId   String?          // Link to appointment if applicable
  type            NoteType
  status          NoteStatus
  subjective      String?          // S in SOAP
  objective       String?          // O in SOAP
  assessment      String?          // A in SOAP
  plan            String?          // P in SOAP
  content         String?          // For non-SOAP notes (progress notes, etc.)
  templateId      String?          // If created from a template
  signedAt        DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum NoteType {
  SOAP
  PROGRESS
  INITIAL_ASSESSMENT
  FOLLOW_UP
  DISCHARGE_SUMMARY
  TREATMENT_PLAN
}

enum NoteStatus {
  DRAFT
  SIGNED
  AMENDED
  ADDENDUM
}

NoteTemplate {
  id              String    @id @default(uuid())
  name            String
  type            NoteType
  specialty       String?
  subjective      String?
  objective       String?
  assessment      String?
  plan            String?
  content         String?
  isSystem        Boolean   @default(false)   // System-provided vs user-created
  createdById     String?
  createdBy       User?     @relation(fields: [createdById])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### Routes
```
app/(dashboard)/provider/
├── patients/
│   └── [id]/
│       ├── notes/
│       │   ├── page.tsx          // Notes list for this patient
│       │   ├── new/page.tsx      // Create new note (select template or blank)
│       │   └── [noteId]/
│       │       ├── page.tsx      // View note
│       │       └── edit/page.tsx  // Edit draft note

app/(dashboard)/provider/
├── templates/
│   ├── page.tsx                  // Template management
│   └── new/page.tsx              // Create custom template

app/(dashboard)/admin/
├── templates/
│   └── page.tsx                  // System template management
```

#### How to Test
- [ ] Provider can create a new SOAP note for a patient
- [ ] Provider can save a note as draft → resume editing later
- [ ] Provider can sign a note → status changes to SIGNED, becomes read-only
- [ ] Provider can select a template → note pre-populated with template content
- [ ] Provider can create custom note templates
- [ ] Admin can manage system-wide note templates
- [ ] Notes list shows all notes for a patient sorted by date
- [ ] Signed notes show provider name and sign timestamp

---

### Feature 3.3: Provider Dashboard

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Provider home dashboard with summary cards:
  - Total patients count
  - Today's appointments count (placeholder until Phase 4)
  - Pending notes (unsigned drafts)
  - Recent activity feed
- Recent patients quick access list
- Unsigned notes requiring action
- Quick action buttons (add patient record, new note, etc.)
- Patient search (global search from dashboard)

#### Routes
```
app/(dashboard)/provider/
├── page.tsx                      // Provider dashboard home
```

#### Components
```
components/provider/
├── DashboardStats.tsx            // Summary cards
├── RecentPatients.tsx            // Recent patients list
├── PendingNotes.tsx              // Unsigned notes list
├── ActivityFeed.tsx              // Recent activity
├── QuickActions.tsx              // Action buttons
├── PatientSearch.tsx             // Global patient search
```

#### How to Test
- [ ] Provider dashboard shows accurate patient count
- [ ] Pending notes section lists unsigned drafts with patient name and date
- [ ] Clicking a pending note navigates to the note editor
- [ ] Recent patients list shows last viewed/interacted patients
- [ ] Quick actions navigate to correct creation pages
- [ ] Patient search finds patients by name, DOB, or email
- [ ] Dashboard data refreshes on page load

---

### Feature 3.4: Document Management

**Sequence: 4** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- File upload for patient documents (lab reports, referral letters, images)
- Document storage via Supabase Storage
- Document categorization (lab report, imaging, referral, insurance, other)
- Document viewer (PDF, images)
- Document list per patient
- Secure download with access control

#### Database Models
```
Document {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  uploadedById    String
  uploadedBy      User      @relation(fields: [uploadedById])
  name            String
  category        DocumentCategory
  fileUrl         String            // Supabase Storage URL
  fileType        String            // MIME type
  fileSize        Int               // bytes
  description     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum DocumentCategory {
  LAB_REPORT
  IMAGING
  REFERRAL_LETTER
  INSURANCE_CARD
  IDENTIFICATION
  CONSENT_FORM
  PRESCRIPTION
  OTHER
}
```

#### Routes
```
app/(dashboard)/provider/
├── patients/
│   └── [id]/
│       ├── documents/
│       │   ├── page.tsx          // Document list
│       │   └── upload/page.tsx   // Upload document

app/(dashboard)/patient/
├── documents/
│   └── page.tsx                  // Patient's own documents (read-only)
```

#### How to Test
- [ ] Provider can upload a document for a patient (PDF, image)
- [ ] Document appears in patient's document list with category and date
- [ ] Provider can view/download the document
- [ ] Patient can view their own documents (read-only)
- [ ] Documents are categorized and filterable
- [ ] File size limits are enforced (e.g., max 10MB)
- [ ] Only authorized users can access documents (RBAC)
- [ ] Upload action is audit-logged

---

## Phase 3 Completion Criteria

After Phase 3, the following end-to-end flows work:

1. Provider logs in → sees dashboard with patient counts, pending notes, quick actions
2. Provider searches for a patient → opens patient record
3. Provider records vitals → visible in vitals history with trend chart
4. Provider adds diagnosis → visible in diagnoses list
5. Provider creates SOAP note from template → saves as draft → signs it
6. Provider uploads a lab report document → patient can view it
7. All clinical actions are audit-logged

## New Database Tables Added in Phase 3

- `MedicalRecord` (flexible medical record entries)
- `VitalSign` (structured vitals)
- `Diagnosis` (with ICD-10 codes)
- `ClinicalNote` (SOAP and progress notes)
- `NoteTemplate` (reusable note templates)
- `Document` (uploaded files)
