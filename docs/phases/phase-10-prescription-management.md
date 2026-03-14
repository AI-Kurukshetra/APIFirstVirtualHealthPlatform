# Phase 10: Prescription Management

> **Scope: Post-MVP** | **Features: 4** | **Depends on: Phase 3 (EHR, medications)**

## Goal

Enable e-prescribing capabilities with drug interaction checking, prescription tracking, and refill management. After this phase, providers can manage the full prescription lifecycle digitally.

---

## Features (in build order)

### Feature 10.1: Prescription Creation & Management

**Sequence: 1** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Prescription creation form:
  - Drug name (with autocomplete from drug database)
  - Dosage, strength, form (tablet, capsule, liquid, etc.)
  - Frequency and schedule
  - Duration / quantity
  - Refills allowed
  - Special instructions
  - Pharmacy selection
- Prescription listing per patient (active, completed, discontinued)
- Prescription detail view
- Prescription status management (active, filled, cancelled, expired)
- Prescription history

#### Database Models
```
Prescription {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  prescriberId    String
  prescriber      ProviderProfile @relation(fields: [prescriberId])
  appointmentId   String?
  drugName        String
  drugCode        String?          // RxNorm or NDC code
  dosage          String
  strength        String?
  form            String?          // tablet, capsule, liquid
  frequency       String           // "twice daily", "every 8 hours"
  route           String?          // oral, topical, IV
  quantity         Int?
  daysSupply      Int?
  refillsAllowed  Int       @default(0)
  refillsUsed     Int       @default(0)
  instructions    String?          // Special instructions
  pharmacy        String?
  status          PrescriptionStatus @default(ACTIVE)
  startDate       DateTime
  endDate         DateTime?
  discontinuedAt  DateTime?
  discontinuedReason String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum PrescriptionStatus {
  DRAFT
  ACTIVE
  FILLED
  PARTIALLY_FILLED
  CANCELLED
  EXPIRED
  DISCONTINUED
}
```

#### Routes
```
app/(dashboard)/provider/
├── patients/
│   └── [id]/
│       ├── prescriptions/
│       │   ├── page.tsx          // Prescription list
│       │   ├── new/page.tsx      // Create prescription
│       │   └── [rxId]/page.tsx   // Prescription detail

app/(dashboard)/patient/
├── prescriptions/
│   └── page.tsx                  // My prescriptions
```

#### How to Test
- [ ] Provider can create a new prescription with all required fields
- [ ] Drug name autocomplete works from drug database
- [ ] Prescription appears in patient's prescription list
- [ ] Patient can view their active prescriptions
- [ ] Provider can discontinue a prescription with reason
- [ ] Prescription status transitions work correctly
- [ ] Prescription history shows all past prescriptions

---

### Feature 10.2: Drug Interaction Checking

**Sequence: 2** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Drug-drug interaction checking when creating a prescription
- Check against patient's current active medications
- Interaction severity levels (minor, moderate, major, contraindicated)
- Allergy cross-check (drug against known patient allergies)
- Provider can override with documented reason
- Interaction alert display with details

#### Implementation Details
- Use a drug interaction API (e.g., OpenFDA, DrugBank API, or a curated local database)
- Check runs automatically when drug is selected in prescription form
- Results displayed as warnings before prescription submission

#### How to Test
- [ ] Prescribing a drug that interacts with current medication shows alert
- [ ] Interaction severity indicated (minor/moderate/major/contraindicated)
- [ ] Prescribing a drug the patient is allergic to shows allergy alert
- [ ] Provider can override interaction with documented reason
- [ ] Override reason recorded in prescription record
- [ ] No false alerts for non-interacting drugs

---

### Feature 10.3: Refill Management

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Patient can request a prescription refill
- Refill request queue for provider
- Provider approves/denies refill requests
- Refill count tracking (refillsUsed vs refillsAllowed)
- Auto-deny when no refills remaining
- Notification to patient on refill decision

#### Database Models
```
RefillRequest {
  id              String    @id @default(uuid())
  prescriptionId  String
  prescription    Prescription @relation(fields: [prescriptionId])
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  status          RefillStatus @default(PENDING)
  requestedAt     DateTime  @default(now())
  reviewedById    String?
  reviewedBy      ProviderProfile? @relation(fields: [reviewedById])
  reviewedAt      DateTime?
  denyReason      String?
  notes           String?
}

enum RefillStatus {
  PENDING
  APPROVED
  DENIED
  CANCELLED
}
```

#### How to Test
- [ ] Patient can request a refill for an active prescription
- [ ] Cannot request refill when no refills remaining
- [ ] Provider sees refill requests in their queue
- [ ] Provider approves → refillsUsed incremented, patient notified
- [ ] Provider denies with reason → patient notified
- [ ] Refill request history maintained

---

### Feature 10.4: Prescription Tracking & Reporting

**Sequence: 4** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Provider prescription dashboard:
  - Active prescriptions count
  - Pending refill requests count
  - Expiring prescriptions (next 30 days)
  - Most prescribed medications
- Prescription search and filters (by drug, patient, status, date)
- Prescription print/download (PDF)

#### How to Test
- [ ] Provider dashboard shows prescription metrics
- [ ] Expiring prescriptions list is accurate
- [ ] Prescription search by drug name, patient, status works
- [ ] Prescription can be exported/printed as PDF
- [ ] Refill request count badge on provider dashboard

---

## Phase 10 Completion Criteria

1. Providers can create and manage prescriptions digitally
2. Drug interaction checking prevents unsafe prescriptions
3. Allergy cross-checking prevents allergic reactions
4. Patients can request and track refills
5. Prescription analytics and reporting available
