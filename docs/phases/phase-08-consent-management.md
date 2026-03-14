# Phase 8: Consent Management

> **Scope: Post-MVP** | **Features: 3** | **Depends on: Phase 2 (patient profiles)**

## Goal

Implement digital consent capture, version control, and tracking for all patient interactions — supporting regulatory compliance and telehealth consent requirements.

---

## Features (in build order)

### Feature 8.1: Digital Consent Forms

**Sequence: 1** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Consent form builder (admin creates consent templates)
- Form types: general consent, telehealth consent, treatment consent, HIPAA notice, research consent
- Rich text content with checkboxes for acknowledgments
- Digital signature capture (typed name + timestamp as legal signature)
- Consent form presentation during key workflows:
  - Patient onboarding (general consent, HIPAA)
  - Before video consultation (telehealth consent)
  - Before specific treatments (treatment consent)

#### Database Models
```
ConsentTemplate {
  id              String    @id @default(uuid())
  name            String
  type            ConsentType
  version         Int       @default(1)
  content         String            // Rich text content
  acknowledgments Json              // Array of checkbox items
  isActive        Boolean   @default(true)
  effectiveDate   DateTime
  createdById     String
  createdBy       User      @relation(fields: [createdById])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum ConsentType {
  GENERAL
  TELEHEALTH
  TREATMENT
  HIPAA_NOTICE
  RESEARCH
  DATA_SHARING
}

ConsentRecord {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  templateId      String
  template        ConsentTemplate @relation(fields: [templateId])
  templateVersion Int
  status          ConsentStatus
  signedAt        DateTime?
  signedName      String?          // Typed signature
  signedIp        String?          // IP at signing
  revokedAt       DateTime?
  revokeReason    String?
  expiresAt       DateTime?
  createdAt       DateTime  @default(now())
}

enum ConsentStatus {
  PENDING
  SIGNED
  REVOKED
  EXPIRED
}
```

#### How to Test
- [ ] Admin can create consent form templates with rich text and checkboxes
- [ ] Patient sees consent forms during onboarding
- [ ] Patient reads consent, checks acknowledgments, types name to sign
- [ ] Signed consent recorded with timestamp and IP
- [ ] Consent required before video consultation starts
- [ ] Cannot proceed without signing required consents

---

### Feature 8.2: Consent Version Control

**Sequence: 2** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Template versioning (editing a consent creates a new version)
- Version history view (see all versions with diffs)
- When a new version is published:
  - Existing signed consents remain valid for their version
  - Patients prompted to review and re-sign new version at next login/interaction
- Version comparison view (admin can compare versions)

#### How to Test
- [ ] Admin edits a consent template → new version created (old preserved)
- [ ] Admin can view version history
- [ ] Patients who signed version 1 are prompted to sign version 2
- [ ] Old consent records retain reference to the version they were signed under
- [ ] Admin can compare two versions side-by-side

---

### Feature 8.3: Consent Tracking & Reporting

**Sequence: 3** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Admin consent dashboard:
  - Total consents by type (signed, pending, revoked)
  - Patients missing required consents
  - Consent expiration tracking
- Patient consent status visible in their profile (provider view)
- Patient can revoke non-required consents
- Consent audit trail (all consent actions logged)
- Export consent records (CSV for compliance audits)

#### How to Test
- [ ] Admin dashboard shows consent metrics by type
- [ ] Admin can see list of patients with missing consents
- [ ] Provider can view patient's consent status on their profile
- [ ] Patient can view their signed consents
- [ ] Patient can revoke non-required consents with reason
- [ ] Revocation logged in audit trail
- [ ] Admin can export consent records as CSV

---

## Phase 8 Completion Criteria

1. Admin creates and manages consent form templates
2. Patients sign digital consents during onboarding and before consultations
3. Template versioning ensures patients re-consent when terms change
4. Full audit trail of all consent actions
5. Admin has consent compliance reporting dashboard
