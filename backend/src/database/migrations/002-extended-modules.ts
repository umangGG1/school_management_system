import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendedModules1000000000002 implements MigrationInterface {
  name = 'ExtendedModules1000000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    // ── Announcements ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "announcement_category_enum" AS ENUM(
        'ACADEMIC', 'ADMINISTRATIVE', 'URGENT', 'BOARDING', 'SAFETY', 'GENERAL'
      );
      CREATE TYPE "announcement_audience_enum" AS ENUM(
        'ALL', 'ALL_STAFF', 'ALL_STUDENTS', 'ALL_PARENTS', 'BOARDING_STAFF', 'BOARDING_STUDENTS', 'SPECIFIC_CLASS'
      );

      CREATE TABLE "announcements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "title" varchar NOT NULL,
        "body" text NOT NULL,
        "category" "announcement_category_enum" NOT NULL DEFAULT 'GENERAL',
        "target_audience" "announcement_audience_enum" NOT NULL DEFAULT 'ALL_STAFF',
        "target_class_id" uuid,
        "is_pinned" boolean NOT NULL DEFAULT false,
        "published_at" TIMESTAMP,
        "expires_at" TIMESTAMP,
        "created_by_id" uuid,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_announcements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_announcements_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ── Calendar Events ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "calendar_event_type_enum" AS ENUM(
        'EXAM', 'HOLIDAY', 'MEETING', 'SPORTS', 'CULTURAL', 'BOARDING', 'ACADEMIC', 'OTHER'
      );

      CREATE TABLE "calendar_events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "date" date NOT NULL,
        "end_date" date,
        "type" "calendar_event_type_enum" NOT NULL DEFAULT 'OTHER',
        "all_day" boolean NOT NULL DEFAULT false,
        "class_id" uuid,
        "venue" text,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_by_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_calendar_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_calendar_events_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_calendar_events_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ── Boarding ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "dorm_gender_enum" AS ENUM('BOYS', 'GIRLS', 'MIXED');

      CREATE TABLE "dormitories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "gender" "dorm_gender_enum" NOT NULL DEFAULT 'BOYS',
        "capacity" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dormitories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dormitories_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );

      CREATE TABLE "dorm_rooms" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "dormitory_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "room_number" varchar NOT NULL,
        "capacity" int NOT NULL DEFAULT 0,
        "floor_number" int,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dorm_rooms" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dorm_rooms_dormitory" FOREIGN KEY ("dormitory_id") REFERENCES "dormitories"("id") ON DELETE CASCADE
      );

      CREATE TABLE "dorm_allocations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "dorm_room_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "term_id" varchar,
        "bed_number" int,
        "is_active" boolean NOT NULL DEFAULT true,
        "allocated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dorm_allocations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dorm_alloc_room" FOREIGN KEY ("dorm_room_id") REFERENCES "dorm_rooms"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_dorm_alloc_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
      );

      CREATE TYPE "student_leave_type_enum" AS ENUM('EXEAT', 'MEDICAL', 'FAMILY', 'OTHER');
      CREATE TYPE "student_leave_status_enum" AS ENUM('PENDING', 'APPROVED', 'RETURNED', 'OVERDUE', 'CANCELLED');

      CREATE TABLE "student_leaves" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "leave_type" "student_leave_type_enum" NOT NULL DEFAULT 'EXEAT',
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "reason" text NOT NULL,
        "destination" varchar,
        "status" "student_leave_status_enum" NOT NULL DEFAULT 'PENDING',
        "approved_by_id" uuid,
        "granted_at" TIMESTAMP,
        "expected_return_at" TIMESTAMP,
        "actual_return_at" TIMESTAMP,
        "parent_notified" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_leaves" PRIMARY KEY ("id"),
        CONSTRAINT "FK_student_leaves_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_leaves_approved_by" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      );

      CREATE TYPE "roll_call_period_enum" AS ENUM('MORNING', 'EVENING');
      CREATE TYPE "roll_call_entry_status_enum" AS ENUM('PRESENT', 'ABSENT', 'SICK_BAY', 'LEAVE', 'MISSING');

      CREATE TABLE "dorm_roll_calls" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "dormitory_id" uuid NOT NULL,
        "date" date NOT NULL,
        "period" "roll_call_period_enum" NOT NULL,
        "conducted_by_id" uuid NOT NULL,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dorm_roll_calls" PRIMARY KEY ("id"),
        CONSTRAINT "FK_roll_calls_dormitory" FOREIGN KEY ("dormitory_id") REFERENCES "dormitories"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_roll_calls_conducted_by" FOREIGN KEY ("conducted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT
      );

      CREATE TABLE "dorm_roll_call_entries" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "roll_call_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "status" "roll_call_entry_status_enum" NOT NULL DEFAULT 'PRESENT',
        "notes" varchar,
        CONSTRAINT "PK_dorm_roll_call_entries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_roll_call_entries_roll_call" FOREIGN KEY ("roll_call_id") REFERENCES "dorm_roll_calls"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_roll_call_entries_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
      )
    `);

    // ── Medical / Sick Bay ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "sick_bay_status_enum" AS ENUM('ADMITTED', 'OBSERVATION', 'DISCHARGED', 'REFERRED');

      CREATE TABLE "sick_bay_visits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "student_id" uuid,
        "visit_date" TIMESTAMP NOT NULL DEFAULT now(),
        "complaint" text NOT NULL,
        "temperature" numeric(4,1),
        "diagnosis" text,
        "treatment" text NOT NULL DEFAULT '',
        "medication_given" text,
        "status" "sick_bay_status_enum" NOT NULL DEFAULT 'OBSERVATION',
        "discharged_at" TIMESTAMP,
        "referred_to" text,
        "referral_reason" text,
        "attended_by_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sick_bay_visits" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sick_bay_visits_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sick_bay_visits_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_sick_bay_visits_attended_by" FOREIGN KEY ("attended_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      );

      CREATE TABLE "student_medical_history" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL UNIQUE,
        "school_id" uuid NOT NULL,
        "allergies" text,
        "chronic_conditions" text,
        "blood_group" varchar,
        "emergency_contact_name" varchar,
        "emergency_contact_phone" varchar,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_medical_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_medical_history_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
      )
    `);

    // ── Security ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "gate_person_type_enum" AS ENUM('STUDENT', 'STAFF', 'VISITOR', 'SUPPLIER', 'VEHICLE');
      CREATE TYPE "incident_severity_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
      CREATE TYPE "incident_status_enum" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED');

      CREATE TABLE "gate_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "person_name" varchar NOT NULL,
        "person_type" "gate_person_type_enum" NOT NULL DEFAULT 'VISITOR',
        "student_id" varchar,
        "staff_id" varchar,
        "purpose" text,
        "destination" varchar,
        "gate_number" int NOT NULL DEFAULT 1,
        "check_in_time" TIMESTAMP NOT NULL DEFAULT now(),
        "check_out_time" TIMESTAMP,
        "badge_number" varchar,
        "vehicle_reg" varchar,
        "notes" text,
        "guard_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gate_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_gate_logs_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_gate_logs_guard" FOREIGN KEY ("guard_id") REFERENCES "users"("id") ON DELETE SET NULL
      );

      CREATE TABLE "security_incidents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "severity" "incident_severity_enum" NOT NULL DEFAULT 'MEDIUM',
        "status" "incident_status_enum" NOT NULL DEFAULT 'OPEN',
        "reported_by_id" uuid,
        "assigned_to_id" uuid,
        "resolved_at" TIMESTAMP,
        "resolution_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_security_incidents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_security_incidents_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_security_incidents_reported_by" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_security_incidents_assigned_to" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ── HOD / Department Management ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "code" varchar,
        "hod_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_departments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_departments_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_departments_hod" FOREIGN KEY ("hod_id") REFERENCES "users"("id") ON DELETE SET NULL
      );

      CREATE TABLE "syllabus_progress" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "staff_id" uuid NOT NULL,
        "subject_id" uuid,
        "class_id" uuid,
        "term_id" varchar,
        "topics_planned" int NOT NULL DEFAULT 0,
        "topics_covered" int NOT NULL DEFAULT 0,
        "coverage_percent" numeric(5,2) NOT NULL DEFAULT 0,
        "week_number" int NOT NULL DEFAULT 1,
        "notes" text,
        "last_updated" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_syllabus_progress" PRIMARY KEY ("id"),
        CONSTRAINT "FK_syllabus_staff" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_syllabus_subject" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_syllabus_class" FOREIGN KEY ("class_id") REFERENCES "school_classes"("id") ON DELETE SET NULL
      );

      CREATE TABLE "lesson_observations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "observed_staff_id" uuid NOT NULL,
        "observed_by_id" uuid NOT NULL,
        "date" date NOT NULL,
        "class_id" uuid,
        "subject_id" uuid,
        "preparation_score" int NOT NULL DEFAULT 3,
        "delivery_score" int NOT NULL DEFAULT 3,
        "engagement_score" int NOT NULL DEFAULT 3,
        "discipline_score" int NOT NULL DEFAULT 3,
        "assessment_score" int NOT NULL DEFAULT 3,
        "overall_score" numeric(5,2) NOT NULL DEFAULT 0,
        "comments" text,
        "recommendations" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lesson_observations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_obs_observed_staff" FOREIGN KEY ("observed_staff_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_obs_observed_by" FOREIGN KEY ("observed_by_id") REFERENCES "users"("id") ON DELETE CASCADE
      );

      CREATE TYPE "scheme_status_enum" AS ENUM('NOT_SUBMITTED', 'DRAFT', 'SUBMITTED', 'APPROVED');

      CREATE TABLE "schemes_of_work" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "staff_id" uuid NOT NULL,
        "subject_id" uuid,
        "class_id" uuid,
        "term_id" varchar,
        "file_url" varchar,
        "status" "scheme_status_enum" NOT NULL DEFAULT 'NOT_SUBMITTED',
        "submitted_at" TIMESTAMP,
        "approved_by_id" uuid,
        "approved_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_schemes_of_work" PRIMARY KEY ("id"),
        CONSTRAINT "FK_schemes_staff" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_schemes_approved_by" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ── Exams ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "exam_status_enum" AS ENUM('DRAFT', 'SET', 'MODERATED', 'APPROVED', 'COMPLETED');
      CREATE TYPE "exam_grade_enum" AS ENUM('A', 'B', 'C', 'D', 'F');

      CREATE TABLE "exams" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "term_id" varchar,
        "title" varchar NOT NULL,
        "subject_name" varchar,
        "subject_id" uuid,
        "class_ids" text,
        "total_marks" int NOT NULL DEFAULT 100,
        "duration_minutes" int,
        "exam_date" date,
        "venue" varchar,
        "set_by_id" uuid,
        "status" "exam_status_enum" NOT NULL DEFAULT 'DRAFT',
        "moderated_by_id" uuid,
        "approved_by_id" uuid,
        "moderation_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exams" PRIMARY KEY ("id"),
        CONSTRAINT "FK_exams_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_exams_subject" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_exams_set_by" FOREIGN KEY ("set_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      );

      CREATE TABLE "exam_results" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "exam_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "marks_obtained" numeric(6,2) NOT NULL DEFAULT 0,
        "grade" "exam_grade_enum",
        "remarks" text,
        "published_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exam_results" PRIMARY KEY ("id"),
        CONSTRAINT "FK_exam_results_exam" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_exam_results_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
      )
    `);

    // ── Staff Leave ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "staff_leave_type_enum" AS ENUM(
        'ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'COMPASSIONATE', 'STUDY', 'UNPAID'
      );
      CREATE TYPE "staff_leave_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

      CREATE TABLE "staff_leaves" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "staff_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "leave_type" "staff_leave_type_enum" NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "reason" text NOT NULL,
        "status" "staff_leave_status_enum" NOT NULL DEFAULT 'PENDING',
        "approved_by_id" uuid,
        "approved_at" TIMESTAMP,
        "rejection_reason" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_staff_leaves" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_leaves_staff" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_staff_leaves_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_staff_leaves_approved_by" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_leaves" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "exam_results" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "exams" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "schemes_of_work" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lesson_observations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "syllabus_progress" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "security_incidents" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gate_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_medical_history" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sick_bay_visits" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dorm_roll_call_entries" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dorm_roll_calls" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_leaves" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dorm_allocations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dorm_rooms" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dormitories" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "calendar_events" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "announcements" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "staff_leave_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "staff_leave_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "exam_grade_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "exam_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "scheme_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "roll_call_entry_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "roll_call_period_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "student_leave_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "student_leave_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "dorm_gender_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "sick_bay_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "incident_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "incident_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "gate_person_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "calendar_event_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "announcement_audience_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "announcement_category_enum"`);
  }
}
