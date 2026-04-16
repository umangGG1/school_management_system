import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffMember } from './entities/staff.entity';
import { StaffAttendance, StaffAttendanceStatus } from './entities/staff-attendance.entity';
import { StaffLeave, LeaveStatus } from './entities/staff-leave.entity';
import { StaffAction } from './entities/staff-action.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffMember)
    private readonly staffRepo: Repository<StaffMember>,
    @InjectRepository(StaffAttendance)
    private readonly attendanceRepo: Repository<StaffAttendance>,
    @InjectRepository(StaffLeave)
    private readonly leaveRepo: Repository<StaffLeave>,
    @InjectRepository(StaffAction)
    private readonly actionRepo: Repository<StaffAction>,
  ) {}

  // ── Staff ──────────────────────────────────────────────────────────────────

  async countBySchool(schoolId: string): Promise<number> {
    return this.staffRepo.count({ where: { schoolId, isActive: true } });
  }

  async findAll(schoolId: string): Promise<StaffMember[]> {
    return this.staffRepo.find({ where: { schoolId, isActive: true }, order: { lastName: 'ASC' } });
  }

  async findOne(id: string, schoolId: string): Promise<StaffMember> {
    const staff = await this.staffRepo.findOne({ where: { id, schoolId }, relations: ['user'] });
    if (!staff) throw new NotFoundException('Staff member not found');
    return staff;
  }

  async create(data: Partial<StaffMember>): Promise<StaffMember> {
    return this.staffRepo.save(this.staffRepo.create(data));
  }

  async update(id: string, schoolId: string, data: Partial<StaffMember>): Promise<StaffMember> {
    const staff = await this.staffRepo.findOne({ where: { id, schoolId } });
    if (!staff) throw new NotFoundException('Staff member not found');
    return this.staffRepo.save({ ...staff, ...data });
  }

  // ── Attendance ─────────────────────────────────────────────────────────────

  async todayAttendanceSummary(schoolId: string): Promise<{
    total: number;
    present: number;
    absent: number;
    onLeave: number;
  }> {
    const today = new Date().toISOString().slice(0, 10);
    const total = await this.staffRepo.count({ where: { schoolId, isActive: true } });

    const records = await this.attendanceRepo
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.schoolId = :schoolId AND a.date = :today', { schoolId, today })
      .groupBy('a.status')
      .getRawMany();

    const summary = { present: 0, absent: 0, onLeave: 0 };
    for (const r of records) {
      if (r.status === StaffAttendanceStatus.PRESENT) summary.present = Number(r.count);
      if (r.status === StaffAttendanceStatus.ABSENT) summary.absent = Number(r.count);
      if (r.status === StaffAttendanceStatus.LEAVE) summary.onLeave = Number(r.count);
    }

    return { total, ...summary };
  }

  async markAttendance(
    entries: Array<{ staffId: string; status: StaffAttendanceStatus }>,
    schoolId: string,
    date: string,
    markedById: string,
  ): Promise<{ saved: number }> {
    let saved = 0;
    for (const entry of entries) {
      const existing = await this.attendanceRepo.findOne({
        where: { staffId: entry.staffId, schoolId, date },
      });
      if (existing) {
        await this.attendanceRepo.save({ ...existing, status: entry.status });
      } else {
        await this.attendanceRepo.save(
          this.attendanceRepo.create({ staffId: entry.staffId, schoolId, date, status: entry.status }),
        );
      }
      saved++;
    }
    return { saved };
  }

  async getAttendanceHistory(staffId: string, schoolId: string, from?: string, to?: string) {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .where('a.staffId = :staffId AND a.schoolId = :schoolId', { staffId, schoolId });
    if (from) qb.andWhere('a.date >= :from', { from });
    if (to) qb.andWhere('a.date <= :to', { to });
    return qb.orderBy('a.date', 'DESC').getMany();
  }

  // ── Leave ──────────────────────────────────────────────────────────────────

  async requestLeave(data: Partial<StaffLeave>): Promise<StaffLeave> {
    return this.leaveRepo.save(this.leaveRepo.create(data));
  }

  async findLeaves(schoolId: string, staffId?: string, status?: LeaveStatus): Promise<StaffLeave[]> {
    const where: any = { schoolId };
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;
    return this.leaveRepo.find({ where, relations: ['staff', 'approvedBy'], order: { createdAt: 'DESC' } });
  }

  async approveLeave(id: string, schoolId: string, approvedById: string): Promise<StaffLeave> {
    const leave = await this.leaveRepo.findOne({ where: { id, schoolId } });
    if (!leave) throw new NotFoundException('Leave request not found');
    leave.status = LeaveStatus.APPROVED;
    leave.approvedById = approvedById;
    leave.approvedAt = new Date();
    return this.leaveRepo.save(leave);
  }

  async rejectLeave(id: string, schoolId: string, rejectionReason: string): Promise<StaffLeave> {
    const leave = await this.leaveRepo.findOne({ where: { id, schoolId } });
    if (!leave) throw new NotFoundException('Leave request not found');
    leave.status = LeaveStatus.REJECTED;
    leave.rejectionReason = rejectionReason;
    return this.leaveRepo.save(leave);
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async recordAction(data: Partial<StaffAction>): Promise<StaffAction> {
    return this.actionRepo.save(this.actionRepo.create(data));
  }

  async findActions(schoolId: string, staffId?: string): Promise<StaffAction[]> {
    const where: any = { schoolId };
    if (staffId) where.staffId = staffId;
    return this.actionRepo.find({ where, relations: ['staff', 'issuedBy'], order: { createdAt: 'DESC' } });
  }
}
