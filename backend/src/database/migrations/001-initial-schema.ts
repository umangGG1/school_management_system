import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1000000000001 implements MigrationInterface {
  name = 'InitialSchema1000000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "schools" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "address" varchar,
        "phone" varchar,
        "email" varchar,
        "logo_url" varchar,
        "country" varchar DEFAULT 'Uganda',
        "currency" varchar DEFAULT 'UGX',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_schools" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL,
        "password_hash" varchar NOT NULL,
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "roles" text NOT NULL,
        "school_id" uuid,
        "avatar_url" varchar,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "school_classes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "stream" varchar,
        "academic_year" varchar NOT NULL,
        "school_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_school_classes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_school_classes_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "subjects" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "code" varchar,
        "department" varchar,
        "school_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subjects" PRIMARY KEY ("id"),
        CONSTRAINT "FK_subjects_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER');
      CREATE TYPE "student_type_enum" AS ENUM('GOVERNMENT', 'PRIVATE', 'SCHOLARSHIP');

      CREATE TABLE "students" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "admission_number" varchar NOT NULL,
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "date_of_birth" date,
        "gender" "gender_enum",
        "student_type" "student_type_enum" NOT NULL DEFAULT 'PRIVATE',
        "class_id" uuid,
        "school_id" uuid NOT NULL,
        "user_id" uuid,
        "parent_name" varchar,
        "parent_phone" varchar,
        "parent_email" varchar,
        "address" varchar,
        "enrolled_at" date,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_students_admission" UNIQUE ("admission_number"),
        CONSTRAINT "PK_students" PRIMARY KEY ("id"),
        CONSTRAINT "FK_students_class" FOREIGN KEY ("class_id") REFERENCES "school_classes"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_students_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_students_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "assessment_type_enum" AS ENUM('ASSIGNMENT', 'TEST', 'MIDTERM', 'FINAL', 'PRACTICAL');

      CREATE TABLE "assessments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "subject_id" uuid NOT NULL,
        "class_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "type" "assessment_type_enum" NOT NULL,
        "score" numeric(5,2) NOT NULL,
        "max_score" numeric(5,2) NOT NULL,
        "term" varchar NOT NULL,
        "academic_year" varchar NOT NULL,
        "entered_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_assessments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_assessments_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_assessments_subject" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_assessments_class" FOREIGN KEY ("class_id") REFERENCES "school_classes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_assessments_entered_by" FOREIGN KEY ("entered_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "attendance_status_enum" AS ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

      CREATE TABLE "student_attendance" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "class_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "date" date NOT NULL,
        "status" "attendance_status_enum" NOT NULL,
        "marked_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_attendance" PRIMARY KEY ("id"),
        CONSTRAINT "FK_student_attendance_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_attendance_class" FOREIGN KEY ("class_id") REFERENCES "school_classes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_attendance_marked_by" FOREIGN KEY ("marked_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "staff_members" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "employee_number" varchar NOT NULL,
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "position" varchar NOT NULL,
        "department" varchar,
        "phone" varchar,
        "school_id" uuid NOT NULL,
        "user_id" uuid,
        "joined_at" date,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_staff_employee_number" UNIQUE ("employee_number"),
        CONSTRAINT "PK_staff_members" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_staff_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "staff_attendance_status_enum" AS ENUM('PRESENT', 'ABSENT', 'LATE', 'LEAVE');

      CREATE TABLE "staff_attendance" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "staff_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "date" date NOT NULL,
        "status" "staff_attendance_status_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_staff_attendance" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_attendance_staff" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "fee_category_enum" AS ENUM('TUITION', 'BOARDING', 'DAY_SCHOLAR', 'PTA', 'DEVELOPMENT', 'UNIFORM', 'MEDICAL', 'OTHER');

      CREATE TABLE "fee_structures" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "class_id" uuid,
        "category" "fee_category_enum" NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "term" varchar NOT NULL,
        "academic_year" varchar NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fee_structures" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fee_structures_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fee_structures_class" FOREIGN KEY ("class_id") REFERENCES "school_classes"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "invoice_status_enum" AS ENUM('PAID', 'PARTIAL', 'OVERDUE', 'PENDING');

      CREATE TABLE "invoices" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "paid_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "status" "invoice_status_enum" NOT NULL DEFAULT 'PENDING',
        "term" varchar NOT NULL,
        "academic_year" varchar NOT NULL,
        "due_date" date,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoices" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoices_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_invoices_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM('CASH', 'BANK_TRANSFER', 'MTN_MOBILE_MONEY', 'AIRTEL_MONEY', 'CHEQUE');

      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "invoice_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "method" "payment_method_enum" NOT NULL,
        "reference" varchar,
        "notes" varchar,
        "recorded_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_payments_recorded_by" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "approval_type_enum" AS ENUM('PAYROLL', 'REPORT_CARD', 'LEAVE_REQUEST', 'STUDENT_EXEAT', 'PURCHASE_ORDER', 'FEE_WAIVER', 'OTHER');
      CREATE TYPE "approval_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
      CREATE TYPE "approval_urgency_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

      CREATE TABLE "approvals" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "type" "approval_type_enum" NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "urgency" "approval_urgency_enum" NOT NULL DEFAULT 'MEDIUM',
        "status" "approval_status_enum" NOT NULL DEFAULT 'PENDING',
        "requested_by" uuid,
        "reviewed_by" uuid,
        "review_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_approvals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_approvals_requested_by" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_approvals_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM('FEE_PAYMENT', 'ATTENDANCE', 'REPORT_CARD', 'PAYROLL', 'APPROVAL', 'ANNOUNCEMENT', 'SYSTEM');

      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "title" varchar NOT NULL,
        "body" text NOT NULL,
        "type" "notification_type_enum" NOT NULL DEFAULT 'SYSTEM',
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "activity_type_enum" AS ENUM(
        'FEE_PAYMENT', 'STUDENT_ENROLLED', 'ATTENDANCE_MARKED',
        'REPORT_GENERATED', 'LEAVE_APPROVED', 'PAYROLL_PROCESSED',
        'USER_LOGIN', 'GRADE_ENTERED', 'ANNOUNCEMENT_SENT', 'OTHER'
      );

      CREATE TABLE "activity_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "type" "activity_type_enum" NOT NULL,
        "description" text NOT NULL,
        "entity_type" varchar,
        "entity_id" varchar,
        "performed_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activity_logs_performed_by" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "approvals" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_structures" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_attendance" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_members" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_attendance" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "assessments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "students" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subjects" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "school_classes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "schools" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "activity_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "approval_urgency_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "approval_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "approval_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "invoice_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "fee_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "staff_attendance_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "attendance_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "assessment_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "student_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "gender_enum"`);
  }
}
