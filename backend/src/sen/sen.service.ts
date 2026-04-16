import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SenRecord, SenRecordStatus } from './entities/sen-record.entity';
import { SenObservation } from './entities/sen-observation.entity';
import { AccommodationPlan } from './entities/accommodation-plan.entity';

@Injectable()
export class SenService {
  constructor(
    @InjectRepository(SenRecord)          private readonly recordRepo: Repository<SenRecord>,
    @InjectRepository(SenObservation)     private readonly observationRepo: Repository<SenObservation>,
    @InjectRepository(AccommodationPlan)  private readonly planRepo: Repository<AccommodationPlan>,
  ) {}

  // ── Records ───────────────────────────────────────────────────────────────

  async findStudentsWithSen(schoolId: string): Promise<{ studentId: string; count: number }[]> {
    return this.recordRepo
      .createQueryBuilder('r')
      .select('r.student_id', 'studentId')
      .addSelect('COUNT(*)', 'count')
      .where('r.schoolId = :schoolId AND r.status = :status', { schoolId, status: SenRecordStatus.ACTIVE })
      .groupBy('r.student_id')
      .getRawMany();
  }

  async findStudentRecords(studentId: string, schoolId: string): Promise<SenRecord[]> {
    return this.recordRepo.find({
      where: { studentId, schoolId },
      order: { createdAt: 'DESC' },
    });
  }

  async createRecord(schoolId: string, data: Partial<SenRecord>): Promise<SenRecord> {
    return this.recordRepo.save(this.recordRepo.create({ ...data, schoolId }));
  }

  async updateRecord(id: string, schoolId: string, data: Partial<SenRecord>): Promise<SenRecord> {
    const record = await this.recordRepo.findOne({ where: { id, schoolId } });
    if (!record) throw new NotFoundException('SEN record not found');
    return this.recordRepo.save({ ...record, ...data });
  }

  // ── Observations ──────────────────────────────────────────────────────────

  async findObservations(studentId: string, schoolId: string): Promise<SenObservation[]> {
    return this.observationRepo.find({
      where: { studentId, schoolId },
      order: { observationDate: 'DESC' },
    });
  }

  async createObservation(schoolId: string, data: Partial<SenObservation>): Promise<SenObservation> {
    return this.observationRepo.save(this.observationRepo.create({ ...data, schoolId }));
  }

  // ── Accommodation Plans ───────────────────────────────────────────────────

  async findPlans(studentId: string, schoolId: string): Promise<AccommodationPlan[]> {
    return this.planRepo.find({
      where: { studentId, schoolId },
      order: { createdAt: 'DESC' },
    });
  }

  async createPlan(schoolId: string, data: Partial<AccommodationPlan>): Promise<AccommodationPlan> {
    return this.planRepo.save(this.planRepo.create({ ...data, schoolId }));
  }
}
