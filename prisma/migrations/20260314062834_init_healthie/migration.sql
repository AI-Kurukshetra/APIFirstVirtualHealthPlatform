-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'PROVIDER', 'NURSE', 'CARE_COORDINATOR', 'STAFF', 'PATIENT');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('VITALS', 'DIAGNOSIS', 'PROCEDURE', 'MEDICAL_HISTORY', 'FAMILY_HISTORY', 'SURGICAL_HISTORY', 'SOCIAL_HISTORY', 'IMMUNIZATION');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('SOAP', 'PROGRESS', 'PROCEDURE_NOTE', 'CONSULTATION', 'DISCHARGE', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('DRAFT', 'SIGNED', 'AMENDED', 'ADDENDUM');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('LAB_REPORT', 'IMAGING', 'REFERRAL_LETTER', 'INSURANCE_CARD', 'CONSENT_FORM', 'DISCHARGE_SUMMARY', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('INITIAL_CONSULTATION', 'FOLLOW_UP', 'ROUTINE_CHECKUP', 'URGENT', 'VIDEO_CONSULTATION', 'PHONE_CONSULTATION');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'LAB_RESULT_READY', 'PRESCRIPTION_REFILL', 'MESSAGE_RECEIVED', 'CONSENT_REQUIRED', 'INVOICE_CREATED', 'PAYMENT_RECEIVED', 'GENERAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP', 'BROADCAST');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('GENERAL', 'TELEHEALTH', 'TREATMENT', 'HIPAA_NOTICE', 'RESEARCH', 'DATA_SHARING');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING', 'CONSENT_SIGNED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CarePlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ON_HOLD', 'CARE_PLAN_COMPLETED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'NOT_ACHIEVED', 'GOAL_CANCELLED');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('ACTIVITY_PENDING', 'ACTIVITY_IN_PROGRESS', 'ACTIVITY_COMPLETED', 'SKIPPED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "CareTeamRole" AS ENUM ('PRIMARY_PROVIDER', 'SPECIALIST', 'CARE_COORDINATOR_ROLE', 'THERAPIST', 'NURSE_ROLE', 'PHARMACIST', 'OTHER');

-- CreateEnum
CREATE TYPE "ReferralUrgency" AS ENUM ('ROUTINE', 'URGENT', 'EMERGENT');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('REFERRAL_PENDING', 'ACCEPTED', 'REFERRAL_SCHEDULED', 'REFERRAL_COMPLETED', 'DECLINED', 'REFERRAL_CANCELLED');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('RX_DRAFT', 'RX_ACTIVE', 'FILLED', 'PARTIALLY_FILLED', 'RX_CANCELLED', 'RX_EXPIRED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "RefillStatus" AS ENUM ('REFILL_PENDING', 'APPROVED', 'DENIED', 'REFILL_CANCELLED');

-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('ORDERED', 'COLLECTED', 'PROCESSING', 'RESULTED', 'REVIEWED', 'LAB_CANCELLED');

-- CreateEnum
CREATE TYPE "ResultFlag" AS ENUM ('NORMAL', 'LOW', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('INV_DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE_INV', 'VOID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('CLAIM_DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CLAIM_APPROVED', 'PARTIALLY_APPROVED', 'CLAIM_DENIED', 'APPEALED', 'CLAIM_PAID', 'CLAIM_VOID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'INSURANCE_PAY', 'CASH', 'CHECK', 'OTHER_METHOD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAY_PENDING', 'PAY_COMPLETED', 'PAY_FAILED', 'PAY_REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "InsurancePlanType" AS ENUM ('HMO', 'PPO', 'EPO', 'POS', 'HDHP', 'MEDICARE', 'MEDICAID', 'OTHER_PLAN');

-- CreateEnum
CREATE TYPE "InsurancePriority" AS ENUM ('PRIMARY', 'SECONDARY', 'TERTIARY');

-- CreateEnum
CREATE TYPE "EligibilityStatus" AS ENUM ('VERIFIED', 'NOT_VERIFIED', 'INACTIVE', 'ELIG_ERROR', 'MANUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "WorkflowTrigger" AS ENUM ('MANUAL', 'DIAGNOSIS_ADDED', 'APPOINTMENT_COMPLETED_TRIGGER', 'PATIENT_REGISTERED', 'LAB_RESULT_ABNORMAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StepActionType" AS ENUM ('CREATE_TASK', 'SEND_NOTIFICATION', 'SCHEDULE_APPOINTMENT', 'CREATE_LAB_ORDER', 'SEND_MESSAGE', 'UPDATE_CARE_PLAN', 'CUSTOM_ACTION');

-- CreateEnum
CREATE TYPE "WorkflowExecutionStatus" AS ENUM ('WF_IN_PROGRESS', 'WF_COMPLETED', 'PAUSED', 'WF_CANCELLED', 'WF_FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabase_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PATIENT',
    "phone" TEXT,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "specialty" TEXT[],
    "license_number" TEXT,
    "license_state" TEXT,
    "npi_number" TEXT,
    "bio" TEXT,
    "education" TEXT,
    "languages" TEXT[],
    "accepting_new" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "blood_type" TEXT,
    "address" JSONB,
    "emergency_contact" JSONB,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reaction" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "prescribed_by" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "type" "RecordType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "data" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "systolic_bp" DOUBLE PRECISION,
    "diastolic_bp" DOUBLE PRECISION,
    "heart_rate" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "respiratory_rate" DOUBLE PRECISION,
    "oxygen_saturation" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "notes" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "icd_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "diagnosed_date" TIMESTAMP(3) NOT NULL,
    "resolved_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_notes" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "type" "NoteType" NOT NULL DEFAULT 'SOAP',
    "status" "NoteStatus" NOT NULL DEFAULT 'DRAFT',
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "signed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "NoteType" NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "specialty" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_schedules" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "slot_duration" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_time_offs" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_time_offs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_breaks" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_breaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "scheduled_start" TIMESTAMP(3) NOT NULL,
    "scheduled_end" TIMESTAMP(3) NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "reason" TEXT,
    "notes" TEXT,
    "meeting_url" TEXT,
    "call_started_at" TIMESTAMP(3),
    "call_ended_at" TIMESTAMP(3),
    "call_duration" INTEGER,
    "cancel_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL DEFAULT 'DIRECT',
    "name" TEXT,
    "patient_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ConsentType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL,
    "acknowledgments" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "template_version" INTEGER NOT NULL,
    "status" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "signed_at" TIMESTAMP(3),
    "signed_name" TEXT,
    "signed_ip" TEXT,
    "revoked_at" TIMESTAMP(3),
    "revoke_reason" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plans" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CarePlanStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_goals" (
    "id" TEXT NOT NULL,
    "care_plan_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target_date" TIMESTAMP(3),
    "metric" TEXT,
    "target_value" TEXT,
    "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_plan_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_activities" (
    "id" TEXT NOT NULL,
    "care_plan_id" TEXT NOT NULL,
    "goal_id" TEXT,
    "description" TEXT NOT NULL,
    "frequency" TEXT,
    "assigned_to_id" TEXT,
    "status" "ActivityStatus" NOT NULL DEFAULT 'ACTIVITY_PENDING',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_plan_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_team_members" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "role" "CareTeamRole" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "referring_id" TEXT NOT NULL,
    "referred_to_id" TEXT,
    "reason" TEXT NOT NULL,
    "urgency" "ReferralUrgency" NOT NULL DEFAULT 'ROUTINE',
    "status" "ReferralStatus" NOT NULL DEFAULT 'REFERRAL_PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "prescriber_id" TEXT NOT NULL,
    "drug_name" TEXT NOT NULL,
    "drug_code" TEXT,
    "dosage" TEXT NOT NULL,
    "strength" TEXT,
    "form" TEXT,
    "frequency" TEXT NOT NULL,
    "route" TEXT,
    "quantity" INTEGER,
    "days_supply" INTEGER,
    "refills_allowed" INTEGER NOT NULL DEFAULT 0,
    "refills_used" INTEGER NOT NULL DEFAULT 0,
    "instructions" TEXT,
    "pharmacy" TEXT,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'RX_DRAFT',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "discontinued_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refill_requests" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" "RefillStatus" NOT NULL DEFAULT 'REFILL_PENDING',
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "deny_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refill_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_test_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specimen_type" TEXT,
    "fasting_required" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_test_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "ordered_by_id" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'ROUTINE',
    "status" "LabOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "clinical_indication" TEXT,
    "special_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_order_items" (
    "id" TEXT NOT NULL,
    "lab_order_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ORDERED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL,
    "lab_order_id" TEXT NOT NULL,
    "lab_order_item_id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "reference_range" TEXT,
    "flag" "ResultFlag" NOT NULL DEFAULT 'NORMAL',
    "interpretation" TEXT,
    "entered_by_id" TEXT NOT NULL,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "default_price" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_schedules" (
    "id" TEXT NOT NULL,
    "billing_code_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "provider_id" TEXT,
    "appointment_id" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'INV_DRAFT',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance_due" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "billing_code_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_claims" (
    "id" TEXT NOT NULL,
    "claim_number" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "payer_name" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'CLAIM_DRAFT',
    "claim_amount" DOUBLE PRECISION NOT NULL,
    "approved_amount" DOUBLE PRECISION,
    "paid_amount" DOUBLE PRECISION,
    "patient_responsibility" DOUBLE PRECISION,
    "denial_reason" TEXT,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "stripe_payment_id" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PAY_PENDING',
    "receipt_url" TEXT,
    "refunded_amount" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_payers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payer_id" TEXT NOT NULL,
    "address" JSONB,
    "phone" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_payers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_insurances" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "payer_id" TEXT NOT NULL,
    "plan_name" TEXT,
    "plan_type" "InsurancePlanType",
    "member_id" TEXT NOT NULL,
    "group_number" TEXT,
    "priority" "InsurancePriority" NOT NULL DEFAULT 'PRIMARY',
    "policy_holder" JSONB,
    "coverage_start" TIMESTAMP(3),
    "coverage_end" TIMESTAMP(3),
    "card_front_url" TEXT,
    "card_back_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_insurances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eligibility_checks" (
    "id" TEXT NOT NULL,
    "patient_insurance_id" TEXT NOT NULL,
    "checked_by_id" TEXT NOT NULL,
    "status" "EligibilityStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "is_eligible" BOOLEAN,
    "coverage_active" BOOLEAN,
    "copay" DOUBLE PRECISION,
    "deductible" DOUBLE PRECISION,
    "deductible_met" DOUBLE PRECISION,
    "out_of_pocket_max" DOUBLE PRECISION,
    "out_of_pocket_met" DOUBLE PRECISION,
    "response_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eligibility_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" "WorkflowTrigger" NOT NULL,
    "trigger_condition" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "step_order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "action_type" "StepActionType" NOT NULL,
    "action_config" JSONB,
    "delay_days" INTEGER NOT NULL DEFAULT 0,
    "delay_hours" INTEGER NOT NULL DEFAULT 0,
    "assignee_role" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "triggered_by_id" TEXT,
    "status" "WorkflowExecutionStatus" NOT NULL DEFAULT 'WF_IN_PROGRESS',
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_id_key" ON "users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_user_id_key" ON "provider_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_user_id_key" ON "patient_profiles"("user_id");

-- CreateIndex
CREATE INDEX "allergies_patient_id_idx" ON "allergies"("patient_id");

-- CreateIndex
CREATE INDEX "medications_patient_id_idx" ON "medications"("patient_id");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_idx" ON "medical_records"("patient_id");

-- CreateIndex
CREATE INDEX "medical_records_provider_id_idx" ON "medical_records"("provider_id");

-- CreateIndex
CREATE INDEX "medical_records_type_idx" ON "medical_records"("type");

-- CreateIndex
CREATE INDEX "vital_signs_patient_id_idx" ON "vital_signs"("patient_id");

-- CreateIndex
CREATE INDEX "vital_signs_recorded_at_idx" ON "vital_signs"("recorded_at");

-- CreateIndex
CREATE INDEX "diagnoses_patient_id_idx" ON "diagnoses"("patient_id");

-- CreateIndex
CREATE INDEX "diagnoses_icd_code_idx" ON "diagnoses"("icd_code");

-- CreateIndex
CREATE INDEX "clinical_notes_patient_id_idx" ON "clinical_notes"("patient_id");

-- CreateIndex
CREATE INDEX "clinical_notes_provider_id_idx" ON "clinical_notes"("provider_id");

-- CreateIndex
CREATE INDEX "clinical_notes_status_idx" ON "clinical_notes"("status");

-- CreateIndex
CREATE INDEX "documents_patient_id_idx" ON "documents"("patient_id");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "provider_schedules_provider_id_idx" ON "provider_schedules"("provider_id");

-- CreateIndex
CREATE INDEX "provider_time_offs_provider_id_idx" ON "provider_time_offs"("provider_id");

-- CreateIndex
CREATE INDEX "provider_breaks_provider_id_idx" ON "provider_breaks"("provider_id");

-- CreateIndex
CREATE INDEX "appointments_patient_id_idx" ON "appointments"("patient_id");

-- CreateIndex
CREATE INDEX "appointments_provider_id_idx" ON "appointments"("provider_id");

-- CreateIndex
CREATE INDEX "appointments_scheduled_start_idx" ON "appointments"("scheduled_start");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_patient_id_provider_id_key" ON "conversations"("patient_id", "provider_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "consent_records_patient_id_idx" ON "consent_records"("patient_id");

-- CreateIndex
CREATE INDEX "consent_records_template_id_idx" ON "consent_records"("template_id");

-- CreateIndex
CREATE INDEX "care_plans_patient_id_idx" ON "care_plans"("patient_id");

-- CreateIndex
CREATE INDEX "care_plans_status_idx" ON "care_plans"("status");

-- CreateIndex
CREATE INDEX "care_plan_goals_care_plan_id_idx" ON "care_plan_goals"("care_plan_id");

-- CreateIndex
CREATE INDEX "care_plan_activities_care_plan_id_idx" ON "care_plan_activities"("care_plan_id");

-- CreateIndex
CREATE INDEX "care_plan_activities_assigned_to_id_idx" ON "care_plan_activities"("assigned_to_id");

-- CreateIndex
CREATE INDEX "care_plan_activities_status_idx" ON "care_plan_activities"("status");

-- CreateIndex
CREATE UNIQUE INDEX "care_team_members_patient_id_provider_id_key" ON "care_team_members"("patient_id", "provider_id");

-- CreateIndex
CREATE INDEX "referrals_patient_id_idx" ON "referrals"("patient_id");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "prescriptions_patient_id_idx" ON "prescriptions"("patient_id");

-- CreateIndex
CREATE INDEX "prescriptions_prescriber_id_idx" ON "prescriptions"("prescriber_id");

-- CreateIndex
CREATE INDEX "prescriptions_status_idx" ON "prescriptions"("status");

-- CreateIndex
CREATE INDEX "refill_requests_prescription_id_idx" ON "refill_requests"("prescription_id");

-- CreateIndex
CREATE INDEX "refill_requests_patient_id_idx" ON "refill_requests"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "lab_test_catalog_code_key" ON "lab_test_catalog"("code");

-- CreateIndex
CREATE INDEX "lab_orders_patient_id_idx" ON "lab_orders"("patient_id");

-- CreateIndex
CREATE INDEX "lab_orders_status_idx" ON "lab_orders"("status");

-- CreateIndex
CREATE INDEX "lab_order_items_lab_order_id_idx" ON "lab_order_items"("lab_order_id");

-- CreateIndex
CREATE INDEX "lab_results_lab_order_id_idx" ON "lab_results"("lab_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_codes_code_key" ON "billing_codes"("code");

-- CreateIndex
CREATE INDEX "fee_schedules_billing_code_id_idx" ON "fee_schedules"("billing_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_patient_id_idx" ON "invoices"("patient_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_claims_claim_number_key" ON "insurance_claims"("claim_number");

-- CreateIndex
CREATE INDEX "insurance_claims_invoice_id_idx" ON "insurance_claims"("invoice_id");

-- CreateIndex
CREATE INDEX "insurance_claims_patient_id_idx" ON "insurance_claims"("patient_id");

-- CreateIndex
CREATE INDEX "insurance_claims_status_idx" ON "insurance_claims"("status");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "payments_patient_id_idx" ON "payments"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_payers_payer_id_key" ON "insurance_payers"("payer_id");

-- CreateIndex
CREATE INDEX "patient_insurances_patient_id_idx" ON "patient_insurances"("patient_id");

-- CreateIndex
CREATE INDEX "eligibility_checks_patient_insurance_id_idx" ON "eligibility_checks"("patient_insurance_id");

-- CreateIndex
CREATE INDEX "workflow_steps_workflow_id_idx" ON "workflow_steps"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_executions_workflow_id_idx" ON "workflow_executions"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_executions_patient_id_idx" ON "workflow_executions"("patient_id");

-- CreateIndex
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_templates" ADD CONSTRAINT "note_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_schedules" ADD CONSTRAINT "provider_schedules_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_time_offs" ADD CONSTRAINT "provider_time_offs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_breaks" ADD CONSTRAINT "provider_breaks_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "consent_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_goals" ADD CONSTRAINT "care_plan_goals_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_activities" ADD CONSTRAINT "care_plan_activities_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_activities" ADD CONSTRAINT "care_plan_activities_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "care_plan_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_activities" ADD CONSTRAINT "care_plan_activities_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_team_members" ADD CONSTRAINT "care_team_members_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_team_members" ADD CONSTRAINT "care_team_members_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referring_id_fkey" FOREIGN KEY ("referring_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_to_id_fkey" FOREIGN KEY ("referred_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_prescriber_id_fkey" FOREIGN KEY ("prescriber_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refill_requests" ADD CONSTRAINT "refill_requests_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refill_requests" ADD CONSTRAINT "refill_requests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refill_requests" ADD CONSTRAINT "refill_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_ordered_by_id_fkey" FOREIGN KEY ("ordered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "lab_test_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_lab_order_item_id_fkey" FOREIGN KEY ("lab_order_item_id") REFERENCES "lab_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_entered_by_id_fkey" FOREIGN KEY ("entered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_billing_code_id_fkey" FOREIGN KEY ("billing_code_id") REFERENCES "billing_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_billing_code_id_fkey" FOREIGN KEY ("billing_code_id") REFERENCES "billing_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_insurances" ADD CONSTRAINT "patient_insurances_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_insurances" ADD CONSTRAINT "patient_insurances_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "insurance_payers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_checks" ADD CONSTRAINT "eligibility_checks_patient_insurance_id_fkey" FOREIGN KEY ("patient_insurance_id") REFERENCES "patient_insurances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_checks" ADD CONSTRAINT "eligibility_checks_checked_by_id_fkey" FOREIGN KEY ("checked_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_triggered_by_id_fkey" FOREIGN KEY ("triggered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
