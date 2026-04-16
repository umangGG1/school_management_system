import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PayrollRun, PayrollRunStatus } from './entities/payroll-run.entity';
import { Payslip } from './entities/payslip.entity';
import { SalaryComponent, ComponentType } from './entities/salary-component.entity';
import { PayeBracket } from './entities/paye-bracket.entity';
import { QUEUE } from '../common/queues/queue.constants';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollRun)       private readonly runRepo: Repository<PayrollRun>,
    @InjectRepository(Payslip)          private readonly payslipRepo: Repository<Payslip>,
    @InjectRepository(SalaryComponent)  private readonly componentRepo: Repository<SalaryComponent>,
    @InjectRepository(PayeBracket)      private readonly bracketRepo: Repository<PayeBracket>,
    @InjectQueue(QUEUE.PAYROLL)         private readonly payrollQueue: Queue,
    private readonly dataSource: DataSource,
  ) {}

  // ── Payroll Runs ──────────────────────────────────────────────────────────────

  async listRuns(schoolId: string, page = 1, limit = 20): Promise<{ data: PayrollRun[]; total: number }> {
    const [data, total] = await this.runRepo.findAndCount({
      where: { schoolId },
      order: { month: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async getRun(id: string, schoolId: string): Promise<PayrollRun> {
    const run = await this.runRepo.findOne({ where: { id, schoolId } });
    if (!run) throw new NotFoundException('Payroll run not found');
    return run;
  }

  async createRun(
    schoolId: string,
    month: string,
    runBy: string,
    staffMemberIds?: string[],
  ): Promise<{ run: PayrollRun; jobId: string }> {
    // Prevent duplicate runs for same month
    const existing = await this.runRepo.findOne({ where: { schoolId, month } });
    if (existing && existing.status !== PayrollRunStatus.CANCELLED) {
      throw new ConflictException(`Payroll run for ${month} already exists (status: ${existing.status})`);
    }

    const run = await this.runRepo.save(
      this.runRepo.create({ schoolId, month, runBy, status: PayrollRunStatus.DRAFT }),
    );

    const job = await this.payrollQueue.add(
      'process-payroll',
      { payrollRunId: run.id, schoolId, month, staffMemberIds },
      { jobId: `payroll:${schoolId}:${month}` },
    );

    return { run, jobId: String(job.id) };
  }

  async approveRun(id: string, schoolId: string, approvedBy: string): Promise<PayrollRun> {
    const run = await this.getRun(id, schoolId);
    if (run.status !== PayrollRunStatus.DRAFT) {
      throw new ConflictException('Only DRAFT runs can be approved');
    }
    return this.runRepo.save({ ...run, status: PayrollRunStatus.APPROVED, approvedBy });
  }

  // ── Payslips ──────────────────────────────────────────────────────────────────

  async getPayslipsByStaff(staffMemberId: string, schoolId: string): Promise<Payslip[]> {
    return this.payslipRepo.find({
      where: { staffMemberId, schoolId },
      order: { createdAt: 'DESC' },
      take: 24,
    });
  }

  // ── Salary Components ─────────────────────────────────────────────────────────

  async getComponents(staffMemberId: string, schoolId: string): Promise<SalaryComponent[]> {
    return this.componentRepo.find({
      where: { staffMemberId, schoolId, isActive: true },
      order: { componentType: 'ASC' },
    });
  }

  async upsertComponent(
    schoolId: string,
    staffMemberId: string,
    componentType: ComponentType,
    amount: number,
  ): Promise<SalaryComponent> {
    const existing = await this.componentRepo.findOne({
      where: { staffMemberId, schoolId, componentType },
    });
    if (existing) {
      return this.componentRepo.save({ ...existing, amount, isActive: true });
    }
    return this.componentRepo.save(
      this.componentRepo.create({ staffMemberId, schoolId, componentType, amount }),
    );
  }

  // ── PAYE Brackets ─────────────────────────────────────────────────────────────

  async getBrackets(country = 'UG'): Promise<PayeBracket[]> {
    return this.bracketRepo.find({
      where: { country },
      order: { minIncome: 'ASC' },
    });
  }

  /** Calculate PAYE tax based on current DB brackets (Uganda FY 2024/25). */
  async calculatePaye(grossMonthly: number, country = 'UG'): Promise<number> {
    const brackets = await this.getBrackets(country);
    let tax = 0;
    for (const b of brackets) {
      if (grossMonthly <= b.minIncome) break;
      const upper = b.maxIncome !== null ? b.maxIncome : Infinity;
      if (grossMonthly > b.minIncome) {
        const taxable = Math.min(grossMonthly, upper) - b.minIncome;
        tax = b.fixedAmount + taxable * b.rate;
        if (grossMonthly <= upper) break;
      }
    }
    return Math.max(0, Math.round(tax));
  }
}
