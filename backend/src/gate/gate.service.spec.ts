import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { GateService } from './gate.service';
import { GatePass, GatePassStatus } from './entities/gate-pass.entity';
import { VisitorLog } from './entities/visitor-log.entity';
import { NotificationGateway } from '../common/gateways/notification.gateway';

const mockRepo = () => ({
  findOne: jest.fn(),
  find:    jest.fn(),
  save:    jest.fn(),
  create:  jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
});

const mockGateway = { emitToSchool: jest.fn(), emitToUser: jest.fn() };

describe('GateService', () => {
  let service:     GateService;
  let passRepo:    ReturnType<typeof mockRepo>;
  let visitorRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    passRepo    = mockRepo();
    visitorRepo = mockRepo();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GateService,
        { provide: getRepositoryToken(GatePass),   useValue: passRepo },
        { provide: getRepositoryToken(VisitorLog), useValue: visitorRepo },
        { provide: NotificationGateway,            useValue: mockGateway },
      ],
    }).compile();

    service = module.get<GateService>(GateService);
  });

  // ── requestPass ───────────────────────────────────────────────────────────

  describe('requestPass', () => {
    it('creates a PENDING pass', async () => {
      const created = { id: 'pass-1', status: GatePassStatus.PENDING };
      passRepo.create.mockReturnValue(created);
      passRepo.save.mockResolvedValue(created);

      const result = await service.requestPass('school-1', { studentId: 'stu-1', requestedBy: 'user-1' });
      expect(result.status).toBe(GatePassStatus.PENDING);
      expect(passRepo.save).toHaveBeenCalled();
    });
  });

  // ── approvePass ───────────────────────────────────────────────────────────

  describe('approvePass', () => {
    const validFrom  = new Date();
    const validUntil = new Date(Date.now() + 3 * 60 * 60 * 1000);

    it('approves a PENDING pass and emits Socket.io event', async () => {
      const pass = { id: 'pass-1', schoolId: 'school-1', studentId: 'stu-1', status: GatePassStatus.PENDING };
      passRepo.findOne.mockResolvedValue(pass);
      passRepo.save.mockImplementation((p: any) => Promise.resolve({ ...p, status: GatePassStatus.APPROVED, passCode: '123456' }));

      const result = await service.approvePass('pass-1', 'school-1', { authorizedBy: 'admin-1', validFrom, validUntil });

      expect(result.status).toBe(GatePassStatus.APPROVED);
      expect(result.passCode).toHaveLength(6);
      expect(mockGateway.emitToSchool).toHaveBeenCalledWith(
        'school-1',
        'gate:pass-approved',
        expect.objectContaining({ studentId: 'stu-1', passCode: '123456' }),
      );
    });

    it('throws NotFoundException when pass not found', async () => {
      passRepo.findOne.mockResolvedValue(null);
      await expect(service.approvePass('bad', 'school-1', { authorizedBy: 'a', validFrom, validUntil }))
        .rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when pass is not PENDING', async () => {
      passRepo.findOne.mockResolvedValue({ id: 'pass-1', status: GatePassStatus.APPROVED });
      await expect(service.approvePass('pass-1', 'school-1', { authorizedBy: 'a', validFrom, validUntil }))
        .rejects.toThrow(ConflictException);
    });

    it('generates unique 6-digit pass codes', async () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        // Access private method via any cast
        const code = (service as any).generatePassCode() as string;
        expect(code).toHaveLength(6);
        expect(/^\d{6}$/.test(code)).toBe(true);
        codes.add(code);
      }
      // Should have reasonable uniqueness (at least 50 distinct from 100 calls)
      expect(codes.size).toBeGreaterThan(50);
    });
  });

  // ── logExit ───────────────────────────────────────────────────────────────

  describe('logExit', () => {
    it('marks pass as USED and emits student-exit event', async () => {
      const pass = { id: 'pass-1', schoolId: 'school-1', studentId: 'stu-1', passCode: '654321', status: GatePassStatus.APPROVED };
      passRepo.findOne.mockResolvedValue(pass);
      passRepo.save.mockImplementation((p: any) => Promise.resolve({ ...p, status: GatePassStatus.USED, usedAt: new Date() }));

      const result = await service.logExit('school-1', '654321');

      expect(result.status).toBe(GatePassStatus.USED);
      expect(result.usedAt).toBeDefined();
      expect(mockGateway.emitToSchool).toHaveBeenCalledWith(
        'school-1',
        'gate:student-exit',
        expect.objectContaining({ studentId: 'stu-1', passCode: '654321' }),
      );
    });

    it('throws NotFoundException when no approved pass for code', async () => {
      passRepo.findOne.mockResolvedValue(null);
      await expect(service.logExit('school-1', '000000')).rejects.toThrow(NotFoundException);
    });
  });

  // ── logReturn ─────────────────────────────────────────────────────────────

  describe('logReturn', () => {
    it('records return time on a USED pass', async () => {
      const pass = { id: 'pass-1', schoolId: 'school-1', passCode: '654321', status: GatePassStatus.USED };
      passRepo.findOne.mockResolvedValue(pass);
      passRepo.save.mockImplementation((p: any) => Promise.resolve({ ...p, returnedAt: new Date() }));

      const result = await service.logReturn('school-1', '654321');
      expect(result.returnedAt).toBeDefined();
    });

    it('throws NotFoundException when no USED pass for code', async () => {
      passRepo.findOne.mockResolvedValue(null);
      await expect(service.logReturn('school-1', '000000')).rejects.toThrow(NotFoundException);
    });
  });

  // ── registerVisitor ───────────────────────────────────────────────────────

  describe('registerVisitor', () => {
    it('creates visitor log with entryTime', async () => {
      const created = { id: 'v1', visitorName: 'John Doe', entryTime: new Date() };
      visitorRepo.create.mockReturnValue(created);
      visitorRepo.save.mockResolvedValue(created);

      const result = await service.registerVisitor('school-1', { visitorName: 'John Doe' }, 'guard-1');
      expect(result.visitorName).toBe('John Doe');
      expect(result.entryTime).toBeDefined();
    });
  });
});
