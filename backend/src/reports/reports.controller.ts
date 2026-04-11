import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { UserRole }      from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { IsOptional, IsString } from 'class-validator';

class ReportQueryDto {
  @IsOptional() @IsString() term?: string;
  @IsOptional() @IsString() academicYear?: string;
  @IsOptional() @IsString() classId?: string;
}

const REPORT_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.HEAD_TEACHER,
  UserRole.DEPUTY_HEAD,
  UserRole.FINANCE_OFFICER,
  UserRole.HOD,
  UserRole.EXAMINATIONS_OFFICER,
];

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...REPORT_ROLES)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** GET /api/reports/academic?term=Term+1&academicYear=2026&classId= */
  @Get('academic')
  async academicReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReportQueryDto,
  ) {
    const year = new Date().getFullYear().toString();
    return this.reportsService.academicReport(
      user.schoolId,
      query.term ?? 'Term 1',
      query.academicYear ?? year,
      query.classId,
    );
  }

  /** GET /api/reports/finance?term=Term+1&academicYear=2026 */
  @Get('finance')
  async financeReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReportQueryDto,
  ) {
    const year = new Date().getFullYear().toString();
    return this.reportsService.financeReport(
      user.schoolId,
      query.term ?? 'Term 1',
      query.academicYear ?? year,
    );
  }

  /** GET /api/reports/boarding */
  @Get('boarding')
  async boardingReport(@CurrentUser() user: JwtPayload) {
    return this.reportsService.boardingReport(user.schoolId);
  }

  /** GET /api/reports/admin?term=Term+1&academicYear=2026 */
  @Get('admin')
  async adminReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReportQueryDto,
  ) {
    const year = new Date().getFullYear().toString();
    return this.reportsService.adminReport(
      user.schoolId,
      query.term ?? 'Term 1',
      query.academicYear ?? year,
    );
  }
}
