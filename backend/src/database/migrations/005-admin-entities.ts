import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminEntities1000000000005 implements MigrationInterface {
  name = 'AdminEntities1000000000005';

  async up(queryRunner: QueryRunner): Promise<void> {
    // ── Academic Terms ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "term_status_enum" AS ENUM('upcoming', 'current', 'completed');

      CREATE TABLE "academic_terms" (
        "id"            uuid        NOT NULL DEFAULT gen_random_uuid(),
        "school_id"     uuid        NOT NULL,
        "name"          varchar     NOT NULL,
        "start_date"    date        NOT NULL,
        "end_date"      date        NOT NULL,
        "weeks"         int         NOT NULL DEFAULT 12,
        "status"        "term_status_enum" NOT NULL DEFAULT 'upcoming',
        "academic_year" varchar,
        "created_at"    TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_academic_terms" PRIMARY KEY ("id"),
        CONSTRAINT "FK_academic_terms_school" FOREIGN KEY ("school_id")
          REFERENCES "schools"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_academic_terms_school ON academic_terms(school_id, status)
    `);

    // ── Support Tickets ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "ticket_status_enum"   AS ENUM('open', 'in_progress', 'resolved', 'closed');
      CREATE TYPE "ticket_priority_enum" AS ENUM('low', 'medium', 'high', 'critical');
      CREATE TYPE "ticket_category_enum" AS ENUM('account', 'billing', 'bug', 'upload', 'feature', 'other');

      CREATE TABLE "support_tickets" (
        "id"             uuid                  NOT NULL DEFAULT gen_random_uuid(),
        "school_id"      uuid                  NOT NULL,
        "title"          varchar               NOT NULL,
        "description"    text,
        "status"         "ticket_status_enum"   NOT NULL DEFAULT 'open',
        "priority"       "ticket_priority_enum" NOT NULL DEFAULT 'medium',
        "category"       "ticket_category_enum" NOT NULL DEFAULT 'other',
        "reporter_name"  varchar,
        "reporter_role"  varchar,
        "reporter_id"    uuid,
        "assigned_to_id" uuid,
        "reply"          text,
        "resolved_at"    TIMESTAMP,
        "created_at"     TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_tickets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_support_tickets_school"      FOREIGN KEY ("school_id")      REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_support_tickets_reporter"    FOREIGN KEY ("reporter_id")    REFERENCES "users"("id")   ON DELETE SET NULL,
        CONSTRAINT "FK_support_tickets_assigned_to" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id")   ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_support_tickets_school_status ON support_tickets(school_id, status)
    `);

    // ── Integration Configs ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "integration_provider_enum" AS ENUM('sms', 'email', 'payments', 'backup', 'moes', 'uca');
      CREATE TYPE "integration_status_enum"   AS ENUM('connected', 'pending', 'disconnected', 'error');

      CREATE TABLE "integration_configs" (
        "id"             uuid                        NOT NULL DEFAULT gen_random_uuid(),
        "school_id"      uuid                        NOT NULL,
        "provider"       "integration_provider_enum" NOT NULL,
        "name"           varchar                     NOT NULL,
        "status"         "integration_status_enum"   NOT NULL DEFAULT 'disconnected',
        "is_enabled"     boolean                     NOT NULL DEFAULT false,
        "config"         jsonb,
        "icon"           varchar,
        "last_tested_at" TIMESTAMP,
        "created_at"     TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_integration_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_integration_school_provider" UNIQUE ("school_id", "provider"),
        CONSTRAINT "FK_integration_configs_school" FOREIGN KEY ("school_id")
          REFERENCES "schools"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "integration_configs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "support_tickets" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "academic_terms" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "integration_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "integration_provider_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "term_status_enum"`);
  }
}
