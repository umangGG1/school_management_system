import { MigrationInterface, QueryRunner } from 'typeorm';

export class EcaParents1000000000006 implements MigrationInterface {
  name = 'EcaParents1000000000006';

  async up(queryRunner: QueryRunner): Promise<void> {

    // ── ECA Activities ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "eca_activities" (
        "id"           uuid         NOT NULL DEFAULT gen_random_uuid(),
        "school_id"    uuid         NOT NULL,
        "name"         varchar(120) NOT NULL,
        "icon"         varchar(10),
        "category"     varchar(30)  NOT NULL DEFAULT 'CLUB',
        "patron_id"    uuid,
        "patron_name"  varchar(100),
        "meeting_day"  varchar(60),
        "venue"        varchar(100),
        "is_active"    boolean      NOT NULL DEFAULT true,
        "member_count" int          NOT NULL DEFAULT 0,
        "created_at"   TIMESTAMP    NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eca_activities" PRIMARY KEY ("id")
      );
      CREATE INDEX IF NOT EXISTS "idx_eca_activities_school"
        ON "eca_activities"("school_id", "is_active");
      CREATE INDEX IF NOT EXISTS "idx_eca_activities_category"
        ON "eca_activities"("school_id", "category");
    `);

    // ── ECA Competitions ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "eca_competitions" (
        "id"                 uuid         NOT NULL DEFAULT gen_random_uuid(),
        "school_id"          uuid         NOT NULL,
        "activity_id"        uuid,
        "activity_name"      varchar(100) NOT NULL,
        "event_name"         varchar(150) NOT NULL,
        "event_date"         date,
        "opponent"           varchar(120),
        "is_home"            boolean      NOT NULL DEFAULT true,
        "venue"              varchar(120),
        "result"             varchar(10),
        "score"              varchar(30),
        "man_of_match"       varchar(100),
        "status"             varchar(20)  NOT NULL DEFAULT 'UPCOMING',
        "entry_fee"          int          NOT NULL DEFAULT 0,
        "transport_arranged" boolean      NOT NULL DEFAULT false,
        "notes"              text,
        "created_at"         TIMESTAMP    NOT NULL DEFAULT now(),
        "updated_at"         TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eca_competitions" PRIMARY KEY ("id")
      );
      CREATE INDEX IF NOT EXISTS "idx_eca_competitions_school"
        ON "eca_competitions"("school_id", "event_date" DESC);
      CREATE INDEX IF NOT EXISTS "idx_eca_competitions_activity"
        ON "eca_competitions"("activity_id");
    `);

    // ── ECA Attendance ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "eca_attendance" (
        "id"           uuid        NOT NULL DEFAULT gen_random_uuid(),
        "school_id"    uuid        NOT NULL,
        "activity_id"  uuid        NOT NULL,
        "student_id"   uuid        NOT NULL,
        "session_date" date        NOT NULL,
        "status"       varchar(10) NOT NULL DEFAULT 'PRESENT',
        "notes"        text,
        "created_at"   TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eca_attendance" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_eca_att_activity_student_date"
          UNIQUE ("activity_id","student_id","session_date")
      );
      CREATE INDEX IF NOT EXISTS "idx_eca_attendance_school_activity"
        ON "eca_attendance"("school_id","activity_id","session_date" DESC);
      CREATE INDEX IF NOT EXISTS "idx_eca_attendance_student"
        ON "eca_attendance"("student_id","school_id");
    `);

  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "eca_attendance"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "eca_competitions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "eca_activities"`);
  }
}
