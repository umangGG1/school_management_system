import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import { UserRole }      from '../users/entities/user.entity';
import { EcaService }    from './eca.service';
import type { JwtPayload }         from '../auth/interfaces/jwt-payload.interface';
import type { RecordAttendanceData } from './eca.service';

@Controller('eca')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EcaController {
  constructor(private readonly ecaService: EcaService) {}

  // ── Summary ────────────────────────────────────────────────────────────────

  @Get('summary')
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.ecaService.getSummary(user.schoolId);
  }

  // ── Activities ─────────────────────────────────────────────────────────────

  @Get('activities')
  getActivities(@CurrentUser() user: JwtPayload) {
    return this.ecaService.getActivities(user.schoolId);
  }

  @Post('activities')
  @Roles(UserRole.ECA_OFFICER, UserRole.HEAD_TEACHER, UserRole.SUPER_ADMIN)
  createActivity(
    @CurrentUser() user: JwtPayload,
    @Body() body: Record<string, unknown>,
  ) {
    return this.ecaService.createActivity(user.schoolId, body);
  }

  // ── Competitions ───────────────────────────────────────────────────────────

  @Get('competitions')
  getCompetitions(@CurrentUser() user: JwtPayload) {
    return this.ecaService.getCompetitions(user.schoolId);
  }

  @Post('competitions')
  @Roles(UserRole.ECA_OFFICER, UserRole.HEAD_TEACHER, UserRole.SUPER_ADMIN)
  createCompetition(
    @CurrentUser() user: JwtPayload,
    @Body() body: Record<string, unknown>,
  ) {
    return this.ecaService.createCompetition(user.schoolId, body);
  }

  // ── Attendance ─────────────────────────────────────────────────────────────

  @Get('attendance')
  getAttendanceRates(@CurrentUser() user: JwtPayload) {
    return this.ecaService.getAttendanceRates(user.schoolId);
  }

  @Post('attendance')
  @Roles(UserRole.ECA_OFFICER, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  recordAttendance(
    @CurrentUser() user: JwtPayload,
    @Body() body: RecordAttendanceData,
  ) {
    return this.ecaService.recordAttendance(user.schoolId, body);
  }

  // ── Patrons ────────────────────────────────────────────────────────────────

  @Get('patrons')
  @Roles(UserRole.ECA_OFFICER, UserRole.HEAD_TEACHER, UserRole.SUPER_ADMIN)
  getPatrons(@CurrentUser() user: JwtPayload) {
    return this.ecaService.getPatrons(user.schoolId);
  }

  // ── Leadership ─────────────────────────────────────────────────────────────

  @Get('leadership')
  getLeadership(@CurrentUser() user: JwtPayload) {
    return this.ecaService.getLeadership(user.schoolId);
  }
}
