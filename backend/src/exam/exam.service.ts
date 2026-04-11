import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ExamTimetable, ExamTimetableStatus } from './entities/exam-timetable.entity';
import { InvigilationAssignment } from './entities/invigilation.entity';
import { ExamMark, ExamGrade, MarkVerificationStatus } from './entities/exam-mark.entity';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(ExamTimetable)
    private readonly timetableRepo: Repository<ExamTimetable>,
    @InjectRepository(InvigilationAssignment)
    private readonly invigilationRepo: Repository<InvigilationAssignment>,
    @InjectRepository(ExamMark)
    private readonly markRepo: Repository<ExamMark>,
  ) {}

  // ── Timetable ──────────────────────────────────────────────────────────────

  async createTimetableSlot(data: Partial<ExamTimetable>): Promise<ExamTimetable> {
    return this.timetableRepo.save(this.timetableRepo.create(data));
  }

  async findTimetable(schoolId: string, term?: string, academicYear?: string): Promise<ExamTimetable[]> {
    const where: any = { schoolId };
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;
    return this.timetableRepo.find({
      where,
      relations: ['subject', 'createdBy'],
      order: { examDate: 'ASC', startTime: 'ASC' },
    });
  }

  async updateTimetableSlot(id: string, schoolId: string, data: Partial<ExamTimetable>): Promise<ExamTimetable> {
    const slot = await this.timetableRepo.findOne({ where: { id, schoolId } });
    if (!slot) throw new NotFoundException('Exam slot not found');
    return this.timetableRepo.save({ ...slot, ...data });
  }

  async deleteTimetableSlot(id: string, schoolId: string): Promise<{ success: boolean }> {
    const slot = await this.timetableRepo.findOne({ where: { id, schoolId } });
    if (!slot) throw new NotFoundException('Exam slot not found');
    await this.timetableRepo.remove(slot);
    return { success: true };
  }

  async publishTimetable(schoolId: string, term: string, academicYear: string): Promise<{ updated: number }> {
    const result = await this.timetableRepo.update(
      { schoolId, term, academicYear, status: ExamTimetableStatus.DRAFT },
      { status: ExamTimetableStatus.PUBLISHED },
    );
    return { updated: result.affected ?? 0 };
  }

  // ── Invigilation ───────────────────────────────────────────────────────────

  async assignInvigilator(data: Partial<InvigilationAssignment>): Promise<InvigilationAssignment> {
    return this.invigilationRepo.save(this.invigilationRepo.create(data));
  }

  async findInvigilation(schoolId: string, term?: string): Promise<InvigilationAssignment[]> {
    return this.invigilationRepo.find({
      where: { schoolId },
      relations: ['examSlot', 'invigilator'],
      order: { createdAt: 'DESC' },
    });
  }

  async removeInvigilation(id: string, schoolId: string): Promise<{ success: boolean }> {
    const assignment = await this.invigilationRepo.findOne({ where: { id, schoolId } });
    if (!assignment) throw new NotFoundException('Invigilation assignment not found');
    await this.invigilationRepo.remove(assignment);
    return { success: true };
  }

  // ── Marks ──────────────────────────────────────────────────────────────────

  private computeGrade(marks: number, total: number): ExamGrade {
    const pct = (marks / total) * 100;
    if (pct >= 80) return ExamGrade.D1;
    if (pct >= 70) return ExamGrade.D2;
    if (pct >= 65) return ExamGrade.C3;
    if (pct >= 60) return ExamGrade.C4;
    if (pct >= 55) return ExamGrade.C5;
    if (pct >= 50) return ExamGrade.C6;
    if (pct >= 45) return ExamGrade.P7;
    if (pct >= 40) return ExamGrade.P8;
    return ExamGrade.F9;
  }

  async enterMark(data: {
    examSlotId: string;
    studentId: string;
    schoolId: string;
    marksObtained: number;
    remarks?: string;
    enteredById: string;
  }): Promise<ExamMark> {
    const slot = await this.timetableRepo.findOne({ where: { id: data.examSlotId, schoolId: data.schoolId } });
    if (!slot) throw new NotFoundException('Exam slot not found');

    const existing = await this.markRepo.findOne({
      where: { examSlotId: data.examSlotId, studentId: data.studentId },
    });

    const grade = this.computeGrade(data.marksObtained, slot.totalMarks);
    const markData = {
      examSlotId: data.examSlotId,
      studentId: data.studentId,
      schoolId: data.schoolId,
      marksObtained: data.marksObtained,
      grade,
      remarks: data.remarks,
      enteredById: data.enteredById,
      verificationStatus: MarkVerificationStatus.PENDING,
    };

    if (existing) {
      return this.markRepo.save({ ...existing, ...markData });
    }
    return this.markRepo.save(this.markRepo.create(markData));
  }

  async bulkEnterMarks(
    entries: Array<{ studentId: string; marksObtained: number; remarks?: string }>,
    examSlotId: string,
    schoolId: string,
    enteredById: string,
  ): Promise<{ saved: number }> {
    let saved = 0;
    for (const entry of entries) {
      await this.enterMark({ examSlotId, schoolId, enteredById, ...entry });
      saved++;
    }
    return { saved };
  }

  async findMarks(schoolId: string, examSlotId?: string, studentId?: string): Promise<ExamMark[]> {
    const where: any = { schoolId };
    if (examSlotId) where.examSlotId = examSlotId;
    if (studentId) where.studentId = studentId;
    return this.markRepo.find({
      where,
      relations: ['student', 'examSlot', 'enteredBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async verifyMark(id: string, schoolId: string, verifiedById: string): Promise<ExamMark> {
    const mark = await this.markRepo.findOne({ where: { id, schoolId } });
    if (!mark) throw new NotFoundException('Mark not found');
    mark.verificationStatus = MarkVerificationStatus.VERIFIED;
    mark.verifiedById = verifiedById;
    mark.verifiedAt = new Date();
    return this.markRepo.save(mark);
  }

  async rejectMark(id: string, schoolId: string, verifiedById: string): Promise<ExamMark> {
    const mark = await this.markRepo.findOne({ where: { id, schoolId } });
    if (!mark) throw new NotFoundException('Mark not found');
    mark.verificationStatus = MarkVerificationStatus.REJECTED;
    mark.verifiedById = verifiedById;
    mark.verifiedAt = new Date();
    return this.markRepo.save(mark);
  }

  async publishMarks(examSlotId: string, schoolId: string): Promise<{ published: number }> {
    const marks = await this.markRepo.find({
      where: { examSlotId, schoolId, verificationStatus: MarkVerificationStatus.VERIFIED },
    });
    const now = new Date();
    for (const mark of marks) {
      mark.publishedAt = now;
    }
    await this.markRepo.save(marks);
    return { published: marks.length };
  }

  async getStudentResults(studentId: string, schoolId: string, term?: string, academicYear?: string) {
    const marks = await this.markRepo.find({
      where: { studentId, schoolId },
      relations: ['examSlot', 'examSlot.subject'],
      order: { createdAt: 'DESC' },
    });

    return marks.filter((m) => {
      if (!m.publishedAt) return false;
      if (term && m.examSlot?.term !== term) return false;
      if (academicYear && m.examSlot?.academicYear !== academicYear) return false;
      return true;
    });
  }

  async getExamSummary(schoolId: string, term: string, academicYear: string) {
    const slots = await this.timetableRepo.find({ where: { schoolId, term, academicYear } });
    const total = slots.length;
    const completed = slots.filter((s) => s.status === ExamTimetableStatus.COMPLETED).length;

    const markStats = await this.markRepo
      .createQueryBuilder('m')
      .select('COUNT(DISTINCT m.student_id)', 'studentsWithMarks')
      .addSelect('AVG(m.marks_obtained)', 'avgMarks')
      .where('m.school_id = :schoolId', { schoolId })
      .getRawOne();

    return {
      totalSlots: total,
      completedSlots: completed,
      studentsWithMarks: Number(markStats?.studentsWithMarks ?? 0),
      avgMarks: Math.round(Number(markStats?.avgMarks ?? 0)),
    };
  }
}
