import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { StudentDiscipline, DisciplineStatus } from './entities/student-discipline.entity';
import { AppCacheService, TTL } from '../common/cache/cache.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentDiscipline)
    private readonly disciplineRepo: Repository<StudentDiscipline>,
    private readonly cache: AppCacheService,
  ) {}

  // ── Students ───────────────────────────────────────────────────────────────

  async countBySchool(schoolId: string): Promise<number> {
    return this.cache.getOrSet(
      `students:count:${schoolId}`,
      () => this.studentRepo.count({ where: { schoolId, isActive: true } }),
      TTL.SHORT,
    );
  }

  async findAll(schoolId: string, page = 1, limit = 20): Promise<{ data: Student[]; total: number }> {
    // Only cache the first page — subsequent pages are less frequent and have dynamic offsets
    const cacheKey = page === 1 ? `students:list:${schoolId}:${limit}` : null;
    const fetch = async () => {
      const [data, total] = await this.studentRepo.findAndCount({
        where: { schoolId, isActive: true },
        relations: ['class'],
        skip: (page - 1) * limit,
        take: limit,
        order: { lastName: 'ASC', firstName: 'ASC' },
      });
      return { data, total };
    };
    return cacheKey ? this.cache.getOrSet(cacheKey, fetch, TTL.SHORT) : fetch();
  }

  async findByUserId(userId: string, schoolId: string): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { userId, schoolId },
      relations: ['class'],
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async findOne(id: string, schoolId: string): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { id, schoolId },
      relations: ['class', 'school'],
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async create(data: Partial<Student>): Promise<Student> {
    const student = await this.studentRepo.save(this.studentRepo.create(data));
    // Invalidate count and first-page list so dashboards reflect new enrollment
    await Promise.all([
      this.cache.del(`students:count:${student.schoolId}`),
      this.cache.del(`students:list:${student.schoolId}:20`),
    ]);
    return student;
  }

  async update(id: string, schoolId: string, data: Partial<Student>): Promise<Student> {
    const student = await this.studentRepo.findOne({ where: { id, schoolId } });
    if (!student) throw new NotFoundException('Student not found');
    const updated = await this.studentRepo.save({ ...student, ...data });
    // Deactivating a student changes the count — invalidate
    if ('isActive' in data) {
      await this.cache.del(`students:count:${schoolId}`);
    }
    await this.cache.del(`students:list:${schoolId}:20`);
    return updated;
  }

  async countByClass(schoolId: string): Promise<{ classId: string; count: number }[]> {
    return this.studentRepo
      .createQueryBuilder('s')
      .select('s.class_id', 'classId')
      .addSelect('COUNT(*)', 'count')
      .where('s.school_id = :schoolId AND s.is_active = true', { schoolId })
      .groupBy('s.class_id')
      .getRawMany();
  }

  // ── Discipline ─────────────────────────────────────────────────────────────

  async recordDisciplineAction(data: Partial<StudentDiscipline>): Promise<StudentDiscipline> {
    return this.disciplineRepo.save(this.disciplineRepo.create(data));
  }

  async findDisciplineByStudent(studentId: string, schoolId: string): Promise<StudentDiscipline[]> {
    return this.disciplineRepo.find({
      where: { studentId, schoolId },
      relations: ['student', 'issuedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllDiscipline(schoolId: string, status?: DisciplineStatus): Promise<StudentDiscipline[]> {
    const where: any = { schoolId };
    if (status) where.status = status;
    return this.disciplineRepo.find({
      where,
      relations: ['student', 'student.class', 'issuedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateDisciplineAction(id: string, schoolId: string, data: Partial<StudentDiscipline>): Promise<StudentDiscipline> {
    const record = await this.disciplineRepo.findOne({ where: { id, schoolId } });
    if (!record) throw new NotFoundException('Discipline record not found');
    return this.disciplineRepo.save({ ...record, ...data });
  }
}
