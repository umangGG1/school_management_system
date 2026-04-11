import { Controller, Get, UseGuards } from '@nestjs/common';
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
      openSupportTickets:   0,
    };
  }
}
