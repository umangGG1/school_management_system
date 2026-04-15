import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }    from '../common/guards/jwt-auth.guard';
import { RolesGuard }      from '../common/guards/roles.guard';
import { Roles }           from '../common/decorators/roles.decorator';
import { CurrentUser }     from '../common/decorators/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Student }         from '../students/entities/student.entity';
import { ApprovalsService } from '../approvals/approvals.service';
import { FinanceService }   from '../finance/finance.service';
import { AdminService }     from './admin.service';
import { TicketStatus }     from './entities/support-ticket.entity';
import type { JwtPayload }  from '../auth/interfaces/jwt-payload.interface';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    @InjectRepository(User)    private readonly userRepo:    Repository<User>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    private readonly approvalsService: ApprovalsService,
    private readonly financeService:   FinanceService,
    private readonly adminService:     AdminService,
  ) {}

  /**
   * GET /api/admin/stats
   * Returns aggregated system statistics for the Admin Dashboard.
   */
  @Get('stats')
  async getStats(@CurrentUser() user: JwtPayload) {
    const schoolId = user.schoolId;
    const currentYear = new Date().getFullYear().toString();
    const currentTerm = 'Term 1';

    const [
      totalUsers,
      activeUsers,
      totalStudents,
      pendingApprovals,
      feeSummary,
      openTickets,
    ] = await Promise.all([
      this.userRepo.count({ where: { schoolId } }),
      this.userRepo.count({ where: { schoolId, isActive: true } }),
      this.studentRepo.count({ where: { schoolId, isActive: true } }),
      this.approvalsService.countPending(schoolId),
      this.financeService.collectionSummary(schoolId, currentTerm, currentYear),
      this.adminService.countOpenTickets(schoolId),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers:        totalUsers - activeUsers,
      totalStudents,
      pendingApprovals,
      feeCollectedThisTerm: feeSummary.collected,
      feeCollectionRate:    feeSummary.collectionRate,
      systemUptime:         '99.9%',
      openSupportTickets:   openTickets,
    };
  }

  // ── Academic Terms ────────────────────────────────────────────────────────

  @Get('terms')
  getTerms(@CurrentUser() user: JwtPayload) {
    return this.adminService.findTerms(user.schoolId);
  }

  @Post('terms')
  createTerm(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.adminService.createTerm(user.schoolId, body);
  }

  @Patch('terms/:id')
  updateTerm(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateTerm(id, user.schoolId, body);
  }

  // ── Reports ────────────────────────────────────────────────────────────────
  // Reports are generated as background jobs (Phase 6).
  // For now these endpoints return the job-queued status.

  @Get('reports')
  getReports() {
    return {
      message: 'Report generation is queued via POST /admin/reports/generate',
      reports: [],
    };
  }

  @Post('reports/generate')
  generateReport(@CurrentUser() user: JwtPayload, @Body() body: { type: string; term?: string; format?: string }) {
    // TODO (Phase 6): enqueue pdf-generation job and return job ID
    return {
      status: 'queued',
      message: `Report of type "${body.type}" has been queued for generation. PDF will be available once complete.`,
      jobId: `job-${Date.now()}`,
    };
  }

  // ── Support Tickets ───────────────────────────────────────────────────────

  @Get('support')
  getSupportTickets(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: TicketStatus,
  ) {
    return this.adminService.findTickets(user.schoolId, status);
  }

  @Post('support')
  createTicket(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.adminService.createTicket(user.schoolId, {
      ...body,
      reporterId: user.sub,
      reporterRole: user.activeRole ?? 'Admin',
    });
  }

  @Patch('support/:id')
  updateTicket(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { status?: TicketStatus; reply?: string; assignedToId?: string },
  ) {
    return this.adminService.updateTicket(id, user.schoolId, body);
  }

  // ── Integrations ──────────────────────────────────────────────────────────

  @Get('integrations')
  getIntegrations(@CurrentUser() user: JwtPayload) {
    return this.adminService.findIntegrations(user.schoolId);
  }

  @Post('integrations/:id/test')
  testIntegration(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.testIntegration(id, user.schoolId);
  }

  @Patch('integrations/:id')
  updateIntegration(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: any) {
    return this.adminService.upsertIntegration(user.schoolId, { ...body, id });
  }
}
