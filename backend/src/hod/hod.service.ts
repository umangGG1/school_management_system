import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Department, SyllabusProgress, LessonObservation, SchemeOfWork, SchemeStatus,
} from './entities/hod.entities';

@Injectable()
export class HodService {
  constructor(
    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,
    @InjectRepository(SyllabusProgress) private readonly syllabusRepo: Repository<SyllabusProgress>,
    @InjectRepository(LessonObservation) private readonly obsRepo: Repository<LessonObservation>,
    @InjectRepository(SchemeOfWork) private readonly schemeRepo: Repository<SchemeOfWork>,
  ) {}

  // ─── Departments ──────────────────────────────────────────────────────────
  async findDepartments(schoolId: string): Promise<Department[]> {
    return this.deptRepo.find({ where: { schoolId }, relations: ['hod'] });
  }

  async createDepartment(schoolId: string, data: Partial<Department>): Promise<Department> {
    return this.deptRepo.save(this.deptRepo.create({ ...data, schoolId }));
  }

  async findDeptTeachers(deptId: string, schoolId: string) {
    // Returns the HOD's staff — in production, join via TeacherSubjectAssignment
    const dept = await this.deptRepo.findOne({ where: { id: deptId, schoolId }, relations: ['hod'] });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  // ─── Syllabus ─────────────────────────────────────────────────────────────
  async findSyllabus(schoolId: string, staffId?: string) {
    const where: any = { schoolId };
    if (staffId) where.staffId = staffId;
    return this.syllabusRepo.find({ where, relations: ['staff', 'subject', 'schoolClass'] });
  }

  async updateSyllabus(schoolId: string, staffId: string, dto: Partial<SyllabusProgress>): Promise<SyllabusProgress> {
    let record = await this.syllabusRepo.findOne({
      where: { schoolId, staffId, subjectId: dto.subjectId, classId: dto.classId, termId: dto.termId },
    });
    if (!record) record = this.syllabusRepo.create({ schoolId, staffId });
    Object.assign(record, dto);
    if (record.topicsPlanned > 0) {
      record.coveragePercent = Math.round((record.topicsCovered / record.topicsPlanned) * 100);
    }
    return this.syllabusRepo.save(record);
  }

  // ─── Observations ─────────────────────────────────────────────────────────
  async findObservations(schoolId: string, observedById?: string): Promise<LessonObservation[]> {
    const where: any = { schoolId };
    if (observedById) where.observedById = observedById;
    return this.obsRepo.find({ where, relations: ['observedStaff', 'observedBy'], order: { date: 'DESC' } });
  }

  async createObservation(schoolId: string, observedById: string, dto: Partial<LessonObservation>): Promise<LessonObservation> {
    const scores = [dto.preparationScore, dto.deliveryScore, dto.engagementScore, dto.disciplineScore, dto.assessmentScore]
      .filter(Boolean) as number[];
    const overall = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length * 20 : 0;
    return this.obsRepo.save(this.obsRepo.create({ ...dto, schoolId, observedById, overallScore: overall }));
  }

  async findObservation(id: string, schoolId: string): Promise<LessonObservation> {
    const obs = await this.obsRepo.findOne({ where: { id, schoolId }, relations: ['observedStaff', 'observedBy'] });
    if (!obs) throw new NotFoundException('Observation not found');
    return obs;
  }

  // ─── Schemes of Work ──────────────────────────────────────────────────────
  async findSchemes(schoolId: string): Promise<SchemeOfWork[]> {
    return this.schemeRepo.find({ where: { schoolId }, relations: ['staff', 'approvedBy'] });
  }

  async approveScheme(id: string, schoolId: string, approvedById: string): Promise<SchemeOfWork> {
    const scheme = await this.schemeRepo.findOne({ where: { id, schoolId } });
    if (!scheme) throw new NotFoundException('Scheme of work not found');
    scheme.status = SchemeStatus.APPROVED;
    scheme.approvedById = approvedById;
    scheme.approvedAt = new Date();
    return this.schemeRepo.save(scheme);
  }

  // ─── Performance ────────────────────────────────────────────────────────
  async getDeptPerformance(schoolId: string) {
    // Placeholder — joins with ExamResult for real data
    return { message: 'Performance data will be aggregated from exam results', schoolId };
  }
}
