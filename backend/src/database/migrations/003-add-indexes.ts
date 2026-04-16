import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1000000000003 implements MigrationInterface {
  name = 'AddIndexes1000000000003';

  // CONCURRENTLY cannot run inside a transaction — disable it for this migration
  public transaction = false;

  async up(queryRunner: QueryRunner): Promise<void> {
    // ── USERS ──────────────────────────────────────────────────────────────────
    // school_id used in every role-scoped query
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_school_id
      ON users(school_id)
    `);

    // ── SCHOOL CLASSES ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_school_classes_school_active
      ON school_classes(school_id, is_active)
    `);

    // ── SUBJECTS ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subjects_school_id
      ON subjects(school_id)
    `);

    // ── STUDENTS ───────────────────────────────────────────────────────────────
    // Composite index for the most common query: list active students in a school
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_school_active
      ON students(school_id, is_active)
    `);
    // Class roster lookup
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_class_school
      ON students(class_id, school_id)
    `);

    // ── STUDENT DISCIPLINE ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_discipline_school
      ON student_discipline(school_id, status)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_discipline_student
      ON student_discipline(student_id)
    `);

    // ── STUDENT ATTENDANCE ─────────────────────────────────────────────────────
    // This table grows 1M+ rows/year — all three indexes are critical
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_attendance_school_date
      ON student_attendance(school_id, date DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_attendance_class_date
      ON student_attendance(class_id, date DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_attendance_student_date
      ON student_attendance(student_id, date DESC)
    `);

    // ── ASSESSMENTS ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_class_subject_term
      ON assessments(class_id, subject_id, term, academic_year)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_student
      ON assessments(student_id, school_id)
    `);

    // ── TIMETABLE ENTRIES ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timetable_entries_school_class
      ON timetable_entries(school_id, class_id)
    `);

    // ── LESSON NOTES ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_notes_school_staff
      ON lesson_notes(school_id, staff_id)
    `);

    // ── STAFF MEMBERS ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_members_school_active
      ON staff_members(school_id, is_active)
    `);

    // ── STAFF ATTENDANCE ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_attendance_school_date
      ON staff_attendance(school_id, date DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_attendance_staff_date
      ON staff_attendance(staff_id, date DESC)
    `);

    // ── STAFF LEAVES ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_leaves_school_status
      ON staff_leaves(school_id, status)
    `);

    // ── STAFF ACTIONS ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_actions_school
      ON staff_actions(school_id)
    `);

    // ── FEE STRUCTURES ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fee_structures_school_term
      ON fee_structures(school_id, term, academic_year)
    `);

    // ── INVOICES ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_school_term
      ON invoices(school_id, term, academic_year)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_student_status
      ON invoices(student_id, status)
    `);

    // ── PAYMENTS ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_school_date
      ON payments(school_id, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_invoice
      ON payments(invoice_id)
    `);

    // ── EXPENSES ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_school_status
      ON expenses(school_id, status, created_at DESC)
    `);

    // ── APPROVALS ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_approvals_school_status
      ON approvals(school_id, status)
    `);

    // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
    // user_id column is named "user_id" in the notifications table (from migration)
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read
      ON notifications(user_id, is_read, created_at DESC)
    `);

    // ── ACTIVITY LOGS ──────────────────────────────────────────────────────────
    // Unbounded audit trail — two separate indexes for the two main query patterns
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_school_date
      ON activity_logs(school_id, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_type
      ON activity_logs(school_id, type, created_at DESC)
    `);

    // ── ANNOUNCEMENTS ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_school_pinned
      ON announcements(school_id, is_pinned, is_deleted)
    `);

    // ── CALENDAR EVENTS ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_school_date
      ON calendar_events(school_id, date, is_deleted)
    `);

    // ── MESSAGES ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_to_user_status
      ON messages(to_user_id, status, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_from_user
      ON messages(from_user_id, created_at DESC)
    `);

    // ── EXAMS ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exams_school_status
      ON exams(school_id, status)
    `);

    // ── EXAM TIMETABLE ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_timetable_school
      ON exam_timetable(school_id, exam_date)
    `);

    // ── EXAM MARKS ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_marks_timetable_student
      ON exam_marks(exam_timetable_id, student_id)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_marks_student_school
      ON exam_marks(student_id, school_id)
    `);

    // ── EXAM RESULTS ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_results_exam_student
      ON exam_results(exam_id, student_id)
    `);

    // ── SICK BAY VISITS ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sick_bay_visits_school_status
      ON sick_bay_visits(school_id, status, visit_date DESC)
    `);

    // ── HOSPITAL REFERRALS ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hospital_referrals_school
      ON hospital_referrals(school_id, created_at DESC)
    `);

    // ── GATE LOGS ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gate_logs_school_date
      ON gate_logs(school_id, created_at DESC)
    `);

    // ── SECURITY INCIDENTS ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_school_status
      ON security_incidents(school_id, status, created_at DESC)
    `);

    // ── DORM ALLOCATIONS ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dorm_allocations_student
      ON dorm_allocations(student_id, school_id)
    `);

    // ── STUDENT LEAVES ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_leaves_school_status
      ON student_leaves(school_id, status)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_leaves_student
      ON student_leaves(student_id, status)
    `);

    // ── DORM ROLL CALLS ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dorm_roll_calls_school_date
      ON dorm_roll_calls(school_id, date DESC)
    `);

    // ── COUNSELING CASES ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_counseling_cases_school_status
      ON counseling_cases(school_id, status)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_counseling_cases_student
      ON counseling_cases(student_id)
    `);

    // ── COUNSELING SESSIONS ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_counseling_sessions_school
      ON counseling_sessions(school_id, session_date DESC)
    `);

    // ── SYLLABUS PROGRESS ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_syllabus_progress_school_staff
      ON syllabus_progress(school_id, staff_id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const indexes = [
      'idx_users_school_id',
      'idx_school_classes_school_active',
      'idx_subjects_school_id',
      'idx_students_school_active',
      'idx_students_class_school',
      'idx_student_discipline_school',
      'idx_student_discipline_student',
      'idx_student_attendance_school_date',
      'idx_student_attendance_class_date',
      'idx_student_attendance_student_date',
      'idx_assessments_class_subject_term',
      'idx_assessments_student',
      'idx_timetable_entries_school_class',
      'idx_lesson_notes_school_staff',
      'idx_staff_members_school_active',
      'idx_staff_attendance_school_date',
      'idx_staff_attendance_staff_date',
      'idx_staff_leaves_school_status',
      'idx_staff_actions_school',
      'idx_fee_structures_school_term',
      'idx_invoices_school_term',
      'idx_invoices_student_status',
      'idx_payments_school_date',
      'idx_payments_invoice',
      'idx_expenses_school_status',
      'idx_approvals_school_status',
      'idx_notifications_user_read',
      'idx_activity_logs_school_date',
      'idx_activity_logs_type',
      'idx_announcements_school_pinned',
      'idx_calendar_events_school_date',
      'idx_messages_to_user_status',
      'idx_messages_from_user',
      'idx_exams_school_status',
      'idx_exam_timetable_school',
      'idx_exam_marks_timetable_student',
      'idx_exam_marks_student_school',
      'idx_exam_results_exam_student',
      'idx_sick_bay_visits_school_status',
      'idx_hospital_referrals_school',
      'idx_gate_logs_school_date',
      'idx_security_incidents_school_status',
      'idx_dorm_allocations_student',
      'idx_student_leaves_school_status',
      'idx_student_leaves_student',
      'idx_dorm_roll_calls_school_date',
      'idx_counseling_cases_school_status',
      'idx_counseling_cases_student',
      'idx_counseling_sessions_school',
      'idx_syllabus_progress_school_staff',
    ];

    for (const idx of indexes) {
      await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS ${idx}`);
    }
  }
}
