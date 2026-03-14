# Phase 12: Billing & Claims Processing

> **Scope: Post-MVP** | **Features: 5** | **Depends on: Phase 4 (appointments), Phase 10 (prescriptions)**

## Goal

Implement billing infrastructure — invoice generation from appointments, billing code management, insurance claims tracking, and payment processing. After this phase, the financial workflow is digitized.

---

## Features (in build order)

### Feature 12.1: Billing Codes Management

**Sequence: 1** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- CPT code catalog (procedure codes)
- ICD-10 code catalog (diagnosis codes — extends Phase 3)
- Fee schedule management (codes mapped to prices)
- Code search with autocomplete
- Admin can manage code catalogs

#### Database Models
```
BillingCode {
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

FeeSchedule {
  id            String    @id @default(cuid())
  billingCodeId String
  price         Float
  effectiveDate DateTime
  endDate       DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

#### How to Test
- [ ] Admin can add/edit/deactivate billing codes
- [ ] CPT and ICD-10 code search with autocomplete
- [ ] Fee schedule entries map codes to prices
- [ ] Code catalog is searchable by code or description
- [ ] Fee schedule supports effective date ranges

---

### Feature 12.2: Invoice Generation

**Sequence: 2** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Auto-generate invoice from completed appointment
- Invoice line items from:
  - Appointment type / service rendered
  - CPT codes applied during visit
  - Diagnosis codes (ICD-10)
- Manual invoice creation
- Invoice editing (before finalization)
- Invoice status management (draft → sent → paid → overdue → void)
- Invoice PDF generation and download

#### Database Models
```
Invoice {
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

enum InvoiceStatus {
  DRAFT
  SENT
  PARTIALLY_PAID
  PAID
  OVERDUE
  VOID
  REFUNDED
}

InvoiceLineItem {
  id            String   @id @default(cuid())
  invoiceId     String
  billingCodeId String?
  description   String
  quantity      Int      @default(1)
  unitPrice     Float
  totalPrice    Float
  createdAt     DateTime @default(now())
}
```

#### How to Test
- [ ] Completing an appointment auto-generates a draft invoice
- [ ] Invoice populated with correct line items and prices
- [ ] Provider/admin can edit draft invoice before sending
- [ ] Invoice PDF can be generated and downloaded
- [ ] Invoice number auto-increments
- [ ] Invoice status transitions work correctly
- [ ] Patient can view their invoices

---

### Feature 12.3: Insurance Claims Submission

**Sequence: 3** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Insurance claim creation from invoice
- Claim data: patient info, provider info, diagnosis codes, procedure codes, dates
- Claim status tracking (submitted → under review → approved → paid / denied)
- Claim history and audit trail
- Denied claim resubmission workflow
- EOB (Explanation of Benefits) tracking

#### Database Models
```
InsuranceClaim {
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
```

#### How to Test
- [ ] Claim can be created from an invoice
- [ ] Claim populated with diagnosis and procedure codes
- [ ] Claim status transitions work
- [ ] Denied claims can be resubmitted/appealed
- [ ] Claim history shows complete audit trail
- [ ] Admin can view all claims with filters

---

### Feature 12.4: Payment Processing

**Sequence: 4** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Stripe integration for patient payments
- Payment methods management (credit card on file)
- Payment against invoices (partial or full)
- Payment receipt generation
- Payment history per patient
- Refund processing

#### Database Models
```
Payment {
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
```

#### How to Test
- [ ] Patient can pay an invoice with a credit card (Stripe)
- [ ] Patient can save a payment method on file
- [ ] Partial payments update invoice balance
- [ ] Full payment marks invoice as PAID
- [ ] Payment receipt generated and downloadable
- [ ] Payment history visible to patient and admin
- [ ] Refund processing works (updates both payment and invoice)

---

### Feature 12.5: Billing Dashboard & Reporting

**Sequence: 5** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Admin billing dashboard:
  - Revenue summary (daily, weekly, monthly)
  - Outstanding invoices total
  - Claims in process
  - Overdue payments
- Invoice aging report
- Provider revenue breakdown
- Payment reconciliation
- Export billing data (CSV)

#### How to Test
- [ ] Dashboard shows accurate revenue metrics
- [ ] Outstanding invoices listed with aging
- [ ] Claims summary by status
- [ ] Provider-level revenue breakdown
- [ ] Billing data exportable as CSV
- [ ] Date range filters work correctly

---

## Phase 12 Completion Criteria

1. Billing codes managed with fee schedules
2. Invoices auto-generated from appointments
3. Insurance claims tracked through lifecycle
4. Patient payments processed via Stripe
5. Billing analytics and reporting available
