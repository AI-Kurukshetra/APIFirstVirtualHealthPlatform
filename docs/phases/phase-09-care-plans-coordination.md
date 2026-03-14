# Phase 9: Care Plans & Team Coordination

> **Scope: Post-MVP** | **Features: 5** | **Depends on: Phase 3 (EHR), Phase 4 (appointments)**

## Goal

Enable multi-provider care coordination with shared care plans, task management, care team assignments, and handoff protocols. After this phase, complex patients can be managed collaboratively.

---

## Features (in build order)

### Feature 9.1: Care Plan Creation & Management

**Sequence: 1** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Care plan creation for a patient (by provider)
- Care plan structure:
  - Title and description
  - Goals (with target dates and measurable outcomes)
  - Interventions / activities (specific actions to take)
  - Status tracking (active, completed, discontinued)
- Care plan templates for common conditions
- Care plan timeline / progress view

#### Database Models
```
CarePlan {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  createdById     String
  createdBy       ProviderProfile @relation(fields: [createdById])
  title           String
  description     String?
  status          CarePlanStatus @default(ACTIVE)
  startDate       DateTime
  endDate         DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum CarePlanStatus {
  DRAFT
  ACTIVE
  ON_HOLD
  COMPLETED
  DISCONTINUED
}

CarePlanGoal {
  id              String    @id @default(uuid())
  carePlanId      String
  carePlan        CarePlan  @relation(fields: [carePlanId])
  description     String
  targetDate      DateTime?
  metric          String?           // Measurable outcome
  targetValue     String?           // Target for the metric
  status          GoalStatus @default(IN_PROGRESS)
  completedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum GoalStatus {
  NOT_STARTED
  IN_PROGRESS
  ACHIEVED
  NOT_ACHIEVED
  CANCELLED
}

CarePlanActivity {
  id              String    @id @default(uuid())
  carePlanId      String
  carePlan        CarePlan  @relation(fields: [carePlanId])
  goalId          String?
  goal            CarePlanGoal? @relation(fields: [goalId])
  description     String
  frequency       String?           // "Daily", "Weekly", "As needed"
  assignedToId    String?
  assignedTo      User?     @relation(fields: [assignedToId])
  status          ActivityStatus @default(PENDING)
  dueDate         DateTime?
  completedAt     DateTime?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum ActivityStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
  OVERDUE
}
```

#### How to Test
- [ ] Provider creates a care plan for a patient with goals and activities
- [ ] Care plan appears in patient's record
- [ ] Goals can be tracked with progress updates
- [ ] Activities can be marked as completed
- [ ] Care plan status transitions work (active → completed, etc.)
- [ ] Patient can view their active care plans
- [ ] Care plan templates populate goals/activities automatically

---

### Feature 9.2: Care Team Assignment

**Sequence: 2** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Assign multiple providers to a patient's care team
- Care team roles (primary, specialist, coordinator, etc.)
- Care team view on patient profile
- Provider can see which care teams they belong to
- Care team member notification on assignment

#### Database Models
```
CareTeamMember {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  providerId      String
  provider        ProviderProfile @relation(fields: [providerId])
  role            CareTeamRole
  isPrimary       Boolean   @default(false)
  assignedAt      DateTime  @default(now())
  removedAt       DateTime?
  notes           String?

  @@unique([patientId, providerId])
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
```

#### How to Test
- [ ] Provider can add another provider to a patient's care team
- [ ] Care team visible on patient profile
- [ ] Each member has a defined role
- [ ] Only one primary provider per patient
- [ ] Assigned provider sees the patient in their patient list
- [ ] Care team member receives notification on assignment
- [ ] Members can be removed from care team

---

### Feature 9.3: Shared Care Plans

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- All care team members can view patient's care plans
- Activity assignment to specific team members
- Activity completion by assigned member
- Shared notes on care plan (team can add comments)
- Activity feed — who did what on the care plan

#### How to Test
- [ ] All care team members see the patient's care plans
- [ ] Activities can be assigned to specific team members
- [ ] Assigned member sees their tasks on their dashboard
- [ ] Completing an activity notifies the care plan creator
- [ ] Team members can add notes/comments on the care plan
- [ ] Activity feed shows chronological history of actions

---

### Feature 9.4: Handoff Protocols

**Sequence: 4** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Provider handoff workflow (transfer primary responsibility)
- Handoff summary generation (auto-generated from care plan + recent notes)
- Handoff acceptance by receiving provider
- Referral tracking (internal referrals to specialists)

#### Database Models
```
Referral {
  id              String    @id @default(uuid())
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  referringId     String
  referringProvider ProviderProfile @relation(fields: [referringId])
  referredToId    String
  referredToProvider ProviderProfile @relation(fields: [referredToId])
  reason          String
  urgency         ReferralUrgency
  status          ReferralStatus @default(PENDING)
  notes           String?
  acceptedAt      DateTime?
  completedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
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
```

#### How to Test
- [ ] Provider can create a referral to another provider
- [ ] Referred provider receives notification
- [ ] Referred provider can accept or decline
- [ ] Handoff summary auto-generated from patient data
- [ ] Referral status tracked through lifecycle
- [ ] Patient notified of referral

---

### Feature 9.5: Care Team Task Management

**Sequence: 5** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Provider task dashboard (across all patients)
- Tasks from care plan activities assigned to current provider
- Task filtering (by patient, due date, status, priority)
- Task completion with notes
- Overdue task alerts

#### How to Test
- [ ] Provider sees all their assigned tasks on task dashboard
- [ ] Tasks can be filtered by patient, status, and due date
- [ ] Completing a task updates the care plan activity
- [ ] Overdue tasks highlighted
- [ ] Task count shown on provider dashboard (Phase 3 enhancement)

---

## Phase 9 Completion Criteria

1. Providers create care plans with goals and activities
2. Multiple providers collaborate on a patient's care as a team
3. Activities assigned to team members and tracked to completion
4. Referrals between providers tracked through lifecycle
5. Providers have a task dashboard for cross-patient work management
