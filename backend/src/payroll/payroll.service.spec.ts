import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { DataSource } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollRun, PayrollRunStatus } from './entities/payroll-run.entity';
import { Payslip } from './entities/payslip.entity';
import { SalaryComponent, ComponentType } from './entities/salary-component.entity';
import { PayeBracket } from './entities/paye-bracket.entity';
import { QUEUE } from '../common/queues/queue.constants';

// Uganda FY2024/25 PAYE brackets (matches migration 004 seed)
const UG_BRACKETS: Partial<PayeBracket>[] = [
  { minIncome: 0,        maxIncome: 235000,    rate: 0,    fixedAmount: 0 },
  { minIncome: 235001,   maxIncome: 335000,    rate: 0.10, fixedAmount: 0 },
  { minIncome: 335001,   maxIncome: 410000,    rate: 0.20, fixedAmount: 10000 },
  { minIncome: 410001,   maxIncome: 10000000,  rate: 0.30, fixedAmount: 25000 },
  { minIncome: 10000001, maxIncome: null,       rate: 0.40, fixedAmount: 2857000 },
];

const mockRepo = () => ({
  findOne: jest.fn(),
  find:    jest.fn(),
  save:    jest.fn(),
  create:  jest.fn(),
  findAndCount: jest.fn(),
  update:  jest.fn(),
});

const mockQueue = () => ({ add: jest.fn().mockResolvedValue({ id: 'job-1' }) });

describe('PayrollService', () => {
  let service: PayrollService;
  let runRepo:       ReturnType<typeof mockRepo>;
  let payslipRepo:   ReturnType<typeof mockRepo>;
  let componentRepo: ReturnType<typeof mockRepo>;
  let bracketRepo:   ReturnType<typeof mockRepo>;
  let queue:         ReturnType<typeof mockQueue>;

  beforeEach(async () => {
    runRepo       = mockRepo();
    payslipRepo   = mockRepo();
    componentRepo = mockRepo();
    bracketRepo   = mockRepo();
    queue         = mockQueue();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: getRepositoryToken(PayrollRun),      useValue: runRepo },
        { provide: getRepositoryToken(Payslip),         useValue: payslipRepo },
        { provide: getRepositoryToken(SalaryComponent), useValue: componentRepo },
        { provide: getRepositoryToken(PayeBracket),     useValue: bracketRepo },
        { provide: getQueueToken(QUEUE.PAYROLL),        useValue: queue },
        { provide: DataSource,                          useValue: {} },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  // ── PAYE Calculation (critical financial logic) ───────────────────────────

  describe('calculatePaye', () => {
    beforeEach(() => {
      bracketRepo.find.mockResolvedValue(UG_BRACKETS);
    });

    it('returns 0 for salary below threshold (235,000)', async () => {
      expect(await service.calculatePaye(200000)).toBe(0);
    });

    it('returns 0 for salary exactly at threshold (235,000)', async () => {
      expect(await service.calculatePaye(235000)).toBe(0);
    });

    it('taxes at 10% on amount above 235,000 — bracket 2', async () => {
      // 285,000 − 235,000 = 50,000 × 10% = 5,000
      expect(await service.calculatePaye(285000)).toBe(5000);
    });

    it('taxes correctly at bracket boundary (335,000)', async () => {
      // (335,000 − 235,000) × 10% = 10,000
      expect(await service.calculatePaye(335000)).toBe(10000);
    });

    it('taxes correctly in bracket 3 — 20% band', async () => {
      // 10,000 fixed + (380,000 − 335,000) × 20% = 10,000 + 9,000 = 19,000
      expect(await service.calculatePaye(380000)).toBe(19000);
    });

    it('taxes correctly at bracket 3 upper boundary (410,000)', async () => {
      // 10,000 + (410,000 − 335,000) × 20% = 10,000 + 15,000 = 25,000
      expect(await service.calculatePaye(410000)).toBe(25000);
    });

    it('taxes correctly in bracket 4 — 30% band (typical mid-level teacher)', async () => {
      // 25,000 + (800,000 − 410,000) × 30% = 25,000 + 117,000 = 142,000
      expect(await service.calculatePaye(800000)).toBe(142000);
    });

    it('taxes correctly in top bracket — 40% (salary > 10M)', async () => {
      // 2,857,000 + (12,000,000 − 10,000,001) × 40%
      const gross = 12000000;
      const expected = Math.round(2857000 + (gross - 10000001) * 0.40);
      expect(await service.calculatePaye(gross)).toBe(expected);
    });

    it('returns non-negative value (never negative tax)', async () => {
      expect(await service.calculatePaye(0)).toBeGreaterThanOrEqual(0);
    });
  });

  // ── createRun ─────────────────────────────────────────────────────────────

  describe('createRun', () => {
    it('creates run and enqueues job', async () => {
      runRepo.findOne.mockResolvedValue(null);
      runRepo.create.mockReturnValue({ id: 'run-1', schoolId: 'school-1', month: '2026-04', status: PayrollRunStatus.DRAFT });
      runRepo.save.mockResolvedValue({ id: 'run-1', schoolId: 'school-1', month: '2026-04', status: PayrollRunStatus.DRAFT });

      const result = await service.createRun('school-1', '2026-04', 'user-1');

      expect(runRepo.save).toHaveBeenCalled();
      expect(queue.add).toHaveBeenCalledWith(
        'process-payroll',
        expect.objectContaining({ payrollRunId: 'run-1', schoolId: 'school-1', month: '2026-04' }),
        expect.any(Object),
      );
      expect(result.run.status).toBe(PayrollRunStatus.DRAFT);
      expect(result.jobId).toBeDefined();
    });

    it('throws ConflictException when active run for month already exists', async () => {
      runRepo.findOne.mockResolvedValue({ id: 'existing', status: PayrollRunStatus.DRAFT });

      await expect(service.createRun('school-1', '2026-04', 'user-1'))
        .rejects.toThrow(ConflictException);
    });

    it('allows creating run if previous one was CANCELLED', async () => {
      runRepo.findOne.mockResolvedValue({ id: 'old', status: PayrollRunStatus.CANCELLED });
      runRepo.create.mockReturnValue({ id: 'new-run' });
      runRepo.save.mockResolvedValue({ id: 'new-run', status: PayrollRunStatus.DRAFT });

      await expect(service.createRun('school-1', '2026-04', 'user-1')).resolves.toBeDefined();
    });
  });

  // ── approveRun ────────────────────────────────────────────────────────────

  describe('approveRun', () => {
    it('approves a DRAFT run', async () => {
      const run = { id: 'run-1', schoolId: 'school-1', status: PayrollRunStatus.DRAFT };
      runRepo.findOne.mockResolvedValue(run);
      runRepo.save.mockResolvedValue({ ...run, status: PayrollRunStatus.APPROVED, approvedBy: 'admin-1' });

      const result = await service.approveRun('run-1', 'school-1', 'admin-1');
      expect(result.status).toBe(PayrollRunStatus.APPROVED);
    });

    it('throws ConflictException if run is already APPROVED', async () => {
      runRepo.findOne.mockResolvedValue({ id: 'run-1', schoolId: 'school-1', status: PayrollRunStatus.APPROVED });

      await expect(service.approveRun('run-1', 'school-1', 'admin-1'))
        .rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException if run does not exist', async () => {
      runRepo.findOne.mockResolvedValue(null);

      await expect(service.approveRun('bad-id', 'school-1', 'admin-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── upsertComponent ───────────────────────────────────────────────────────

  describe('upsertComponent', () => {
    it('creates new component when none exists', async () => {
      componentRepo.findOne.mockResolvedValue(null);
      componentRepo.create.mockReturnValue({ staffMemberId: 's1', componentType: ComponentType.BASE, amount: 500000 });
      componentRepo.save.mockResolvedValue({ id: 'c1', amount: 500000 });

      const result = await service.upsertComponent('school-1', 's1', ComponentType.BASE, 500000);
      expect(componentRepo.create).toHaveBeenCalled();
      expect(result.amount).toBe(500000);
    });

    it('updates amount on existing component', async () => {
      const existing = { id: 'c1', amount: 400000, isActive: true };
      componentRepo.findOne.mockResolvedValue(existing);
      componentRepo.save.mockResolvedValue({ ...existing, amount: 600000 });

      const result = await service.upsertComponent('school-1', 's1', ComponentType.BASE, 600000);
      expect(componentRepo.save).toHaveBeenCalledWith(expect.objectContaining({ amount: 600000 }));
      expect(result.amount).toBe(600000);
    });
  });
});
