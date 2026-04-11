import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CounselingCase,
  CaseNote,
  CounselingSession,
  SafeguardingReport,
  OVCRegistration,
  HealthReferral,
  CaseStatus,
} from './entities/counseling.entities';

@Injectable()
export class CounselingService {
  constructor(
    @InjectRepository(CounselingCase)
    private readonly caseRepo: Repository<CounselingCase>,
    @InjectRepository(CaseNote)
    private readonly noteRepo: Repository<CaseNote>,
    @InjectRepository(CounselingSession)
    private readonly sessionRepo: Repository<CounselingSession>,
    @InjectRepository(SafeguardingReport)
    private readonly safeguardingRepo: Repository<SafeguardingReport>,
    @InjectRepository(OVCRegistration)
    private readonly ovcRepo: Repository<OVCRegistration>,
    @InjectRepository(HealthReferral)
    private readonly referralRepo: Repository<HealthReferral>,
  ) {}

  // ── Cases ──────────────────────────────────────────────────────────────────

  async createCase(data: Partial<CounselingCase>): Promise<CounselingCase> {
    return this.caseRepo.save(this.caseRepo.create(data));
  }

  async findCases(schoolId: string, status?: CaseStatus): Promise<CounselingCase[]> {
    const where: any = { schoolId };
    if (status) where.status = status;
    return this.caseRepo.find({
      where,
      relations: ['student', 'counselor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findCasesByStudent(studentId: string, schoolId: string): Promise<CounselingCase[]> {
    return this.caseRepo.find({
      where: { studentId, schoolId },
      relations: ['counselor'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateCase(id: string, schoolId: string, data: Partial<CounselingCase>): Promise<CounselingCase> {
    const c = await this.caseRepo.findOne({ where: { id, schoolId } });
    if (!c) throw new NotFoundException('Case not found');
    return this.caseRepo.save({ ...c, ...data });
  }

  // ── Case Notes ─────────────────────────────────────────────────────────────

  async addNote(data: Partial<CaseNote>): Promise<CaseNote> {
    return this.noteRepo.save(this.noteRepo.create(data));
  }

  async findNotes(caseId: string, schoolId: string): Promise<CaseNote[]> {
    return this.noteRepo.find({
      where: { caseId, schoolId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateNote(id: string, schoolId: string, data: Partial<CaseNote>): Promise<CaseNote> {
    const note = await this.noteRepo.findOne({ where: { id, schoolId } });
    if (!note) throw new NotFoundException('Note not found');
    return this.noteRepo.save({ ...note, ...data });
  }

  // ── Sessions ───────────────────────────────────────────────────────────────

  async createSession(data: Partial<CounselingSession>): Promise<CounselingSession> {
    return this.sessionRepo.save(this.sessionRepo.create(data));
  }

  async findSessions(schoolId: string, caseId?: string): Promise<CounselingSession[]> {
    const where: any = { schoolId };
    if (caseId) where.caseId = caseId;
    return this.sessionRepo.find({
      where,
      relations: ['case', 'case.student', 'counselor'],
      order: { sessionDate: 'DESC' },
    });
  }

  // ── Safeguarding ───────────────────────────────────────────────────────────

  async createSafeguardingReport(data: Partial<SafeguardingReport>): Promise<SafeguardingReport> {
    return this.safeguardingRepo.save(this.safeguardingRepo.create(data));
  }

  async findSafeguardingReports(schoolId: string): Promise<SafeguardingReport[]> {
    return this.safeguardingRepo.find({
      where: { schoolId },
      relations: ['student', 'reportedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateSafeguardingReport(id: string, schoolId: string, data: Partial<SafeguardingReport>): Promise<SafeguardingReport> {
    const report = await this.safeguardingRepo.findOne({ where: { id, schoolId } });
    if (!report) throw new NotFoundException('Report not found');
    return this.safeguardingRepo.save({ ...report, ...data });
  }

  // ── OVC ────────────────────────────────────────────────────────────────────

  async registerOVC(data: Partial<OVCRegistration>): Promise<OVCRegistration> {
    return this.ovcRepo.save(this.ovcRepo.create(data));
  }

  async findOVC(schoolId: string): Promise<OVCRegistration[]> {
    return this.ovcRepo.find({
      where: { schoolId, isActive: true },
      relations: ['student', 'registeredBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOVC(id: string, schoolId: string, data: Partial<OVCRegistration>): Promise<OVCRegistration> {
    const ovc = await this.ovcRepo.findOne({ where: { id, schoolId } });
    if (!ovc) throw new NotFoundException('OVC record not found');
    return this.ovcRepo.save({ ...ovc, ...data });
  }

  // ── Health Referrals ───────────────────────────────────────────────────────

  async createHealthReferral(data: Partial<HealthReferral>): Promise<HealthReferral> {
    return this.referralRepo.save(this.referralRepo.create(data));
  }

  async findHealthReferrals(schoolId: string, studentId?: string): Promise<HealthReferral[]> {
    const where: any = { schoolId };
    if (studentId) where.studentId = studentId;
    return this.referralRepo.find({
      where,
      relations: ['student', 'referredBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateHealthReferral(id: string, schoolId: string, data: Partial<HealthReferral>): Promise<HealthReferral> {
    const ref = await this.referralRepo.findOne({ where: { id, schoolId } });
    if (!ref) throw new NotFoundException('Referral not found');
    return this.referralRepo.save({ ...ref, ...data });
  }

  // ── Dashboard Summary ──────────────────────────────────────────────────────

  async getSummary(schoolId: string) {
    const [openCases, sessions, ovcCount, safeguardingCount] = await Promise.all([
      this.caseRepo.count({ where: { schoolId, status: CaseStatus.OPEN } }),
      this.sessionRepo.count({ where: { schoolId } }),
      this.ovcRepo.count({ where: { schoolId, isActive: true } }),
      this.safeguardingRepo.count({ where: { schoolId, isResolved: false } }),
    ]);
    return { openCases, sessions, ovcCount, openSafeguarding: safeguardingCount };
  }
}
