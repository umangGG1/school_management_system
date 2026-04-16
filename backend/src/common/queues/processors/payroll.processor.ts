import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE } from '../queue.constants';
import { PayrollRun, PayrollRunStatus } from '../../../payroll/entities/payroll-run.entity';
import { Payslip } from '../../../payroll/entities/payslip.entity';
import { SalaryComponent } from '../../../payroll/entities/salary-component.entity';
import { PayeBracket } from '../../../payroll/entities/paye-bracket.entity';
import { StaffMember } from '../../../staff/entities/staff.entity';

export interface PayrollJobData {
  payrollRunId: string;
  schoolId: string;
  month: string;
  staffMemberIds?: string[];
}

const NSSF_EMPLOYEE_RATE = 0.05;
const NSSF_EMPLOYER_RATE = 0.10;

@Processor(QUEUE.PAYROLL)
export class PayrollProcessor extends WorkerHost {
  private readonly logger = new Logger(PayrollProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectQueue(QUEUE.PDF) private readonly pdfQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<PayrollJobData>): Promise<void> {
    const { payrollRunId, schoolId, month, staffMemberIds } = job.data;
    this.logger.log(`Processing payroll run ${payrollRunId} — ${month}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Load the run
      const run = await queryRunner.manager.findOne(PayrollRun, {
        where: { id: payrollRunId, schoolId },
      });
      if (!run) throw new Error(`PayrollRun ${payrollRunId} not found`);

      // 2. Determine which staff to process
      const staffQuery = queryRunner.manager
        .createQueryBuilder(StaffMember, 's')
        .where('s.schoolId = :schoolId AND s.isActive = true', { schoolId });
      if (staffMemberIds?.length) {
        staffQuery.andWhere('s.id IN (:...ids)', { ids: staffMemberIds });
      }
      const staffList = await staffQuery.getMany();

      if (staffList.length === 0) {
        this.logger.warn(`No active staff found for school ${schoolId}`);
        await queryRunner.commitTransaction();
        return;
      }

      // 3. Load current PAYE brackets (Uganda FY latest)
      const brackets = await queryRunner.manager.find(PayeBracket, {
        where: { country: 'UG' },
        order: { minIncome: 'ASC' },
      });

      let totalGross = 0;
      let totalNet   = 0;
      let totalPaye  = 0;
      let totalNssf  = 0;

      for (const staff of staffList) {
        // 4. Sum active salary components
        const components = await queryRunner.manager.find(SalaryComponent, {
          where: { staffMemberId: staff.id, schoolId, isActive: true },
        });

        const grossSalary = components.reduce((sum, c) => sum + Number(c.amount), 0);
        if (grossSalary === 0) continue;  // skip staff with no salary configured

        // 5. PAYE calculation against DB brackets
        const payeDeduction = this.computePaye(grossSalary, brackets);

        // 6. NSSF
        const nssfEmployee = Math.round(grossSalary * NSSF_EMPLOYEE_RATE);
        const nssfEmployer = Math.round(grossSalary * NSSF_EMPLOYER_RATE);

        // 7. SACCO/other deductions (from components)
        const saccoDeduction  = 0;  // future: read from component type SACCO
        const otherDeductions = 0;

        const netPay = grossSalary - payeDeduction - nssfEmployee - saccoDeduction - otherDeductions;

        // 8. Create payslip record
        const payslip = queryRunner.manager.create(Payslip, {
          payrollRunId,
          staffMemberId: staff.id,
          schoolId,
          grossSalary,
          payeDeduction,
          nssfEmployee,
          nssfEmployer,
          saccoDeduction,
          otherDeductions,
          netPay,
        });
        await queryRunner.manager.save(Payslip, payslip);

        // 9. Enqueue PDF generation per payslip
        await this.pdfQueue.add('generate-payslip', {
          type: 'payslip',
          schoolId,
          entityId: payslip.id,
          metadata: { staffName: `${staff.firstName} ${staff.lastName}`, month, grossSalary, netPay },
        });

        totalGross += grossSalary;
        totalNet   += netPay;
        totalPaye  += payeDeduction;
        totalNssf  += nssfEmployee + nssfEmployer;
      }

      // 10. Update run totals and mark as processed
      await queryRunner.manager.update(PayrollRun, payrollRunId, {
        totalGross,
        totalNet,
        totalPaye,
        totalNssf,
        processedAt: new Date(),
        status: PayrollRunStatus.DRAFT,   // remains DRAFT until a manager approves
      });

      await queryRunner.commitTransaction();
      this.logger.log(
        `Payroll run ${payrollRunId} complete — ${staffList.length} staff, gross UGX ${totalGross.toLocaleString()}`,
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Payroll run ${payrollRunId} failed: ${(err as Error).message}`);
      throw err;  // re-throw so BullMQ retries
    } finally {
      await queryRunner.release();
    }
  }

  /** Compute PAYE tax using DB brackets (Uganda progressive tax). */
  private computePaye(grossMonthly: number, brackets: PayeBracket[]): number {
    let tax = 0;
    for (const b of brackets) {
      if (grossMonthly <= b.minIncome) break;
      const upper = b.maxIncome !== null ? Number(b.maxIncome) : Infinity;
      if (grossMonthly > b.minIncome) {
        const taxable = Math.min(grossMonthly, upper) - b.minIncome;
        tax = Number(b.fixedAmount) + taxable * Number(b.rate);
        if (grossMonthly <= upper) break;
      }
    }
    return Math.max(0, Math.round(tax));
  }
}
