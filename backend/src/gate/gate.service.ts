import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GatePass, GatePassStatus } from './entities/gate-pass.entity';
import { VisitorLog } from './entities/visitor-log.entity';
import { NotificationGateway } from '../common/gateways/notification.gateway';

@Injectable()
export class GateService {
  constructor(
    @InjectRepository(GatePass)   private readonly passRepo: Repository<GatePass>,
    @InjectRepository(VisitorLog) private readonly visitorRepo: Repository<VisitorLog>,
    private readonly gateway: NotificationGateway,
  ) {}

  // ── Gate Passes ────────────────────────────────────────────────────────────

  private generatePassCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async requestPass(
    schoolId: string,
    data: { studentId: string; requestedBy: string; reason?: string },
  ): Promise<GatePass> {
    return this.passRepo.save(
      this.passRepo.create({ ...data, schoolId, status: GatePassStatus.PENDING }),
    );
  }

  async approvePass(
    id: string,
    schoolId: string,
    data: { authorizedBy: string; validFrom: Date; validUntil: Date },
  ): Promise<GatePass> {
    const pass = await this.passRepo.findOne({ where: { id, schoolId } });
    if (!pass) throw new NotFoundException('Gate pass not found');
    if (pass.status !== GatePassStatus.PENDING) {
      throw new ConflictException('Only PENDING passes can be approved');
    }

    const approved = await this.passRepo.save({
      ...pass,
      ...data,
      passCode: this.generatePassCode(),
      status: GatePassStatus.APPROVED,
    });

    // Real-time: notify the student (and their room/dorm devices)
    this.gateway.emitToSchool(approved.schoolId, 'gate:pass-approved', {
      passId:     approved.id,
      studentId:  approved.studentId,
      passCode:   approved.passCode,
      validFrom:  approved.validFrom,
      validUntil: approved.validUntil,
      timestamp:  new Date(),
    });

    return approved;
  }

  async getPendingPasses(schoolId: string): Promise<GatePass[]> {
    return this.passRepo.find({
      where: { schoolId, status: GatePassStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async getActivePasses(schoolId: string): Promise<GatePass[]> {
    return this.passRepo.find({
      where: { schoolId, status: GatePassStatus.APPROVED },
      order: { validUntil: 'ASC' },
    });
  }

  async logExit(schoolId: string, passCode: string): Promise<GatePass> {
    const pass = await this.passRepo.findOne({
      where: { schoolId, passCode, status: GatePassStatus.APPROVED },
    });
    if (!pass) throw new NotFoundException('No active approved pass found for this code');

    const used = await this.passRepo.save({ ...pass, status: GatePassStatus.USED, usedAt: new Date() });

    this.gateway.emitToSchool(used.schoolId, 'gate:student-exit', {
      passId:    used.id,
      studentId: used.studentId,
      passCode:  used.passCode,
      exitTime:  used.usedAt,
    });

    return used;
  }

  async logReturn(schoolId: string, passCode: string): Promise<GatePass> {
    const pass = await this.passRepo.findOne({
      where: { schoolId, passCode, status: GatePassStatus.USED },
    });
    if (!pass) throw new NotFoundException('No used pass found for this code');

    return this.passRepo.save({ ...pass, returnedAt: new Date() });
  }

  async getPassLogs(
    schoolId: string,
    opts: { date?: string; page?: number; limit?: number },
  ): Promise<{ data: GatePass[]; total: number }> {
    const qb = this.passRepo.createQueryBuilder('p').where('p.schoolId = :schoolId', { schoolId });
    if (opts.date) {
      qb.andWhere('DATE(p.createdAt) = :date', { date: opts.date });
    }
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 50;
    qb.orderBy('p.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  // ── Visitors ───────────────────────────────────────────────────────────────

  async registerVisitor(schoolId: string, data: Partial<VisitorLog>, registeredBy: string): Promise<VisitorLog> {
    return this.visitorRepo.save(
      this.visitorRepo.create({ ...data, schoolId, registeredBy, entryTime: new Date() }),
    );
  }

  async getVisitorLogs(
    schoolId: string,
    opts: { date?: string; page?: number; limit?: number },
  ): Promise<{ data: VisitorLog[]; total: number }> {
    const qb = this.visitorRepo.createQueryBuilder('v').where('v.schoolId = :schoolId', { schoolId });
    if (opts.date) {
      qb.andWhere('DATE(v.entryTime) = :date', { date: opts.date });
    }
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 50;
    qb.orderBy('v.entryTime', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async getCurrentVisitors(schoolId: string): Promise<VisitorLog[]> {
    return this.visitorRepo.find({
      where: { schoolId },
      order: { entryTime: 'DESC' },
    }).then(rows => rows.filter(r => !r.exitTime));
  }

  async recordVisitorExit(id: string, schoolId: string): Promise<VisitorLog> {
    const log = await this.visitorRepo.findOne({ where: { id, schoolId } });
    if (!log) throw new NotFoundException('Visitor log not found');
    return this.visitorRepo.save({ ...log, exitTime: new Date() });
  }
}
