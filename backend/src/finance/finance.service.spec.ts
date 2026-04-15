import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FinanceService } from './finance.service';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Payment, PaymentMethod } from './entities/payment.entity';
import { FeeStructure } from './entities/fee-structure.entity';
import { Expense } from './entities/expense.entity';

const mockRepo = () => ({
  findOne:       jest.fn(),
  find:          jest.fn(),
  save:          jest.fn(),
  create:        jest.fn(),
  findAndCount:  jest.fn(),
  count:         jest.fn(),
  update:        jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockDataSource = () => ({
  query: jest.fn(),
});

describe('FinanceService', () => {
  let service:     FinanceService;
  let invoiceRepo: ReturnType<typeof mockRepo>;
  let paymentRepo: ReturnType<typeof mockRepo>;
  let dataSource:  ReturnType<typeof mockDataSource>;

  beforeEach(async () => {
    invoiceRepo = mockRepo();
    paymentRepo = mockRepo();
    dataSource  = mockDataSource();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: getRepositoryToken(Invoice),      useValue: invoiceRepo },
        { provide: getRepositoryToken(Payment),      useValue: paymentRepo },
        { provide: getRepositoryToken(FeeStructure), useValue: mockRepo() },
        { provide: getRepositoryToken(Expense),      useValue: mockRepo() },
        { provide: DataSource,                       useValue: dataSource },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  // ── recordPayment ─────────────────────────────────────────────────────────

  describe('recordPayment', () => {
    const baseData = {
      invoiceId:    'inv-1',
      schoolId:     'school-1',
      amount:       100000,
      method:       PaymentMethod.MTN_MOBILE_MONEY,
      recordedById: 'user-1',
    };

    it('marks invoice as PAID when full amount is paid', async () => {
      const invoice = { id: 'inv-1', schoolId: 'school-1', amount: 100000, paidAmount: 0, status: InvoiceStatus.PENDING };
      invoiceRepo.findOne.mockResolvedValue(invoice);
      paymentRepo.create.mockReturnValue({ ...baseData });
      paymentRepo.save.mockResolvedValue({ id: 'pay-1' });
      invoiceRepo.save.mockResolvedValue({ ...invoice, paidAmount: 100000, status: InvoiceStatus.PAID });

      await service.recordPayment(baseData);

      expect(invoiceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: InvoiceStatus.PAID, paidAmount: 100000 }),
      );
    });

    it('marks invoice as PARTIAL when partially paid', async () => {
      const invoice = { id: 'inv-1', schoolId: 'school-1', amount: 300000, paidAmount: 0, status: InvoiceStatus.PENDING };
      invoiceRepo.findOne.mockResolvedValue(invoice);
      paymentRepo.create.mockReturnValue({});
      paymentRepo.save.mockResolvedValue({ id: 'pay-1' });
      invoiceRepo.save.mockResolvedValue({ ...invoice, paidAmount: 100000, status: InvoiceStatus.PARTIAL });

      await service.recordPayment(baseData);

      expect(invoiceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: InvoiceStatus.PARTIAL }),
      );
    });

    it('accumulates paidAmount on top of existing paid amount', async () => {
      const invoice = { id: 'inv-1', schoolId: 'school-1', amount: 300000, paidAmount: 100000, status: InvoiceStatus.PARTIAL };
      invoiceRepo.findOne.mockResolvedValue(invoice);
      paymentRepo.create.mockReturnValue({});
      paymentRepo.save.mockResolvedValue({ id: 'pay-1' });
      invoiceRepo.save.mockImplementation((i: any) => Promise.resolve(i));

      await service.recordPayment({ ...baseData, amount: 200000 });

      expect(invoiceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ paidAmount: 300000, status: InvoiceStatus.PAID }),
      );
    });

    it('throws NotFoundException when invoice not found', async () => {
      invoiceRepo.findOne.mockResolvedValue(null);

      await expect(service.recordPayment(baseData)).rejects.toThrow(NotFoundException);
    });
  });

  // ── collectionSummary ─────────────────────────────────────────────────────

  describe('collectionSummary', () => {
    it('returns correct rates when data exists', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ termTarget: '1000000', collected: '750000' }])
        .mockResolvedValueOnce([
          { classId: 'c1', target: '500000', collected: '400000' },
          { classId: 'c2', target: '500000', collected: '350000' },
        ]);

      const result = await service.collectionSummary('school-1', 'Term 1', '2026');

      expect(result.termTarget).toBe(1000000);
      expect(result.collected).toBe(750000);
      expect(result.collectionRate).toBe(75);
    });

    it('returns 0% rate when no invoices exist', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ termTarget: '0', collected: '0' }])
        .mockResolvedValueOnce([]);

      const result = await service.collectionSummary('school-1', 'Term 1', '2026');

      expect(result.collectionRate).toBe(0);
      expect(result.collected).toBe(0);
    });
  });

  // ── getInvoiceById ────────────────────────────────────────────────────────

  describe('getInvoiceById', () => {
    it('returns invoice when found', async () => {
      const invoice = { id: 'inv-1', schoolId: 'school-1' };
      invoiceRepo.findOne.mockResolvedValue(invoice);

      const result = await service.getInvoiceById('inv-1', 'school-1');
      expect(result).toEqual(invoice);
    });

    it('throws NotFoundException when not found', async () => {
      invoiceRepo.findOne.mockResolvedValue(null);

      await expect(service.getInvoiceById('bad-id', 'school-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getInvoiceByIdUnsafe ──────────────────────────────────────────────────

  describe('getInvoiceByIdUnsafe', () => {
    it('returns invoice without schoolId check', async () => {
      invoiceRepo.findOne.mockResolvedValue({ id: 'inv-1', schoolId: 'any-school' });
      const result = await service.getInvoiceByIdUnsafe('inv-1');
      expect(result?.id).toBe('inv-1');
    });

    it('returns null when invoice not found', async () => {
      invoiceRepo.findOne.mockResolvedValue(null);
      const result = await service.getInvoiceByIdUnsafe('bad-id');
      expect(result).toBeNull();
    });
  });
});
