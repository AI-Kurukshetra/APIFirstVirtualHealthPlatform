# Phase 15: Workflow Automation

> **Scope: Post-MVP** | **Features: 3** | **Depends on: Phase 9 (care plans), Phase 4 (appointments)**

## Goal

Automate repetitive care pathways, task assignments, and clinical protocols — reducing manual work and ensuring consistent care delivery.

---

## Features (in build order)

### Feature 15.1: Care Pathway Templates

**Sequence: 1** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Care pathway builder (admin/provider):
  - Sequence of steps/activities triggered by an event
  - Each step has: action, timing (relative to trigger), assignee, conditions
- Pathway template library (e.g., "New Patient Onboarding", "Post-Surgery Follow-up", "Diabetes Management")
- Pathway assignment to a patient (auto-creates care plan with activities)
- Pathway triggers:
  - Manual (provider assigns to patient)
  - Diagnosis-based (assigned when specific diagnosis added)
  - Appointment-based (triggered after specific appointment type)

#### Database Models
```
Workflow {
  id              String    @id @default(uuid())
  name            String
  description     String?
  triggerType      WorkflowTrigger
  triggerCondition Json?            // Conditions for auto-trigger
  isActive        Boolean   @default(true)
  createdById     String
  createdBy       User      @relation(fields: [createdById])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum WorkflowTrigger {
  MANUAL
  DIAGNOSIS_ADDED
  APPOINTMENT_COMPLETED
  PATIENT_REGISTERED
  LAB_RESULT_ABNORMAL
  CUSTOM
}

WorkflowStep {
  id              String    @id @default(uuid())
  workflowId      String
  workflow        Workflow  @relation(fields: [workflowId])
  stepOrder       Int
  name            String
  description     String?
  actionType      StepActionType
  actionConfig    Json?            // Config for the action
  delayDays       Int       @default(0)    // Days after trigger/previous step
  delayHours      Int       @default(0)
  assigneeRole    CareTeamRole?
  isRequired      Boolean   @default(true)
  createdAt       DateTime  @default(now())
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

WorkflowExecution {
  id              String    @id @default(uuid())
  workflowId      String
  workflow        Workflow  @relation(fields: [workflowId])
  patientId       String
  patient         PatientProfile @relation(fields: [patientId])
  triggeredById   String?
  triggeredBy     User?     @relation(fields: [triggeredById])
  status          WorkflowExecutionStatus @default(IN_PROGRESS)
  currentStep     Int       @default(1)
  startedAt       DateTime  @default(now())
  completedAt     DateTime?
}

enum WorkflowExecutionStatus {
  IN_PROGRESS
  COMPLETED
  PAUSED
  CANCELLED
  FAILED
}
```

#### Routes
```
app/(dashboard)/admin/
├── workflows/
│   ├── page.tsx              // Workflow list
│   ├── new/page.tsx          // Create workflow
│   └── [id]/
│       ├── page.tsx          // Workflow detail / step builder
│       └── edit/page.tsx     // Edit workflow
```

#### How to Test
- [ ] Admin can create a workflow with sequential steps
- [ ] Workflow steps define actions, timing, and assignees
- [ ] Assigning workflow to patient creates corresponding care plan activities
- [ ] Steps execute in order with correct delays
- [ ] Workflow execution status tracked
- [ ] Workflow templates can be cloned and customized

---

### Feature 15.2: Automated Task Assignments

**Sequence: 2** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Auto-assign tasks based on workflow steps
- Task routing rules (assign to specific role, specific provider, or care team)
- Task escalation (unfinished tasks escalate after deadline)
- Recurring tasks (daily vitals check, weekly follow-up, etc.)
- Task completion triggers next workflow step

#### How to Test
- [ ] Workflow step creates a task assigned to correct person/role
- [ ] Task completion advances the workflow to next step
- [ ] Overdue tasks escalate to supervisor/admin
- [ ] Recurring tasks auto-generate on schedule
- [ ] Task assignment follows routing rules (by role, by care team)
- [ ] Escalation notifications sent to supervisors

---

### Feature 15.3: Protocol-Driven Workflows

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Condition-based workflow branching:
  - If lab result abnormal → trigger follow-up pathway
  - If appointment no-show → trigger outreach workflow
  - If care plan goal not met → trigger intervention
- Workflow analytics:
  - Average completion time per workflow
  - Step dropout rates
  - Workflow effectiveness metrics
- Workflow audit log (all execution events)

#### How to Test
- [ ] Conditional triggers fire correctly (e.g., abnormal lab → follow-up)
- [ ] No-show appointments trigger outreach workflow
- [ ] Workflow branches based on conditions
- [ ] Workflow analytics show completion rates and timing
- [ ] All workflow events logged in audit trail

---

## Phase 15 Completion Criteria

1. Care pathways can be designed with sequential and conditional steps
2. Tasks auto-assigned based on workflow rules
3. Protocol-driven automation reduces manual clinical coordination
4. Workflow analytics measure effectiveness
5. Complete audit trail for all automated actions
