import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { StudentDiscipline, DisciplineStatus } from './entities/student-discipline.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentDiscipline)
    private readonly disciplineRepo: Repository<StudentDiscipline>,
  ) {}

  // ── Students ───────────────────────────────────────────────────────────────

  async countBySchool(schoolId: string): Promise<number> {
    return this.studentRepo.count({ where: { schoolId, isActive: true } });
  }

  async findAll(schoolId: string, page = 1, limit = 20): Promise<{ data: Student[]; total: number }> {
    const [data, total] = await this.studentRepo.findAndCount({
      where: { schoolId, isActive: true },
      relations: ['class'],
      skip: (page - 1) * limit,
      take: limit,
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
    return { data, total };
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
    return this.studentRepo.save(this.studentRepo.create(data));
  }

  async update(id: string, schoolId: string, data: Partial<Student>): Promise<Student> {
    const student = await this.studentRepo.findOne({ where: { id, schoolId } });
    if (!student) throw new NotFoundException('Student not found');
    return this.studentRepo.save({ ...student, ...data });
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
