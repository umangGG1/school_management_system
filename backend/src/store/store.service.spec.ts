import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StoreService } from './store.service';
import { StoreItem } from './entities/store-item.entity';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { Requisition, RequisitionStatus } from './entities/requisition.entity';
import { RequisitionItem } from './entities/requisition-item.entity';

const mockRepo = () => ({
  findOne: jest.fn(),
  find:    jest.fn(),
  save:    jest.fn(),
  create:  jest.fn(),
  update:  jest.fn(),
  findAndCount: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
});

// Mock DataSource with transaction support
const makeManager = () => ({
  findOne:  jest.fn(),
  find:     jest.fn(),
  save:     jest.fn(),
  create:   jest.fn(),
  update:   jest.fn(),
  query:    jest.fn(),
  getRepository: jest.fn(),
});

const mockDataSource = (manager: ReturnType<typeof makeManager>) => ({
  query: jest.fn(),
  transaction: jest.fn((cb: (m: any) => Promise<any>) => cb(manager)),
});

describe('StoreService', () => {
  let service:       StoreService;
  let itemRepo:      ReturnType<typeof mockRepo>;
  let movementRepo:  ReturnType<typeof mockRepo>;
  let requisitionRepo: ReturnType<typeof mockRepo>;
  let reqItemRepo:   ReturnType<typeof mockRepo>;
  let manager:       ReturnType<typeof makeManager>;
  let dataSource:    ReturnType<typeof mockDataSource>;

  beforeEach(async () => {
    itemRepo      = mockRepo();
    movementRepo  = mockRepo();
    requisitionRepo = mockRepo();
    reqItemRepo   = mockRepo();
    manager       = makeManager();
    dataSource    = mockDataSource(manager);
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: getRepositoryToken(StoreItem),       useValue: itemRepo },
        { provide: getRepositoryToken(StockMovement),   useValue: movementRepo },
        { provide: getRepositoryToken(Requisition),     useValue: requisitionRepo },
        { provide: getRepositoryToken(RequisitionItem), useValue: reqItemRepo },
        { provide: DataSource,                          useValue: dataSource },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  // ── manualAdjustment ──────────────────────────────────────────────────────

  describe('manualAdjustment', () => {
    it('decrements stock on OUT movement', async () => {
      itemRepo.findOne.mockResolvedValue({ id: 'item-1', quantityInStock: 50 });
      movementRepo.create.mockReturnValue({});
      movementRepo.save.mockResolvedValue({ id: 'mov-1' });

      await service.manualAdjustment('school-1', 'item-1', MovementType.OUT, 10, 'used in class', 'user-1');

      expect(itemRepo.update).toHaveBeenCalledWith({ id: 'item-1' }, { quantityInStock: 40 });
    });

    it('increments stock on IN movement', async () => {
      itemRepo.findOne.mockResolvedValue({ id: 'item-1', quantityInStock: 20 });
      movementRepo.create.mockReturnValue({});
      movementRepo.save.mockResolvedValue({ id: 'mov-1' });

      await service.manualAdjustment('school-1', 'item-1', MovementType.IN, 30, 'restocked', 'user-1');

      expect(itemRepo.update).toHaveBeenCalledWith({ id: 'item-1' }, { quantityInStock: 50 });
    });

    it('throws ConflictException when stock would go negative', async () => {
      itemRepo.findOne.mockResolvedValue({ id: 'item-1', quantityInStock: 5 });

      await expect(
        service.manualAdjustment('school-1', 'item-1', MovementType.OUT, 10, 'over-issue', 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when item not found', async () => {
      itemRepo.findOne.mockResolvedValue(null);

      await expect(
        service.manualAdjustment('school-1', 'bad-id', MovementType.OUT, 1, '', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── rejectRequisition ─────────────────────────────────────────────────────

  describe('rejectRequisition', () => {
    it('rejects a PENDING requisition', async () => {
      const req = { id: 'req-1', schoolId: 'school-1', status: RequisitionStatus.PENDING };
      requisitionRepo.findOne.mockResolvedValue(req);
      requisitionRepo.save.mockImplementation((r: any) => Promise.resolve(r));

      const result = await service.rejectRequisition('req-1', 'school-1', 'admin-1');
      expect(result.status).toBe(RequisitionStatus.REJECTED);
    });

    it('throws ConflictException on non-PENDING requisition', async () => {
      requisitionRepo.findOne.mockResolvedValue({ id: 'req-1', status: RequisitionStatus.FULFILLED });

      await expect(service.rejectRequisition('req-1', 'school-1', 'admin-1'))
        .rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when requisition not found', async () => {
      requisitionRepo.findOne.mockResolvedValue(null);

      await expect(service.rejectRequisition('bad-id', 'school-1', 'admin-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── findLowStock ──────────────────────────────────────────────────────────

  describe('findLowStock', () => {
    it('queries for items where stock <= reorder level', async () => {
      dataSource.query.mockResolvedValue([{ id: 'item-1', quantityInStock: 3, reorderLevel: 5 }]);

      const result = await service.findLowStock('school-1');

      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('quantity_in_stock <= reorder_level'),
        ['school-1'],
      );
      expect(result).toHaveLength(1);
    });
  });
});
