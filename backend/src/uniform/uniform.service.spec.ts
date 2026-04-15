import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UniformService } from './uniform.service';
import { UniformItem } from './entities/uniform-item.entity';
import { UniformStock, UniformSize } from './entities/uniform-stock.entity';
import { UniformAllocation } from './entities/uniform-allocation.entity';

const mockRepo = () => ({
  findOne:  jest.fn(),
  find:     jest.fn(),
  save:     jest.fn(),
  create:   jest.fn(),
  update:   jest.fn(),
  increment: jest.fn(),
  findAndCount: jest.fn(),
});

describe('UniformService', () => {
  let service:        UniformService;
  let itemRepo:       ReturnType<typeof mockRepo>;
  let stockRepo:      ReturnType<typeof mockRepo>;
  let allocationRepo: ReturnType<typeof mockRepo>;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    itemRepo       = mockRepo();
    stockRepo      = mockRepo();
    allocationRepo = mockRepo();
    dataSource     = { query: jest.fn() };
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniformService,
        { provide: getRepositoryToken(UniformItem),       useValue: itemRepo },
        { provide: getRepositoryToken(UniformStock),      useValue: stockRepo },
        { provide: getRepositoryToken(UniformAllocation), useValue: allocationRepo },
        { provide: DataSource,                            useValue: dataSource },
      ],
    }).compile();

    service = module.get<UniformService>(UniformService);
  });

  // ── issueUniform (atomic decrement) ──────────────────────────────────────

  describe('issueUniform', () => {
    const issueData = {
      studentId:     'stu-1',
      uniformItemId: 'item-1',
      uniformStockId: 'stock-1',
      size:          UniformSize.M,
      quantity:      2,
      issuedBy:      'user-1',
    };

    it('decrements stock and creates allocation when stock is sufficient', async () => {
      // Atomic SQL returns [result, rowsAffected]
      dataSource.query.mockResolvedValue([null, 1]);
      const allocation = { id: 'alloc-1', ...issueData, schoolId: 'school-1' };
      allocationRepo.create.mockReturnValue(allocation);
      allocationRepo.save.mockResolvedValue(allocation);

      const result = await service.issueUniform('school-1', issueData);
      expect(result.id).toBe('alloc-1');

      // Verify the atomic SQL was called with correct params
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('quantity_in_stock = quantity_in_stock - $1'),
        [2, 'stock-1', 'school-1'],
      );
    });

    it('throws ConflictException when stock is insufficient (0 rows updated)', async () => {
      // rowsAffected = 0 means the WHERE clause failed (qty < requested)
      dataSource.query.mockResolvedValue([null, 0]);

      await expect(service.issueUniform('school-1', issueData))
        .rejects.toThrow(ConflictException);

      expect(allocationRepo.save).not.toHaveBeenCalled();
    });
  });

  // ── returnUniform ─────────────────────────────────────────────────────────

  describe('returnUniform', () => {
    it('records return date and increments stock', async () => {
      const allocation = { id: 'alloc-1', schoolId: 'school-1', uniformStockId: 'stock-1', quantity: 2, returnedAt: null };
      allocationRepo.findOne.mockResolvedValue(allocation);
      allocationRepo.save.mockImplementation((a: any) => Promise.resolve(a));
      stockRepo.increment.mockResolvedValue({});

      const result = await service.returnUniform('alloc-1', 'school-1', 'GOOD');

      expect(stockRepo.increment).toHaveBeenCalledWith(
        { id: 'stock-1', schoolId: 'school-1' },
        'quantityInStock',
        2,
      );
      expect(result.returnedAt).toBeInstanceOf(Date);
    });

    it('throws ConflictException when already returned', async () => {
      allocationRepo.findOne.mockResolvedValue({ id: 'alloc-1', returnedAt: new Date() });

      await expect(service.returnUniform('alloc-1', 'school-1', 'WORN'))
        .rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when allocation not found', async () => {
      allocationRepo.findOne.mockResolvedValue(null);

      await expect(service.returnUniform('bad-id', 'school-1', 'GOOD'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── adjustStock ───────────────────────────────────────────────────────────

  describe('adjustStock', () => {
    it('adjusts stock by positive delta (adding stock)', async () => {
      const stock = { id: 'stock-1', schoolId: 'school-1', quantityInStock: 10 };
      stockRepo.findOne.mockResolvedValue(stock);
      stockRepo.save.mockImplementation((s: any) => Promise.resolve(s));

      const result = await service.adjustStock('school-1', 'stock-1', 20, 'donated');
      expect(result.quantityInStock).toBe(30);
    });

    it('adjusts stock by negative delta (removing stock)', async () => {
      const stock = { id: 'stock-1', schoolId: 'school-1', quantityInStock: 10 };
      stockRepo.findOne.mockResolvedValue(stock);
      stockRepo.save.mockImplementation((s: any) => Promise.resolve(s));

      const result = await service.adjustStock('school-1', 'stock-1', -5, 'damaged');
      expect(result.quantityInStock).toBe(5);
    });

    it('never goes below 0 (floor at 0)', async () => {
      const stock = { id: 'stock-1', schoolId: 'school-1', quantityInStock: 3 };
      stockRepo.findOne.mockResolvedValue(stock);
      stockRepo.save.mockImplementation((s: any) => Promise.resolve(s));

      const result = await service.adjustStock('school-1', 'stock-1', -100, 'big loss');
      expect(result.quantityInStock).toBe(0);
    });

    it('throws NotFoundException when stock record not found', async () => {
      stockRepo.findOne.mockResolvedValue(null);
      await expect(service.adjustStock('school-1', 'bad-id', 5, 'reason'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
