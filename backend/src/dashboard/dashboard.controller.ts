import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('head-teacher')
  @Roles(UserRole.HEAD_TEACHER, UserRole.SUPER_ADMIN)
  headTeacher(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.dashboardService.headTeacherSummary(
      user.schoolId,
      term ?? 'Term 1',
      academicYear ?? '2025/2026',
    );
  }

  @Get('academic')
  @Roles(UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.HOD, UserRole.SUPER_ADMIN)
  academic(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.dashboardService.academicSummary(user.schoolId, term ?? 'Term 1', academicYear ?? '2025/2026');
  }

  @Get('staff')
  @Roles(UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.HR_OFFICER, UserRole.SUPER_ADMIN)
  staff(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.staffSummary(user.schoolId);
  }

  @Get('finance')
  @Roles(UserRole.HEAD_TEACHER, UserRole.FINANCE_OFFICER, UserRole.SUPER_ADMIN)
  finance(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.dashboardService.financeSummary(user.schoolId, term ?? 'Term 1', academicYear ?? '2025/2026');
  }

  @Get('boarding')
  @Roles(UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.HEAD_OF_BOARDING, UserRole.BOARDING_MASTER)
  boarding(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.boardingSummary(user.schoolId);
  }

  @Get('security')
  @Roles(UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.HEAD_OF_SECURITY)
  security(@CurrentUser() user: JwtPayload, @Query('date') date?: string) {
    return this.dashboardService.securitySummary(user.schoolId, date);
  }
}
