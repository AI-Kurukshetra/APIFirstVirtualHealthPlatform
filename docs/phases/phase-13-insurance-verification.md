# Phase 13: Insurance Verification

> **Scope: Post-MVP** | **Features: 3** | **Depends on: Phase 2 (patient profiles), Phase 12 (billing)**

## Goal

Enable real-time insurance eligibility checking and benefits verification so providers know coverage status before rendering services.

---

## Features (in build order)

### Feature 13.1: Insurance Plan Management

**Sequence: 1** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Insurance plan catalog (common insurance plans/payers)
- Patient insurance information capture:
  - Plan name, payer
  - Member ID, group number
  - Policyholder info (if different from patient)
  - Plan type (HMO, PPO, EPO, etc.)
  - Coverage dates
  - Insurance card photo upload (front/back)
- Support for multiple insurance plans per patient (primary, secondary)

#### Database Models
```
InsurancePayer {
  id              String    @id @default(uuid())
  name            String
  payerId         String?   @unique   // Payer ID for claims
  address         Json?
  phone           String?
  website         String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
}

PatientInsurance {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  payerId         String?
  payer           InsurancePayer? @relation(fields: [payerId])
  planName        String
  planType        String?          // HMO, PPO, EPO
  memberId        String
  groupNumber     String?
  priority        InsurancePriority @default(PRIMARY)
  policyHolder    Json?            // { name, relationship, dob }
  coverageStart   DateTime?
  coverageEnd     DateTime?
  cardFrontUrl    String?          // Uploaded image
  cardBackUrl     String?          // Uploaded image
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum InsurancePriority {
  PRIMARY
  SECONDARY
  TERTIARY
}
```

#### How to Test
- [ ] Admin can manage insurance payer catalog
- [ ] Patient can add insurance information during onboarding or later
- [ ] Patient can upload insurance card photos (front/back)
- [ ] Multiple insurance plans supported per patient (primary/secondary)
- [ ] Provider can view patient's insurance info on their profile
- [ ] Insurance info editable by patient and admin

---

### Feature 13.2: Eligibility Checking

**Sequence: 2** | **Complexity: High** | **Testable independently: Yes**

#### What to build
- Real-time eligibility verification (integration with eligibility API or manual entry)
- Verification check:
  - Is insurance active?
  - Coverage dates valid?
  - Patient demographics match?
- Verification result storage
- Batch eligibility checking (check all of today's patients)
- Manual eligibility override (for cases where API is unavailable)

#### Database Models
```
EligibilityCheck {
  id              String    @id @default(uuid())
  patientInsuranceId String
  patientInsurance PatientInsurance @relation(fields: [patientInsuranceId])
  checkedById     String
  checkedBy       User      @relation(fields: [checkedById])
  status          EligibilityStatus
  isEligible      Boolean?
  coverageActive  Boolean?
  effectiveDate   DateTime?
  terminationDate DateTime?
  copay           Float?
  deductible      Float?
  deductibleMet   Float?
  outOfPocketMax  Float?
  outOfPocketMet  Float?
  responseData    Json?            // Full API response
  notes           String?
  checkedAt       DateTime  @default(now())
}

enum EligibilityStatus {
  VERIFIED
  NOT_VERIFIED
  INACTIVE
  ERROR
  MANUAL_OVERRIDE
}
```

#### How to Test
- [ ] Provider can run eligibility check for a patient's insurance
- [ ] Results show coverage status, copay, deductible info
- [ ] Verification result stored with timestamp
- [ ] Batch check runs for all patients with appointments today
- [ ] Manual override available when API is unavailable
- [ ] Eligibility status visible on patient profile

---

### Feature 13.3: Benefits Verification

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Service-specific benefits lookup:
  - Is a specific service covered?
  - Prior authorization required?
  - In-network vs out-of-network status
  - Coverage percentage / copay for service
- Benefits summary display on appointment booking
- Benefits information available during invoice creation

#### How to Test
- [ ] Benefits for specific services can be checked
- [ ] Prior authorization requirements flagged
- [ ] In-network/out-of-network status shown
- [ ] Benefits summary available during appointment booking
- [ ] Benefits data available during invoice creation
- [ ] Coverage details show copay and coinsurance amounts

---

## Phase 13 Completion Criteria

1. Patient insurance information captured and managed
2. Real-time eligibility verification available
3. Benefits verification for specific services
4. Insurance status visible throughout the workflow (booking, visit, billing)
