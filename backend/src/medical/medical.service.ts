import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SickBayVisit, SickBayStatus, StudentMedicalHistory } from './entities/medical.entities';
import { MedicationLog } from './entities/medication.entity';
import { HospitalReferral, ReferralStatus } from './entities/hospital-referral.entity';

@Injectable()
export class MedicalService {
  constructor(
    @InjectRepository(SickBayVisit) private readonly visitRepo: Repository<SickBayVisit>,
    @InjectRepository(StudentMedicalHistory) private readonly historyRepo: Repository<StudentMedicalHistory>,
    @InjectRepository(MedicationLog) private readonly medicationRepo: Repository<MedicationLog>,
    @InjectRepository(HospitalReferral) private readonly referralRepo: Repository<HospitalReferral>,
  ) {}

  // ── Sick Bay ───────────────────────────────────────────────────────────────

  async currentPatients(schoolId: string) {
    return this.visitRepo.find({
      where: [
        { schoolId, status: SickBayStatus.ADMITTED },
        { schoolId, status: SickBayStatus.OBSERVATION },
      ],
      relations: ['student'],
      order: { visitDate: 'DESC' },
    });
  }

  async stats(schoolId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const qb = this.visitRepo.createQueryBuilder('v')
      .select('v.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('v.school_id = :schoolId AND DATE(v.visit_date) = :today', { schoolId, today })
      .groupBy('v.status');
    const rows = await qb.getRawMany();
    const result: Record<string, number> = { ADMITTED: 0, OBSERVATION: 0, DISCHARGED: 0, REFERRED: 0 };
    for (const r of rows) result[r.status] = Number(r.count);
    return result;
  }

  async createVisit(schoolId: string, attendedById: string, dto: Partial<SickBayVisit>): Promise<SickBayVisit> {
    return this.visitRepo.save(this.visitRepo.create({ ...dto, schoolId, attendedById }));
  }

  async updateVisit(id: string, schoolId: string, dto: Partial<SickBayVisit>): Promise<SickBayVisit> {
    const v = await this.visitRepo.findOne({ where: { id, schoolId } });
    if (!v) throw new NotFoundException('Visit not found');
    if (dto.status === SickBayStatus.DISCHARGED && !v.dischargedAt) dto.dischargedAt = new Date();
    Object.assign(v, dto);
    return this.visitRepo.save(v);
  }

  async monthlyReport(schoolId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1).toISOString();
    const end = new Date(year, month, 0, 23, 59, 59).toISOString();
    return this.visitRepo
      .createQueryBuilder('v')
      .where('v.school_id = :schoolId AND v.visit_date BETWEEN :start AND :end', { schoolId, start, end })
      .getMany();
  }

  async getMedicalHistory(studentId: string, schoolId: string): Promise<StudentMedicalHistory | null> {
    return this.historyRepo.findOne({ where: { studentId, schoolId } });
  }

  async updateMedicalHistory(studentId: string, schoolId: string, dto: Partial<StudentMedicalHistory>): Promise<StudentMedicalHistory> {
    let record = await this.historyRepo.findOne({ where: { studentId, schoolId } });
    if (!record) record = this.historyRepo.create({ studentId, schoolId });
    Object.assign(record, dto);
    return this.historyRepo.save(record);
  }

  // ── Medication Log ─────────────────────────────────────────────────────────

  async logMedication(data: Partial<MedicationLog>): Promise<MedicationLog> {
    return this.medicationRepo.save(this.medicationRepo.create(data));
  }

  async findMedications(schoolId: string, studentId?: string, visitId?: string): Promise<MedicationLog[]> {
    const where: any = { schoolId };
    if (studentId) where.studentId = studentId;
    if (visitId) where.visitId = visitId;
    return this.medicationRepo.find({
      where,
      relations: ['student', 'administeredBy', 'visit'],
      order: { administeredAt: 'DESC' },
    });
  }

  // ── Hospital Referrals ─────────────────────────────────────────────────────

  async createReferral(data: Partial<HospitalReferral>): Promise<HospitalReferral> {
    const referral = this.referralRepo.create({ ...data, referredAt: new Date() });
    return this.referralRepo.save(referral);
  }

  async findReferrals(schoolId: string, studentId?: string): Promise<HospitalReferral[]> {
    const where: any = { schoolId };
    if (studentId) where.studentId = studentId;
    return this.referralRepo.find({
      where,
      relations: ['student', 'referredBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateReferral(id: string, schoolId: string, data: Partial<HospitalReferral>): Promise<HospitalReferral> {
    const referral = await this.referralRepo.findOne({ where: { id, schoolId } });
    if (!referral) throw new NotFoundException('Referral not found');
    if (data.status === ReferralStatus.RETURNED && !referral.returnedAt) {
      data.returnedAt = new Date();
    }
    return this.referralRepo.save({ ...referral, ...data });
  }
}
