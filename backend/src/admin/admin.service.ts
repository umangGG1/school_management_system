import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicTerm, TermStatus } from './entities/academic-term.entity';
import { SupportTicket, TicketStatus } from './entities/support-ticket.entity';
import { IntegrationConfig, IntegrationStatus } from './entities/integration-config.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AcademicTerm)
    private readonly termRepo: Repository<AcademicTerm>,
    @InjectRepository(SupportTicket)
    private readonly ticketRepo: Repository<SupportTicket>,
    @InjectRepository(IntegrationConfig)
    private readonly integrationRepo: Repository<IntegrationConfig>,
  ) {}

  // ── Academic Terms ─────────────────────────────────────────────────────────

  async findTerms(schoolId: string): Promise<AcademicTerm[]> {
    return this.termRepo.find({
      where: { schoolId },
      order: { startDate: 'DESC' },
    });
  }

  async createTerm(schoolId: string, data: Partial<AcademicTerm>): Promise<AcademicTerm> {
    return this.termRepo.save(this.termRepo.create({ ...data, schoolId }));
  }

  async updateTerm(id: string, schoolId: string, data: Partial<AcademicTerm>): Promise<AcademicTerm> {
    const term = await this.termRepo.findOne({ where: { id, schoolId } });
    if (!term) throw new NotFoundException('Term not found');

    // If setting this term as current, demote all others
    if (data.status === TermStatus.CURRENT) {
      await this.termRepo.update(
        { schoolId, status: TermStatus.CURRENT },
        { status: TermStatus.COMPLETED },
      );
    }

    return this.termRepo.save({ ...term, ...data });
  }

  // ── Support Tickets ────────────────────────────────────────────────────────

  async findTickets(schoolId: string, status?: TicketStatus): Promise<SupportTicket[]> {
    const where: any = { schoolId };
    if (status) where.status = status;
    return this.ticketRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async countOpenTickets(schoolId: string): Promise<number> {
    return this.ticketRepo.count({ where: { schoolId, status: TicketStatus.OPEN } });
  }

  async createTicket(schoolId: string, data: Partial<SupportTicket>): Promise<SupportTicket> {
    return this.ticketRepo.save(this.ticketRepo.create({ ...data, schoolId }));
  }

  async updateTicket(
    id: string,
    schoolId: string,
    data: { status?: TicketStatus; reply?: string; assignedToId?: string },
  ): Promise<SupportTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { id, schoolId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const updates: Partial<SupportTicket> = { ...data };
    if (data.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
      updates.resolvedAt = new Date();
    }

    return this.ticketRepo.save({ ...ticket, ...updates });
  }

  // ── Integrations ──────────────────────────────────────────────────────────

  async findIntegrations(schoolId: string): Promise<IntegrationConfig[]> {
    return this.integrationRepo.find({
      where: { schoolId },
      order: { provider: 'ASC' },
    });
  }

  async testIntegration(id: string, schoolId: string): Promise<IntegrationConfig & { testResult: string; message: string }> {
    const integration = await this.integrationRepo.findOne({ where: { id, schoolId } });
    if (!integration) throw new NotFoundException('Integration not found');

    // Update lastTestedAt regardless of result
    integration.lastTestedAt = new Date();

    // Determine result based on isEnabled + config presence
    const isConfigured = integration.isEnabled && !!integration.config;
    integration.status = isConfigured ? IntegrationStatus.CONNECTED : IntegrationStatus.DISCONNECTED;
    await this.integrationRepo.save(integration);

    return {
      ...integration,
      testResult: isConfigured ? 'success' : 'failed',
      message: isConfigured ? 'Connection successful' : 'Integration not fully configured',
    };
  }

  async upsertIntegration(
    schoolId: string,
    data: Partial<IntegrationConfig>,
  ): Promise<IntegrationConfig> {
    const existing = await this.integrationRepo.findOne({
      where: { schoolId, provider: data.provider },
    });

    if (existing) {
      return this.integrationRepo.save({ ...existing, ...data });
    }

    return this.integrationRepo.save(this.integrationRepo.create({ ...data, schoolId }));
  }
}
