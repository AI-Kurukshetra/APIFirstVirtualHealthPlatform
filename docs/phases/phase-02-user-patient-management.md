# Phase 2: User & Patient Management

> **Scope: MVP** | **Features: 4** | **Depends on: Phase 1**

## Goal

Enable admin user management, provider profile setup, and patient registration with customizable intake forms. After this phase, the platform has full user lifecycle management and patients can complete onboarding.

---

## Features (in build order)

### Feature 2.1: Admin — User Management

**Sequence: 1** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- User listing page with search, filter (by role, status), and pagination
- Create user form (Admin can create Provider and Admin accounts)
- Edit user details (name, email, role, active status)
- Deactivate/reactivate user accounts (soft delete — never hard delete)
- User detail view page

#### Routes
```
app/(dashboard)/admin/
├── users/
│   ├── page.tsx              // User list with filters
│   ├── new/page.tsx          // Create user form
│   └── [id]/
│       ├── page.tsx          // User detail view
│       └── edit/page.tsx     // Edit user form
```

#### API Endpoints (Server Actions or Route Handlers)
```
POST   /api/users           — Create user (admin only)
GET    /api/users           — List users (admin only, with filters)
GET    /api/users/:id       — Get user detail
PUT    /api/users/:id       — Update user
PATCH  /api/users/:id/status — Activate/deactivate
```

#### How to Test
- [ ] Admin sees paginated list of all users
- [ ] Admin can search users by name/email
- [ ] Admin can filter users by role (Admin, Provider, Patient)
- [ ] Admin can create a new Provider account → provider receives invite email
- [ ] Admin can edit user details
- [ ] Admin can deactivate a user → user cannot login
- [ ] Admin can reactivate a deactivated user → user can login again
- [ ] Non-admin roles cannot access user management pages

---

### Feature 2.2: Provider Profile Management

**Sequence: 2** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Provider profile model with professional details
- Provider profile setup/edit page (first login onboarding flow)
- Specialties, credentials, license information
- Profile photo upload (Supabase Storage)
- Provider listing for admin

#### Database Models
```
ProviderProfile {
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
```

#### Routes
```
app/(dashboard)/clinical/
├── profile/
│   ├── page.tsx              // View own profile
│   └── edit/page.tsx         // Edit profile

app/(dashboard)/admin/
├── providers/
│   ├── page.tsx              // Provider listing
│   └── [id]/page.tsx         // Provider detail view
```

#### How to Test
- [ ] New provider login → prompted to complete profile setup
- [ ] Provider can fill in professional details (specialty, license, NPI, bio)
- [ ] Provider can upload a profile photo
- [ ] Provider can edit their profile later
- [ ] Admin can view list of all providers with their details
- [ ] Admin can view individual provider detail pages
- [ ] Provider profile data persists across sessions

---

### Feature 2.3: Patient Registration & Onboarding

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Extended patient profile model with demographics and medical basics
- Patient self-registration flow (extends base auth registration)
- Multi-step onboarding form:
  - Step 1: Personal info (DOB, gender, address, phone)
  - Step 2: Emergency contact
  - Step 3: Basic medical info (known allergies, current medications, conditions)
- Onboarding completion status tracking
- Patient can skip optional steps and complete later

#### Database Models
```
PatientProfile {
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

Allergy {
  id          String   @id @default(cuid())
  patientId   String
  allergen    String
  severity    String   // mild, moderate, severe
  reaction    String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

Medication {
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

#### Routes
```
app/(dashboard)/patient/
├── onboarding/
│   ├── page.tsx              // Multi-step onboarding wizard
│   └── complete/page.tsx     // Onboarding success page

app/(dashboard)/patient/
├── profile/
│   ├── page.tsx              // View own profile
│   └── edit/page.tsx         // Edit profile
```

#### How to Test
- [ ] New patient registers → redirected to onboarding wizard
- [ ] Patient completes step 1 (personal info) → data saved
- [ ] Patient completes step 2 (emergency contact) → data saved
- [ ] Patient completes step 3 (medical basics) → allergies and medications saved
- [ ] Patient can skip optional steps → onboarding still completes
- [ ] Patient can revisit and edit profile data later
- [ ] Returning patient login → goes to dashboard (not onboarding again)
- [ ] Onboarding status reflected in admin user list

---

### Feature 2.4: Patient Demographics & Profile View

**Sequence: 4** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Patient detail view page (for providers and admin)
- Patient list page for admin with search and filters
- Patient summary card component (reusable — name, age, allergies, conditions)
- Patient profile completeness indicator

#### Routes
```
app/(dashboard)/admin/
├── patients/
│   ├── page.tsx              // Patient list (admin)
│   └── [id]/page.tsx         // Patient detail (admin)

app/(dashboard)/clinical/
├── patients/
│   ├── page.tsx              // Patient list (provider)
│   └── [id]/page.tsx         // Patient detail (provider)
```

#### How to Test
- [ ] Admin sees paginated list of all patients
- [ ] Admin can search patients by name, email, DOB
- [ ] Admin can view full patient detail page
- [ ] Provider sees their patients list (initially all patients, scoped later)
- [ ] Provider can view patient demographics, allergies, medications
- [ ] Patient summary card shows key info at a glance
- [ ] Profile completeness indicator shows correct percentage

---

## Phase 2 Completion Criteria

After Phase 2, the following end-to-end flows work:

1. Admin creates a new provider account → provider can login and set up profile
2. Patient registers → completes multi-step onboarding → lands on dashboard
3. Provider views patient list → clicks a patient → sees full demographics
4. Admin manages all users, providers, and patients from admin panel

## New Database Tables Added in Phase 2

- `ProviderProfile` (professional details, specialty, license, NPI)
- `PatientProfile` (demographics, emergency contact, onboarding status)
- `Allergy` (patient allergies)
- `Medication` (patient medications)
