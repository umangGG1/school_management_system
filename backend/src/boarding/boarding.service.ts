import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Dormitory, DormRoom, DormAllocation, StudentLeave, StudentLeaveStatus,
  DormRollCall, DormRollCallEntry, RollCallEntryStatus,
} from './entities/boarding.entities';
import { DormIncident, NightReport, WelfareReport } from './entities/boarding-reports.entities';

@Injectable()
export class BoardingService {
  constructor(
    @InjectRepository(Dormitory) private readonly dormRepo: Repository<Dormitory>,
    @InjectRepository(DormRoom) private readonly roomRepo: Repository<DormRoom>,
    @InjectRepository(DormAllocation) private readonly allocRepo: Repository<DormAllocation>,
    @InjectRepository(StudentLeave) private readonly leaveRepo: Repository<StudentLeave>,
    @InjectRepository(DormRollCall) private readonly rollCallRepo: Repository<DormRollCall>,
    @InjectRepository(DormRollCallEntry) private readonly entryRepo: Repository<DormRollCallEntry>,
    @InjectRepository(DormIncident) private readonly incidentRepo: Repository<DormIncident>,
    @InjectRepository(NightReport) private readonly nightReportRepo: Repository<NightReport>,
    @InjectRepository(WelfareReport) private readonly welfareRepo: Repository<WelfareReport>,
  ) {}

  // ─── Summary ─────────────────────────────────────────────────────────────
  async summary(schoolId: string) {
    const totalBoarders = await this.allocRepo.count({ where: { schoolId, isActive: true } });
    const missing = await this.leaveRepo.count({ where: { schoolId, status: StudentLeaveStatus.OVERDUE } });
    const onApprovedLeave = await this.leaveRepo.count({ where: { schoolId, status: StudentLeaveStatus.APPROVED } });
    const dorms = await this.dormRepo.find({ where: { schoolId } });
    return { totalBoarders, missing, onApprovedLeave, inSickBay: 0, dorms };
  }

  // ─── Dormitories ─────────────────────────────────────────────────────────
  async findDorms(schoolId: string): Promise<Dormitory[]> {
    const dorms = await this.dormRepo.find({ where: { schoolId } });
    const result = [];
    for (const d of dorms) {
      const occupied = await this.allocRepo.count({ where: { schoolId, isActive: true } });
      result.push({ ...d, occupied, occupancyPct: d.capacity > 0 ? Math.round((occupied / d.capacity) * 100) : 0 });
    }
    return result;
  }

  async createDorm(schoolId: string, data: Partial<Dormitory>): Promise<Dormitory> {
    return this.dormRepo.save(this.dormRepo.create({ ...data, schoolId }));
  }

  // ─── Leave / Exeat ───────────────────────────────────────────────────────
  async findLeaves(schoolId: string, status?: string) {
    const where: any = { schoolId };
    if (status) where.status = status;
    return this.leaveRepo.find({
      where,
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async createLeave(schoolId: string, data: Partial<StudentLeave>): Promise<StudentLeave> {
    return this.leaveRepo.save(this.leaveRepo.create({ ...data, schoolId }));
  }

  async approveLeave(id: string, schoolId: string, approvedById: string): Promise<StudentLeave> {
    const leave = await this.leaveRepo.findOne({ where: { id, schoolId } });
    if (!leave) throw new NotFoundException('Leave request not found');
    leave.status = StudentLeaveStatus.APPROVED;
    leave.approvedById = approvedById;
    leave.grantedAt = new Date();
    return this.leaveRepo.save(leave);
  }

  async markReturned(id: string, schoolId: string): Promise<StudentLeave> {
    const leave = await this.leaveRepo.findOne({ where: { id, schoolId } });
    if (!leave) throw new NotFoundException('Leave request not found');
    leave.status = StudentLeaveStatus.RETURNED;
    leave.actualReturnAt = new Date();
    return this.leaveRepo.save(leave);
  }

  async getMissingStudents(schoolId: string) {
    return this.leaveRepo.find({
      where: [
        { schoolId, status: StudentLeaveStatus.OVERDUE },
      ],
      relations: ['student'],
    });
  }

  // ─── Roll Call ────────────────────────────────────────────────────────────
  async getTodayRollCall(schoolId: string) {
    const today = new Date().toISOString().slice(0, 10);
    return this.rollCallRepo.find({
      where: { schoolId, date: today },
      relations: ['dormitory', 'conductedBy'],
    });
  }

  async submitRollCall(
    schoolId: string,
    conductedById: string,
    dto: { dormitoryId: string; period: any; notes?: string; entries: { studentId: string; status: RollCallEntryStatus; notes?: string }[] },
  ) {
    const rollCall = await this.rollCallRepo.save(
      this.rollCallRepo.create({
        schoolId,
        dormitoryId: dto.dormitoryId,
        period: dto.period,
        conductedById,
        date: new Date().toISOString().slice(0, 10),
        notes: dto.notes,
      }),
    );
    const entries = dto.entries.map((e) =>
      this.entryRepo.create({ rollCallId: rollCall.id, studentId: e.studentId, status: e.status, notes: e.notes }),
    );
    await this.entryRepo.save(entries);
    return rollCall;
  }

  // ─── Allocations ─────────────────────────────────────────────────────────
  async findAllocations(schoolId: string) {
    return this.allocRepo.find({ where: { schoolId, isActive: true }, relations: ['dormRoom', 'student'] });
  }

  async createAllocation(schoolId: string, data: Partial<DormAllocation>): Promise<DormAllocation> {
    return this.allocRepo.save(this.allocRepo.create({ ...data, schoolId }));
  }

  // ─── Incidents ────────────────────────────────────────────────────────────
  async createIncident(data: Partial<DormIncident>): Promise<DormIncident> {
    return this.incidentRepo.save(this.incidentRepo.create(data));
  }

  async findIncidents(schoolId: string, dormitoryId?: string): Promise<DormIncident[]> {
    const where: any = { schoolId };
    if (dormitoryId) where.dormitoryId = dormitoryId;
    return this.incidentRepo.find({ where, relations: ['dormitory', 'reportedBy', 'resolvedBy'], order: { createdAt: 'DESC' } });
  }

  async updateIncident(id: string, schoolId: string, data: Partial<DormIncident>): Promise<DormIncident> {
    const incident = await this.incidentRepo.findOne({ where: { id, schoolId } });
    if (!incident) throw new NotFoundException('Incident not found');
    return this.incidentRepo.save({ ...incident, ...data });
  }

  // ─── Night Reports ────────────────────────────────────────────────────────
  async submitNightReport(data: Partial<NightReport>): Promise<NightReport> {
    return this.nightReportRepo.save(this.nightReportRepo.create(data));
  }

  async findNightReports(schoolId: string, dormitoryId?: string): Promise<NightReport[]> {
    const where: any = { schoolId };
    if (dormitoryId) where.dormitoryId = dormitoryId;
    return this.nightReportRepo.find({ where, relations: ['dormitory', 'submittedBy'], order: { reportDate: 'DESC' } });
  }

  // ─── Welfare Reports ──────────────────────────────────────────────────────
  async createWelfareReport(data: Partial<WelfareReport>): Promise<WelfareReport> {
    return this.welfareRepo.save(this.welfareRepo.create(data));
  }

  async findWelfareReports(schoolId: string, studentId?: string): Promise<WelfareReport[]> {
    const where: any = { schoolId };
    if (studentId) where.studentId = studentId;
    return this.welfareRepo.find({ where, relations: ['student', 'reportedBy'], order: { createdAt: 'DESC' } });
  }

  async updateWelfareReport(id: string, schoolId: string, data: Partial<WelfareReport>): Promise<WelfareReport> {
    const report = await this.welfareRepo.findOne({ where: { id, schoolId } });
    if (!report) throw new NotFoundException('Welfare report not found');
    return this.welfareRepo.save({ ...report, ...data });
  }
}
