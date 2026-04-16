import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewModules1000000000004 implements MigrationInterface {
  name = 'NewModules1000000000004';

  async up(queryRunner: QueryRunner): Promise<void> {

    // ── Payroll ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "payroll_run_status_enum"  AS ENUM('DRAFT','APPROVED','PAID','CANCELLED');
      CREATE TYPE "payment_method_enum"      AS ENUM('BANK','MOBILE_MONEY','CASH');
      CREATE TYPE "component_type_enum"      AS ENUM('BASE','HOUSING','TRANSPORT','MEDICAL','SACCO','OTHER');

      CREATE TABLE "payroll_runs" (
        "id"            uuid    NOT NULL DEFAULT gen_random_uuid(),
        "school_id"     uuid    NOT NULL,
        "month"         varchar(7) NOT NULL,
        "status"        "payroll_run_status_enum" NOT NULL DEFAULT 'DRAFT',
        "total_gross"   numeric(15,2) NOT NULL DEFAULT 0,
        "total_net"     numeric(15,2) NOT NULL DEFAULT 0,
        "total_paye"    numeric(15,2) NOT NULL DEFAULT 0,
        "total_nssf"    numeric(15,2) NOT NULL DEFAULT 0,
        "run_by"        uuid,
        "approved_by"   uuid,
        "processed_at"  TIMESTAMP,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payroll_runs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payroll_school_month" UNIQUE ("school_id","month"),
        CONSTRAINT "FK_payroll_runs_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );

      CREATE TABLE "payslips" (
        "id"               uuid    NOT NULL DEFAULT gen_random_uuid(),
        "payroll_run_id"   uuid    NOT NULL,
        "staff_member_id"  uuid    NOT NULL,
        "school_id"        uuid    NOT NULL,
        "gross_salary"     numeric(15,2) NOT NULL,
        "paye_deduction"   numeric(15,2) NOT NULL DEFAULT 0,
        "nssf_employee"    numeric(15,2) NOT NULL DEFAULT 0,
        "nssf_employer"    numeric(15,2) NOT NULL DEFAULT 0,
        "sacco_deduction"  numeric(15,2) NOT NULL DEFAULT 0,
        "other_deductions" numeric(15,2) NOT NULL DEFAULT 0,
        "net_pay"          numeric(15,2) NOT NULL,
        "payment_method"   "payment_method_enum" NOT NULL DEFAULT 'BANK',
        "payment_ref"      varchar,
        "pdf_url"          varchar,
        "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payslips" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payslips_run" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_payslips_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_payslips_staff_school ON payslips(staff_member_id, school_id, created_at DESC);

      CREATE TABLE "salary_components" (
        "id"               uuid    NOT NULL DEFAULT gen_random_uuid(),
        "staff_member_id"  uuid    NOT NULL,
        "school_id"        uuid    NOT NULL,
        "component_type"   "component_type_enum" NOT NULL,
        "amount"           numeric(15,2) NOT NULL,
        "is_active"        boolean NOT NULL DEFAULT true,
        "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_salary_components" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_salary_component_staff_type" UNIQUE ("staff_member_id","component_type"),
        CONSTRAINT "FK_salary_components_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );

      CREATE TABLE "paye_brackets" (
        "id"             uuid    NOT NULL DEFAULT gen_random_uuid(),
        "country"        varchar(2) NOT NULL DEFAULT 'UG',
        "min_income"     numeric(15,2) NOT NULL,
        "max_income"     numeric(15,2),
        "rate"           numeric(5,4) NOT NULL,
        "fixed_amount"   numeric(15,2) NOT NULL DEFAULT 0,
        "effective_from" date NOT NULL,
        "created_at"     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_paye_brackets" PRIMARY KEY ("id")
      );
    `);

    // ── Facilities ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "asset_category_enum"    AS ENUM('FURNITURE','EQUIPMENT','VEHICLE','LAB','OTHER');
      CREATE TYPE "asset_condition_enum"   AS ENUM('NEW','GOOD','FAIR','POOR');
      CREATE TYPE "booking_status_enum"    AS ENUM('PENDING','APPROVED','CANCELLED');
      CREATE TYPE "maint_priority_enum"    AS ENUM('LOW','MEDIUM','HIGH','CRITICAL');
      CREATE TYPE "maint_status_enum"      AS ENUM('OPEN','IN_PROGRESS','RESOLVED');

      CREATE TABLE "assets" (
        "id"              uuid    NOT NULL DEFAULT gen_random_uuid(),
        "school_id"       uuid    NOT NULL,
        "name"            varchar NOT NULL,
        "description"     text,
        "category"        "asset_category_enum"  NOT NULL DEFAULT 'OTHER',
        "quantity"        int     NOT NULL DEFAULT 1,
        "unit_cost"       numeric(15,2),
        "location"        varchar,
        "serial_number"   varchar,
        "condition"       "asset_condition_enum" NOT NULL DEFAULT 'GOOD',
        "purchased_at"    date,
        "warranty_expiry" date,
        "is_active"       boolean NOT NULL DEFAULT true,
        "created_at"      TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_assets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_assets_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_assets_school_category ON assets(school_id, category);

      CREATE TABLE "facility_bookings" (
        "id"            uuid    NOT NULL DEFAULT gen_random_uuid(),
        "school_id"     uuid    NOT NULL,
        "facility_name" varchar NOT NULL,
        "booked_by"     uuid,
        "booking_date"  date    NOT NULL,
        "start_time"    varchar NOT NULL,
        "end_time"      varchar NOT NULL,
        "purpose"       text,
        "status"        "booking_status_enum" NOT NULL DEFAULT 'PENDING',
        "approved_by"   uuid,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_facility_bookings" PRIMARY KEY ("id"),
        CONSTRAINT "FK_facility_bookings_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_facility_bookings_school_date ON facility_bookings(school_id, booking_date);

      CREATE TABLE "maintenance_requests" (
        "id"               uuid    NOT NULL DEFAULT gen_random_uuid(),
        "school_id"        uuid    NOT NULL,
        "asset_id"         uuid,
        "reported_by"      uuid,
        "description"      text    NOT NULL,
        "priority"         "maint_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "status"           "maint_status_enum"   NOT NULL DEFAULT 'OPEN',
        "resolved_by"      uuid,
        "resolved_at"      TIMESTAMP,
        "resolution_notes" text,
        "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_maintenance_requests" PRIMARY KEY ("id"),
        CONSTRAINT "FK_maintenance_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_maintenance_school_status ON maintenance_requests(school_id, status);
    `);

    // ── Uniform ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "uniform_gender_enum"    AS ENUM('MALE','FEMALE','UNISEX');
      CREATE TYPE "uniform_size_enum"      AS ENUM('XS','S','M','L','XL','XXL','XXXL');
      CREATE TYPE "alloc_condition_enum"   AS ENUM('NEW','GOOD','WORN');

      CREATE TABLE "uniform_items" (
        "id"         uuid    NOT NULL DEFAULT gen_random_uuid(),
        "school_id"  uuid    NOT NULL,
        "name"       varchar NOT NULL,
        "gender"     "uniform_gender_enum" NOT NULL DEFAULT 'UNISEX',
        "unit_price" numeric(12,2) NOT NULL,
        "supplier"   varchar,
        "is_active"  boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_uniform_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_uniform_items_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );

      CREATE TABLE "uniform_stock" (
        "id"                uuid    NOT NULL DEFAULT gen_random_uuid(),
        "uniform_item_id"   uuid    NOT NULL,
        "school_id"         uuid    NOT NULL,
        "size"              "uniform_size_enum" NOT NULL,
        "quantity_in_stock" int     NOT NULL DEFAULT 0,
        "reorder_level"     int     NOT NULL DEFAULT 5,
        "last_updated"      TIMESTAMP,
        "created_at"        TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_uniform_stock" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_uniform_stock_item_size" UNIQUE ("uniform_item_id","size"),
        CONSTRAINT "FK_uniform_stock_item" FOREIGN KEY ("uniform_item_id") REFERENCES "uniform_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_uniform_stock_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_uniform_stock_school ON uniform_stock(school_id, quantity_in_stock);

      CREATE TABLE "uniform_allocations" (
        "id"               uuid    NOT NULL DEFAULT gen_random_uuid(),
        "student_id"       uuid    NOT NULL,
        "school_id"        uuid    NOT NULL,
        "uniform_item_id"  uuid    NOT NULL,
        "uniform_stock_id" uuid    NOT NULL,
        "size"             "uniform_size_enum" NOT NULL,
        "quantity"         int     NOT NULL DEFAULT 1,
        "issued_at"        TIMESTAMP NOT NULL DEFAULT now(),
        "issued_by"        uuid,
        "returned_at"      TIMESTAMP,
        "condition"        "alloc_condition_enum",
        "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_uniform_allocations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_uniform_alloc_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_uniform_alloc_student ON uniform_allocations(student_id, school_id);
    `);

    // ── Store ──────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "store_category_enum"      AS ENUM('STATIONERY','EQUIPMENT','CLEANING','SPORTS','OTHER');
      CREATE TYPE "movement_type_enum"       AS ENUM('IN','OUT','ADJUSTMENT');
      CREATE TYPE "requisition_status_enum"  AS ENUM('PENDING','APPROVED','PARTIALLY_FULFILLED','FULFILLED','REJECTED');

      CREATE TABLE "store_items" (
        "id"                 uuid    NOT NULL DEFAULT gen_random_uuid(),
        "school_id"          uuid    NOT NULL,
        "name"               varchar NOT NULL,
        "code"               varchar,
        "category"           "store_category_enum" NOT NULL DEFAULT 'OTHER',
        "unit"               varchar NOT NULL DEFAULT 'piece',
        "quantity_in_stock"  int     NOT NULL DEFAULT 0,
        "reorder_level"      int     NOT NULL DEFAULT 5,
        "unit_cost"          numeric(12,2),
        "is_active"          boolean NOT NULL DEFAULT true,
        "created_at"         TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"         TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_store_items" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_store_item_school_code" UNIQUE ("school_id","code"),
        CONSTRAINT "FK_store_items_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_store_items_school_stock ON store_items(school_id, quantity_in_stock);

      CREATE TABLE "stock_movements" (
        "id"             uuid    NOT NULL DEFAULT gen_random_uuid(),
        "store_item_id"  uuid    NOT NULL,
        "school_id"      uuid    NOT NULL,
        "type"           "movement_type_enum" NOT NULL,
        "quantity"       int     NOT NULL,
        "reason"         varchar,
        "performed_by"   uuid,
        "requisition_id" uuid,
        "created_at"     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_movements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_stock_movements_item"   FOREIGN KEY ("store_item_id") REFERENCES "store_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_stock_movements_school" FOREIGN KEY ("school_id")    REFERENCES "schools"("id")    ON DELETE CASCADE
      );
      CREATE INDEX idx_stock_movements_item ON stock_movements(store_item_id, created_at DESC);

      CREATE TABLE "requisitions" (
        "id"           uuid    NOT NULL DEFAULT gen_random_uuid(),
        "school_id"    uuid    NOT NULL,
        "requested_by" uuid,
        "department"   varchar,
        "status"       "requisition_status_enum" NOT NULL DEFAULT 'PENDING',
        "notes"        text,
        "reviewed_by"  uuid,
        "reviewed_at"  TIMESTAMP,
        "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_requisitions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_requisitions_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_requisitions_school_status ON requisitions(school_id, status);

      CREATE TABLE "requisition_items" (
        "id"                  uuid    NOT NULL DEFAULT gen_random_uuid(),
        "requisition_id"      uuid    NOT NULL,
        "store_item_id"       uuid    NOT NULL,
        "quantity_requested"  int     NOT NULL,
        "quantity_issued"     int     NOT NULL DEFAULT 0,
        "notes"               text,
        "created_at"          TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_requisition_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_req_items_requisition" FOREIGN KEY ("requisition_id") REFERENCES "requisitions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_req_items_store_item"  FOREIGN KEY ("store_item_id")  REFERENCES "store_items"("id") ON DELETE RESTRICT
      );
    `);

    // ── SEN ────────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "sen_category_enum"      AS ENUM('LEARNING_DISABILITY','PHYSICAL','VISUAL','HEARING','SPEECH','BEHAVIOURAL','OTHER');
      CREATE TYPE "sen_record_status_enum" AS ENUM('ACTIVE','CLOSED');
      CREATE TYPE "plan_status_enum"       AS ENUM('ACTIVE','EXPIRED','CANCELLED');

      CREATE TABLE "sen_records" (
        "id"              uuid    NOT NULL DEFAULT gen_random_uuid(),
        "student_id"      uuid    NOT NULL,
        "school_id"       uuid    NOT NULL,
        "category"        "sen_category_enum"      NOT NULL,
        "identified_at"   date    NOT NULL,
        "identified_by"   uuid,
        "status"          "sen_record_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "notes"           text,
        "created_at"      TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sen_records" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sen_records_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_sen_records_student ON sen_records(student_id, school_id, status);

      CREATE TABLE "sen_observations" (
        "id"               uuid    NOT NULL DEFAULT gen_random_uuid(),
        "sen_record_id"    uuid    NOT NULL,
        "student_id"       uuid    NOT NULL,
        "school_id"        uuid    NOT NULL,
        "observed_by"      uuid,
        "observation_date" date    NOT NULL,
        "notes"            text    NOT NULL,
        "academic_impact"  text,
        "behaviour_notes"  text,
        "recommendations"  text,
        "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sen_observations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sen_obs_record" FOREIGN KEY ("sen_record_id") REFERENCES "sen_records"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sen_obs_school"  FOREIGN KEY ("school_id")    REFERENCES "schools"("id")    ON DELETE CASCADE
      );

      CREATE TABLE "accommodation_plans" (
        "id"           uuid    NOT NULL DEFAULT gen_random_uuid(),
        "sen_record_id" uuid   NOT NULL,
        "student_id"   uuid    NOT NULL,
        "school_id"    uuid    NOT NULL,
        "created_by"   uuid,
        "plan"         text    NOT NULL,
        "review_date"  date,
        "status"       "plan_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_accommodation_plans" PRIMARY KEY ("id"),
        CONSTRAINT "FK_acc_plans_record" FOREIGN KEY ("sen_record_id") REFERENCES "sen_records"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_acc_plans_school"  FOREIGN KEY ("school_id")    REFERENCES "schools"("id")    ON DELETE CASCADE
      );
    `);

    // ── Gate ───────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "gate_pass_status_enum" AS ENUM('PENDING','APPROVED','USED','EXPIRED','REVOKED');

      CREATE TABLE "gate_passes" (
        "id"            uuid    NOT NULL DEFAULT gen_random_uuid(),
        "school_id"     uuid    NOT NULL,
        "student_id"    uuid    NOT NULL,
        "requested_by"  uuid,
        "pass_code"     varchar(6),
        "reason"        text,
        "authorized_by" uuid,
        "valid_from"    TIMESTAMP,
        "valid_until"   TIMESTAMP,
        "status"        "gate_pass_status_enum" NOT NULL DEFAULT 'PENDING',
        "used_at"       TIMESTAMP,
        "returned_at"   TIMESTAMP,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gate_passes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_gate_passes_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE UNIQUE INDEX idx_gate_passes_school_code
        ON gate_passes(school_id, pass_code)
        WHERE status IN ('APPROVED','USED');
      CREATE INDEX idx_gate_passes_school_status ON gate_passes(school_id, status, created_at DESC);

      CREATE TABLE "visitor_logs" (
        "id"             uuid    NOT NULL DEFAULT gen_random_uuid(),
        "school_id"      uuid    NOT NULL,
        "visitor_name"   varchar NOT NULL,
        "visitor_phone"  varchar,
        "national_id"    varchar,
        "host_name"      varchar,
        "host_dept"      varchar,
        "purpose"        varchar,
        "vehicle_reg"    varchar,
        "entry_time"     TIMESTAMP,
        "exit_time"      TIMESTAMP,
        "badge_number"   varchar,
        "registered_by"  uuid,
        "created_at"     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_visitor_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_visitor_logs_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX idx_visitor_logs_school_entry ON visitor_logs(school_id, entry_time DESC);
    `);

    // ── PAYE Brackets Seed Data (Uganda FY 2024/25) ────────────────────────────
    await queryRunner.query(`
      INSERT INTO paye_brackets (country, min_income, max_income, rate, fixed_amount, effective_from) VALUES
        ('UG',         0,    235000, 0.00,      0,       '2024-07-01'),
        ('UG',    235001,    335000, 0.10,      0,       '2024-07-01'),
        ('UG',    335001,    410000, 0.20,  10000,       '2024-07-01'),
        ('UG',    410001, 10000000, 0.30,  25000,       '2024-07-01'),
        ('UG',  10000001,      NULL, 0.40, 2857000,     '2024-07-01')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse dependency order
    await queryRunner.query(`DROP TABLE IF EXISTS "visitor_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gate_passes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "accommodation_plans" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sen_observations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sen_records" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "requisition_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "requisitions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_movements" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "store_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "uniform_allocations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "uniform_stock" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "uniform_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "maintenance_requests" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "facility_bookings" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "assets" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "salary_components" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payslips" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "paye_brackets" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payroll_runs" CASCADE`);
    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "gate_pass_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "plan_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "sen_record_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "sen_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "requisition_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "movement_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "store_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "alloc_condition_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "uniform_size_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "uniform_gender_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "maint_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "maint_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "booking_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "asset_condition_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "asset_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "component_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payroll_run_status_enum"`);
  }
}
