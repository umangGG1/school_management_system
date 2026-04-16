import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AcademicTerm, TermStatus } from './entities/academic-term.entity';
import { SupportTicket, TicketStatus } from './entities/support-ticket.entity';
import { IntegrationConfig, IntegrationStatus, IntegrationProvider } from './entities/integration-config.entity';

const mockRepo = () => ({
  findOne: jest.fn(),
  find:    jest.fn(),
  save:    jest.fn(),
  create:  jest.fn(),
  update:  jest.fn(),
  count:   jest.fn(),
});

describe('AdminService', () => {
  let service:         AdminService;
  let termRepo:        ReturnType<typeof mockRepo>;
  let ticketRepo:      ReturnType<typeof mockRepo>;
  let integrationRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    termRepo        = mockRepo();
    ticketRepo      = mockRepo();
    integrationRepo = mockRepo();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(AcademicTerm),     useValue: termRepo },
        { provide: getRepositoryToken(SupportTicket),    useValue: ticketRepo },
        { provide: getRepositoryToken(IntegrationConfig), useValue: integrationRepo },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  // ── updateTerm ────────────────────────────────────────────────────────────

  describe('updateTerm', () => {
    it('demotes existing CURRENT term when a new one is set to CURRENT', async () => {
      const term = { id: 'term-1', schoolId: 'school-1', status: TermStatus.UPCOMING };
      termRepo.findOne.mockResolvedValue(term);
      termRepo.update.mockResolvedValue({});
      termRepo.save.mockImplementation((t: any) => Promise.resolve(t));

      await service.updateTerm('term-1', 'school-1', { status: TermStatus.CURRENT });

      expect(termRepo.update).toHaveBeenCalledWith(
        { schoolId: 'school-1', status: TermStatus.CURRENT },
        { status: TermStatus.COMPLETED },
      );
    });

    it('does NOT call update when status is not CURRENT', async () => {
      const term = { id: 'term-1', schoolId: 'school-1', status: TermStatus.CURRENT };
      termRepo.findOne.mockResolvedValue(term);
      termRepo.save.mockImplementation((t: any) => Promise.resolve(t));

      await service.updateTerm('term-1', 'school-1', { status: TermStatus.COMPLETED });

      expect(termRepo.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when term not found', async () => {
      termRepo.findOne.mockResolvedValue(null);

      await expect(service.updateTerm('bad-id', 'school-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateTicket ──────────────────────────────────────────────────────────

  describe('updateTicket', () => {
    it('auto-sets resolvedAt when status changes to RESOLVED', async () => {
      const ticket = { id: 't-1', schoolId: 'school-1', status: TicketStatus.OPEN, resolvedAt: null };
      ticketRepo.findOne.mockResolvedValue(ticket);
      ticketRepo.save.mockImplementation((t: any) => Promise.resolve(t));

      const result = await service.updateTicket('t-1', 'school-1', { status: TicketStatus.RESOLVED });
      expect(result.resolvedAt).toBeDefined();
      expect(result.resolvedAt).toBeInstanceOf(Date);
    });

    it('does not overwrite resolvedAt if already set', async () => {
      const alreadySet = new Date('2026-01-01');
      const ticket = { id: 't-1', schoolId: 'school-1', status: TicketStatus.RESOLVED, resolvedAt: alreadySet };
      ticketRepo.findOne.mockResolvedValue(ticket);
      ticketRepo.save.mockImplementation((t: any) => Promise.resolve(t));

      const result = await service.updateTicket('t-1', 'school-1', { status: TicketStatus.RESOLVED });
      expect(result.resolvedAt).toEqual(alreadySet);
    });

    it('throws NotFoundException when ticket not found', async () => {
      ticketRepo.findOne.mockResolvedValue(null);

      await expect(service.updateTicket('bad-id', 'school-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ── countOpenTickets ──────────────────────────────────────────────────────

  describe('countOpenTickets', () => {
    it('returns count of open tickets', async () => {
      ticketRepo.count.mockResolvedValue(7);

      const result = await service.countOpenTickets('school-1');
      expect(result).toBe(7);
      expect(ticketRepo.count).toHaveBeenCalledWith({
        where: { schoolId: 'school-1', status: TicketStatus.OPEN },
      });
    });
  });

  // ── testIntegration ───────────────────────────────────────────────────────

  describe('testIntegration', () => {
    it('marks CONNECTED when integration is enabled and configured', async () => {
      const integration = { id: 'int-1', schoolId: 'school-1', isEnabled: true, config: { key: 'value' }, status: IntegrationStatus.DISCONNECTED };
      integrationRepo.findOne.mockResolvedValue(integration);
      integrationRepo.save.mockImplementation((i: any) => Promise.resolve(i));

      const result = await service.testIntegration('int-1', 'school-1');
      expect(result.testResult).toBe('success');
      expect(result.status).toBe(IntegrationStatus.CONNECTED);
    });

    it('marks DISCONNECTED when integration is not enabled', async () => {
      const integration = { id: 'int-1', schoolId: 'school-1', isEnabled: false, config: null, status: IntegrationStatus.CONNECTED };
      integrationRepo.findOne.mockResolvedValue(integration);
      integrationRepo.save.mockImplementation((i: any) => Promise.resolve(i));

      const result = await service.testIntegration('int-1', 'school-1');
      expect(result.testResult).toBe('failed');
      expect(result.status).toBe(IntegrationStatus.DISCONNECTED);
    });

    it('throws NotFoundException when integration not found', async () => {
      integrationRepo.findOne.mockResolvedValue(null);

      await expect(service.testIntegration('bad-id', 'school-1')).rejects.toThrow(NotFoundException);
    });
  });
});
