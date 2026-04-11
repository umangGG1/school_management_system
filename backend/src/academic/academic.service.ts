import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolClass } from './entities/class.entity';
import { Subject } from './entities/subject.entity';
import { Assessment } from './entities/assessment.entity';
import { StudentAttendance, AttendanceStatus } from './entities/student-attendance.entity';
import { TimetableEntry, CoverLesson, CoverStatus } from './entities/timetable.entity';
import { LessonNote, LessonNoteStatus } from './entities/lesson-note.entity';

export interface ClassPerformance {
  classId: string;
  className: string;
  stream: string;
  studentCount: number;
  avgScore: number;
  passRate: number;
  trend: 'up' | 'down' | 'stable';
}

@Injectable()
export class AcademicService {
  constructor(
    @InjectRepository(SchoolClass)
    private readonly classRepo: Repository<SchoolClass>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
    @InjectRepository(Assessment)
    private readonly assessmentRepo: Repository<Assessment>,
    @InjectRepository(StudentAttendance)
    private readonly attendanceRepo: Repository<StudentAttendance>,
    @InjectRepository(TimetableEntry)
    private readonly timetableRepo: Repository<TimetableEntry>,
    @InjectRepository(CoverLesson)
    private readonly coverRepo: Repository<CoverLesson>,
    @InjectRepository(LessonNote)
    private readonly lessonNoteRepo: Repository<LessonNote>,
  ) {}

  // ── Classes ────────────────────────────────────────────────────────────────

  async findClassesBySchool(schoolId: string): Promise<SchoolClass[]> {
    return this.classRepo.find({
      where: { schoolId, isActive: true },
      order: { name: 'ASC', stream: 'ASC' },
    });
  }

  async createClass(data: Partial<SchoolClass>): Promise<SchoolClass> {
    return this.classRepo.save(this.classRepo.create(data));
  }

  async updateClass(id: string, schoolId: string, data: Partial<SchoolClass>): Promise<SchoolClass> {
    const cls = await this.classRepo.findOne({ where: { id, schoolId } });
    if (!cls) throw new NotFoundException('Class not found');
    return this.classRepo.save({ ...cls, ...data });
  }

  // ── Subjects ───────────────────────────────────────────────────────────────

  async findSubjects(schoolId: string): Promise<Subject[]> {
    return this.subjectRepo.find({ where: { schoolId }, order: { name: 'ASC' } });
  }

  async createSubject(data: Partial<Subject>): Promise<Subject> {
    return this.subjectRepo.save(this.subjectRepo.create(data));
  }

  // ── Performance ────────────────────────────────────────────────────────────

  async classPerformanceSummary(
    schoolId: string,
    term: string,
    academicYear: string,
  ): Promise<ClassPerformance[]> {
    const classes = await this.classRepo.find({
      where: { schoolId, isActive: true },
      order: { name: 'ASC' },
    });

    const results: ClassPerformance[] = [];

    for (const cls of classes) {
      const stats = await this.assessmentRepo
        .createQueryBuilder('a')
        .select('AVG(a.score / a.max_score * 100)', 'avg')
        .addSelect('COUNT(DISTINCT a.student_id)', 'studentCount')
        .where(
          'a.class_id = :classId AND a.school_id = :schoolId AND a.term = :term AND a.academic_year = :academicYear',
          { classId: cls.id, schoolId, term, academicYear },
        )
        .getRawOne();

      const passStats = await this.assessmentRepo
        .createQueryBuilder('a')
        .select('COUNT(DISTINCT a.student_id)', 'passCount')
        .where(
          'a.class_id = :classId AND a.school_id = :schoolId AND a.term = :term AND a.academic_year = :academicYear AND (a.score / a.max_score * 100) >= 50',
          { classId: cls.id, schoolId, term, academicYear },
        )
        .getRawOne();

      const avgScore = Math.round(Number(stats?.avg ?? 0));
      const studentCount = Number(stats?.studentCount ?? 0);
      const passCount = Number(passStats?.passCount ?? 0);
      const passRate = studentCount > 0 ? Math.round((passCount / studentCount) * 100) : 0;

      results.push({
        classId: cls.id,
        className: cls.name,
        stream: cls.stream ?? '',
        studentCount,
        avgScore,
        passRate,
        trend: avgScore >= 70 ? 'up' : avgScore >= 50 ? 'stable' : 'down',
      });
    }

    return results;
  }

  // ── Assessments / Marks ────────────────────────────────────────────────────

  async submitMark(data: Partial<Assessment>): Promise<Assessment> {
    const existing = await this.assessmentRepo.findOne({
      where: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        classId: data.classId,
        term: data.term,
        academicYear: data.academicYear,
        type: data.type,
      },
    });
    if (existing) {
      return this.assessmentRepo.save({ ...existing, score: data.score, maxScore: data.maxScore, enteredById: data.enteredById });
    }
    return this.assessmentRepo.save(this.assessmentRepo.create(data));
  }

  async bulkSubmitMarks(
    entries: Array<{ studentId: string; score: number }>,
    common: Partial<Assessment>,
  ): Promise<{ saved: number }> {
    let saved = 0;
    for (const e of entries) {
      await this.submitMark({ ...common, studentId: e.studentId, score: e.score });
      saved++;
    }
    return { saved };
  }

  async findMarks(schoolId: string, classId?: string, subjectId?: string, term?: string, academicYear?: string): Promise<Assessment[]> {
    const where: any = { schoolId };
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;
    return this.assessmentRepo.find({ where, relations: ['student', 'subject', 'enteredBy'], order: { createdAt: 'DESC' } });
  }

  async findStudentMarks(studentId: string, schoolId: string, term?: string, academicYear?: string): Promise<Assessment[]> {
    const where: any = { studentId, schoolId };
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;
    return this.assessmentRepo.find({ where, relations: ['subject', 'class'], order: { createdAt: 'DESC' } });
  }

  // ── Attendance ─────────────────────────────────────────────────────────────

  async markAttendance(
    entries: Array<{ studentId: string; status: AttendanceStatus }>,
    classId: string,
    schoolId: string,
    date: string,
    markedById: string,
  ): Promise<{ saved: number }> {
    let saved = 0;
    for (const entry of entries) {
      const existing = await this.attendanceRepo.findOne({
        where: { studentId: entry.studentId, classId, date, schoolId },
      });
      if (existing) {
        await this.attendanceRepo.save({ ...existing, status: entry.status, markedById });
      } else {
        await this.attendanceRepo.save(
          this.attendanceRepo.create({ studentId: entry.studentId, classId, schoolId, date, status: entry.status, markedById }),
        );
      }
      saved++;
    }
    return { saved };
  }

  async getAttendanceByClass(classId: string, schoolId: string, date: string): Promise<StudentAttendance[]> {
    return this.attendanceRepo.find({
      where: { classId, schoolId, date },
      relations: ['student', 'markedBy'],
    });
  }

  async getStudentAttendance(studentId: string, schoolId: string, from?: string, to?: string) {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .where('a.student_id = :studentId AND a.school_id = :schoolId', { studentId, schoolId });
    if (from) qb.andWhere('a.date >= :from', { from });
    if (to) qb.andWhere('a.date <= :to', { to });
    const records = await qb.orderBy('a.date', 'DESC').getMany();

    const total = records.length;
    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const late = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { records, summary: { total, present, absent, late, attendanceRate: rate } };
  }

  async getAttendanceSummaryByClass(classId: string, schoolId: string, term: string, academicYear: string) {
    const stats = await this.attendanceRepo
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.class_id = :classId AND a.school_id = :schoolId', { classId, schoolId })
      .groupBy('a.status')
      .getRawMany();

    const result: any = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const s of stats) {
      result[s.status.toLowerCase()] = Number(s.count);
    }
    const total = result.present + result.absent + result.late + result.excused;
    result.total = total;
    result.attendanceRate = total > 0 ? Math.round(((result.present + result.late) / total) * 100) : 0;
    return result;
  }

  // ── Timetable ──────────────────────────────────────────────────────────────

  async createTimetableEntry(data: Partial<TimetableEntry>): Promise<TimetableEntry> {
    return this.timetableRepo.save(this.timetableRepo.create(data));
  }

  async findTimetable(schoolId: string, classId?: string, teacherId?: string, term?: string, academicYear?: string): Promise<TimetableEntry[]> {
    const where: any = { schoolId, isActive: true };
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;
    return this.timetableRepo.find({
      where,
      relations: ['class', 'subject', 'teacher'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async updateTimetableEntry(id: string, schoolId: string, data: Partial<TimetableEntry>): Promise<TimetableEntry> {
    const entry = await this.timetableRepo.findOne({ where: { id, schoolId } });
    if (!entry) throw new NotFoundException('Timetable entry not found');
    return this.timetableRepo.save({ ...entry, ...data });
  }

  async deleteTimetableEntry(id: string, schoolId: string): Promise<{ success: boolean }> {
    const entry = await this.timetableRepo.findOne({ where: { id, schoolId } });
    if (!entry) throw new NotFoundException('Timetable entry not found');
    await this.timetableRepo.remove(entry);
    return { success: true };
  }

  // ── Cover Lessons ──────────────────────────────────────────────────────────

  async findCoverLessons(schoolId: string, date?: string): Promise<CoverLesson[]> {
    const where: any = { schoolId };
    if (date) where.date = date;
    return this.coverRepo.find({
      where,
      relations: ['timetableEntry', 'timetableEntry.class', 'timetableEntry.subject', 'absentTeacher', 'coverTeacher'],
      order: { date: 'DESC' },
    });
  }

  async createCoverLesson(data: Partial<CoverLesson>): Promise<CoverLesson> {
    return this.coverRepo.save(this.coverRepo.create(data));
  }

  async assignCoverTeacher(id: string, schoolId: string, coverTeacherId: string, assignedById: string): Promise<CoverLesson> {
    const cover = await this.coverRepo.findOne({ where: { id, schoolId } });
    if (!cover) throw new NotFoundException('Cover lesson not found');
    cover.coverTeacherId = coverTeacherId;
    cover.assignedById = assignedById;
    cover.status = CoverStatus.ASSIGNED;
    return this.coverRepo.save(cover);
  }

  // ── Lesson Notes ───────────────────────────────────────────────────────────

  async createLessonNote(data: Partial<LessonNote>): Promise<LessonNote> {
    return this.lessonNoteRepo.save(this.lessonNoteRepo.create(data));
  }

  async findLessonNotes(schoolId: string, classId?: string, subjectId?: string, teacherId?: string): Promise<LessonNote[]> {
    const where: any = { schoolId };
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.teacherId = teacherId;
    return this.lessonNoteRepo.find({
      where,
      relations: ['class', 'subject', 'teacher', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateLessonNote(id: string, schoolId: string, data: Partial<LessonNote>): Promise<LessonNote> {
    const note = await this.lessonNoteRepo.findOne({ where: { id, schoolId } });
    if (!note) throw new NotFoundException('Lesson note not found');
    return this.lessonNoteRepo.save({ ...note, ...data });
  }

  async submitLessonNote(id: string, schoolId: string): Promise<LessonNote> {
    return this.updateLessonNote(id, schoolId, { status: LessonNoteStatus.SUBMITTED });
  }

  async reviewLessonNote(id: string, schoolId: string, reviewedById: string, status: LessonNoteStatus, comment?: string): Promise<LessonNote> {
    return this.updateLessonNote(id, schoolId, { status, reviewedById, reviewerComment: comment });
  }
}
