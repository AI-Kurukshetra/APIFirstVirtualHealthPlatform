# Phase 11: Lab & Diagnostic Integration

> **Scope: Post-MVP** | **Features: 3** | **Depends on: Phase 3 (EHR)**

## Goal

Enable lab and diagnostic order management with results tracking. Providers can order labs, track results, and patients can view their lab results — all within the platform.

---

## Features (in build order)

### Feature 11.1: Lab Order Management

**Sequence: 1** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Lab order creation form:
  - Test selection (from a catalog of common lab tests)
  - Priority (routine, urgent, STAT)
  - Clinical indication / reason for order
  - Fasting requirements
  - Special instructions
- Lab test catalog management (admin)
- Order status tracking (ordered → collected → processing → resulted → reviewed)
- Order list per patient and per provider

#### Database Models
```
LabTestCatalog {
  id              String    @id @default(uuid())
  code            String    @unique     // LOINC code
  name            String
  category        String               // Chemistry, Hematology, Microbiology, etc.
  description     String?
  specimenType    String?              // Blood, Urine, etc.
  fastingRequired Boolean   @default(false)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
}

LabOrder {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  orderedById     String
  orderedBy       ProviderProfile @relation(fields: [orderedById])
  appointmentId   String?
  priority        LabPriority @default(ROUTINE)
  status          LabOrderStatus @default(ORDERED)
  clinicalIndication String?
  specialInstructions String?
  orderedAt       DateTime  @default(now())
  collectedAt     DateTime?
  resultedAt      DateTime?
  reviewedAt      DateTime?
  reviewedById    String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

LabOrderItem {
  id              String    @id @default(uuid())
  labOrderId      String
  labOrder        LabOrder  @relation(fields: [labOrderId])
  testId          String
  test            LabTestCatalog @relation(fields: [testId])
  status          LabOrderStatus @default(ORDERED)
  notes           String?
}

enum LabPriority {
  ROUTINE
  URGENT
  STAT
}

enum LabOrderStatus {
  ORDERED
  COLLECTED
  PROCESSING
  RESULTED
  REVIEWED
  CANCELLED
}
```

#### Routes
```
app/(dashboard)/provider/
├── patients/
│   └── [id]/
│       ├── labs/
│       │   ├── page.tsx          // Lab orders list
│       │   ├── new/page.tsx      // Create lab order
│       │   └── [orderId]/page.tsx // Order detail

app/(dashboard)/admin/
├── lab-catalog/
│   └── page.tsx                  // Manage lab test catalog
```

#### How to Test
- [ ] Admin can manage lab test catalog (add, edit, deactivate tests)
- [ ] Provider can create a lab order with multiple tests
- [ ] Order appears in patient's lab orders list
- [ ] Order status transitions work (ordered → collected → processing → resulted)
- [ ] Priority levels displayed correctly
- [ ] Order includes clinical indication and fasting requirements

---

### Feature 11.2: Lab Results Integration

**Sequence: 2** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Manual result entry (for when results are received externally)
- Result data structure:
  - Test name, value, unit, reference range
  - Abnormal flag (low, normal, high, critical)
  - Result interpretation notes
- Result review workflow (provider reviews and signs off)
- Abnormal result alerts to provider
- Result trends over time (same test compared across dates)

#### Database Models
```
LabResult {
  id              String    @id @default(uuid())
  labOrderId      String
  labOrder        LabOrder  @relation(fields: [labOrderId])
  labOrderItemId  String
  labOrderItem    LabOrderItem @relation(fields: [labOrderItemId])
  testName        String
  value           String
  unit            String?
  referenceRange  String?          // "70-100"
  status          ResultFlag       // NORMAL, LOW, HIGH, CRITICAL
  interpretation  String?
  resultedAt      DateTime  @default(now())
  enteredById     String
  enteredBy       User      @relation(fields: [enteredById])
}

enum ResultFlag {
  NORMAL
  LOW
  HIGH
  CRITICAL_LOW
  CRITICAL_HIGH
}
```

#### How to Test
- [ ] Results can be entered for a lab order
- [ ] Results display with reference ranges and abnormal flags
- [ ] Abnormal results visually highlighted (color-coded)
- [ ] Critical results trigger alert notification to ordering provider
- [ ] Provider can review and add interpretation notes
- [ ] Provider marks results as reviewed
- [ ] Result trends chart for same test over time

---

### Feature 11.3: Patient Lab Results View

**Sequence: 3** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Patient-facing lab results page
- Results only visible after provider review (not raw results)
- Lab history with date and status
- Result detail view with explanations
- Download/print lab results (PDF)

#### Routes
```
app/(dashboard)/patient/
├── labs/
│   ├── page.tsx              // Lab results list
│   └── [orderId]/page.tsx    // Result detail
```

#### How to Test
- [ ] Patient can view reviewed lab results
- [ ] Un-reviewed results not visible to patient
- [ ] Results show test name, value, reference range, flag
- [ ] Patient can download lab results as PDF
- [ ] Patient notified when new results are available
- [ ] Lab history shows all past results

---

## Phase 11 Completion Criteria

1. Providers can order labs from a test catalog
2. Lab results are entered and tracked through lifecycle
3. Abnormal/critical results trigger provider alerts
4. Providers review results before patient visibility
5. Patients can view and download their lab results
