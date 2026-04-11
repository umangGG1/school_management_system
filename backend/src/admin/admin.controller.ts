import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
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
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

/* ── Static seed data for stubs ─────────────────────────────────────── */
const TERMS_SEED = [
  { id: 'term-1-2026', name: 'Term 1 2026', startDate: '2026-01-13', endDate: '2026-04-04', weeks: 12, status: 'current' },
  { id: 'term-2-2026', name: 'Term 2 2026', startDate: '2026-05-11', endDate: '2026-08-07', weeks: 13, status: 'upcoming' },
  { id: 'term-3-2026', name: 'Term 3 2026', startDate: '2026-09-07', endDate: '2026-11-20', weeks: 11, status: 'upcoming' },
];

const REPORTS_SEED = [
  { id: 'RPT-001', name: 'Term 1 Fee Collection',          type: 'finance',  generatedAt: null, size: null,     status: 'pending' },
  { id: 'RPT-002', name: 'Staff Attendance Report',        type: 'hr',       generatedAt: null, size: null,     status: 'pending' },
  { id: 'RPT-003', name: 'Student Academic Results S.4',   type: 'academic', generatedAt: null, size: null,     status: 'pending' },
  { id: 'RPT-004', name: 'Welfare & Counselling Summary',  type: 'welfare',  generatedAt: null, size: null,     status: 'pending' },
  { id: 'RPT-005', name: 'MoES EMIS Submission (Term 1)', type: 'moes',     generatedAt: null, size: null,     status: 'pending' },
  { id: 'RPT-006', name: 'Annual Budget Variance',         type: 'finance',  generatedAt: null, size: null,     status: 'pending' },
];

const SUPPORT_SEED = [
  { id: 'TKT-001', title: 'Login not working for new teacher account', reporterName: 'Ms. Nakagolo Patricia', reporterRole: 'Teacher',  priority: 'high',   status: 'open',        category: 'account', createdAt: new Date().toISOString() },
  { id: 'TKT-002', title: 'Fee receipt not generating after payment',  reporterName: 'Mr. Ochieng David',    reporterRole: 'Parent',   priority: 'medium', status: 'in_progress', category: 'billing', createdAt: new Date().toISOString() },
  { id: 'TKT-003', title: 'Attendance report showing wrong dates',     reporterName: 'Mr. Kato Emmanuel',    reporterRole: 'Bursar',   priority: 'low',    status: 'resolved',    category: 'bug',     createdAt: new Date().toISOString() },
  { id: 'TKT-004', title: 'Unable to upload lesson notes (> 10MB)',   reporterName: 'Ms. Nakakande Mary',   reporterRole: 'Teacher',  priority: 'medium', status: 'resolved',    category: 'upload',  createdAt: new Date().toISOString() },
];

const INTEGRATIONS_SEED = [
  { id: 'sms',      name: "SMS Gateway (Africa's Talking)", status: 'connected',    lastTested: new Date().toISOString(), icon: '📱', configured: true  },
  { id: 'email',    name: 'Email (SMTP / Gmail)',            status: 'connected',    lastTested: new Date().toISOString(), icon: '📧', configured: true  },
  { id: 'payments', name: 'Mobile Money (MTN MoMo)',         status: 'connected',    lastTested: new Date().toISOString(), icon: '💳', configured: true  },
  { id: 'backup',   name: 'Cloud Backup (Google Drive)',     status: 'connected',    lastTested: new Date().toISOString(), icon: '☁️', configured: true  },
  { id: 'moes',     name: 'MoES EMIS Data Sync',            status: 'pending',      lastTested: null,                     icon: '🏛️', configured: false },
  { id: 'uca',      name: 'UCA Payroll Integration',         status: 'disconnected', lastTested: null,                     icon: '💰', configured: false },
];

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    @InjectRepository(User)    private readonly userRepo:    Repository<User>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    private readonly approvalsService: ApprovalsService,
    private readonly financeService:   FinanceService,
  ) {}

  /**
   * GET /api/admin/stats
   * Returns aggregated system statistics for the Admin Dashboard.
   */
  @Get('stats')
  async getStats(@CurrentUser() user: JwtPayload) {
    const schoolId = user.schoolId;
    const currentYear = new Date().getFullYear().toString();
    const currentTerm = 'Term 1';  // TODO: derive from school.currentTerm once we load it

    const [
      totalUsers,
      activeUsers,
      totalStudents,
      pendingApprovals,
      feeSummary,
    ] = await Promise.all([
      this.userRepo.count({ where: { schoolId } }),
      this.userRepo.count({ where: { schoolId, isActive: true } }),
      this.studentRepo.count({ where: { schoolId, isActive: true } }),
      this.approvalsService.countPending(schoolId),
      this.financeService.collectionSummary(schoolId, currentTerm, currentYear),
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
      openSupportTickets:   SUPPORT_SEED.filter(t => t.status === 'open').length,
    };
  }

  // ── Academic Terms ────────────────────────────────────────────────────────

  /** GET /api/admin/terms — list academic terms */
  @Get('terms')
  getTerms() {
    return TERMS_SEED;
  }

  /** PATCH /api/admin/terms/:id — update a term */
  @Patch('terms/:id')
  updateTerm(@Param('id') id: string, @Body() body: any) {
    const idx = TERMS_SEED.findIndex(t => t.id === id);
    if (idx === -1) return { error: 'Term not found' };
    Object.assign(TERMS_SEED[idx], body);
    return TERMS_SEED[idx];
  }

  /** POST /api/admin/terms — create a term */
  @Post('terms')
  createTerm(@Body() body: any) {
    const term = { id: `term-${Date.now()}`, status: 'upcoming', ...body };
    TERMS_SEED.push(term as any);
    return term;
  }

  // ── Reports ────────────────────────────────────────────────────────────────

  /** GET /api/admin/reports */
  @Get('reports')
  getReports() {
    return REPORTS_SEED;
  }

  /** POST /api/admin/reports/generate */
  @Post('reports/generate')
  generateReport(@Body() body: { type: string; term?: string; format?: string }) {
    const report = REPORTS_SEED.find(r => r.type === body.type) ?? REPORTS_SEED[0];
    return {
      ...report,
      status: 'ready',
      generatedAt: new Date().toISOString(),
      size: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`,
      format: body.format ?? 'PDF',
    };
  }

  // ── Support Tickets ───────────────────────────────────────────────────────

  /** GET /api/admin/support */
  @Get('support')
  getSupportTickets() {
    return SUPPORT_SEED;
  }

  /** PATCH /api/admin/support/:id */
  @Patch('support/:id')
  updateTicket(@Param('id') id: string, @Body() body: { status?: string; reply?: string }) {
    const ticket = SUPPORT_SEED.find(t => t.id === id);
    if (!ticket) return { error: 'Ticket not found' };
    if (body.status) (ticket as any).status = body.status;
    return ticket;
  }

  /** POST /api/admin/support */
  @Post('support')
  createTicket(@CurrentUser() user: JwtPayload, @Body() body: any) {
    const ticket = {
      id: `TKT-${String(SUPPORT_SEED.length + 1).padStart(3, '0')}`,
      status: 'open',
      createdAt: new Date().toISOString(),
      reporterName: `${user.sub}`,
      reporterRole: user.activeRole ?? 'Admin',
      ...body,
    };
    SUPPORT_SEED.push(ticket as any);
    return ticket;
  }

  // ── Integrations ──────────────────────────────────────────────────────────

  /** GET /api/admin/integrations */
  @Get('integrations')
  getIntegrations() {
    return INTEGRATIONS_SEED;
  }

  /** POST /api/admin/integrations/:id/test */
  @Post('integrations/:id/test')
  testIntegration(@Param('id') id: string) {
    const svc = INTEGRATIONS_SEED.find(s => s.id === id);
    if (!svc) return { error: 'Integration not found' };
    (svc as any).lastTested = new Date().toISOString();
    if (svc.configured) {
      (svc as any).status = 'connected';
    }
    return { ...svc, testResult: svc.configured ? 'success' : 'failed', message: svc.configured ? 'Connection successful' : 'API key not configured' };
  }
}
