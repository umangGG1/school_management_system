import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { BoardingService } from './boarding.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RollCallEntryStatus } from './entities/boarding.entities';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('boarding')
export class BoardingController {
  constructor(private readonly service: BoardingService) {}

  @Get('me')
  @Roles(UserRole.STUDENT)
  getMyBoardingStatus(@CurrentUser() user: JwtPayload) {
    return this.service.getStudentBoardingStatus(user.sub, user.schoolId);
  }

  @Get('summary')
  summary(@CurrentUser() user: JwtPayload) {
    return this.service.summary(user.schoolId);
  }

  @Get('dorms')
  findDorms(@CurrentUser() user: JwtPayload) {
    return this.service.findDorms(user.schoolId);
  }

  @Post('dorms')
  @Roles(UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.HEAD_OF_BOARDING)
  createDorm(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createDorm(user.schoolId, body);
  }

  @Get('leave')
  findLeaves(@CurrentUser() user: JwtPayload, @Query('status') status?: string) {
    return this.service.findLeaves(user.schoolId, status);
  }

  @Post('leave')
  createLeave(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createLeave(user.schoolId, body);
  }

  @Patch('leave/:id/approve')
  @Roles(UserRole.HEAD_OF_BOARDING, UserRole.BOARDING_MASTER, UserRole.DEPUTY_HEAD, UserRole.HEAD_TEACHER)
  approveLeave(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.approveLeave(id, user.schoolId, user.sub);
  }

  @Patch('leave/:id/return')
  @Roles(UserRole.HEAD_OF_BOARDING, UserRole.BOARDING_MASTER, UserRole.GATE_GUARD)
  markReturned(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.markReturned(id, user.schoolId);
  }

  @Get('missing')
  getMissing(@CurrentUser() user: JwtPayload) {
    return this.service.getMissingStudents(user.schoolId);
  }

  @Get('roll-call/today')
  todayRollCall(@CurrentUser() user: JwtPayload) {
    return this.service.getTodayRollCall(user.schoolId);
  }

  @Post('roll-call')
  @Roles(UserRole.BOARDING_MASTER, UserRole.HEAD_OF_BOARDING)
  submitRollCall(
    @CurrentUser() user: JwtPayload,
    @Body() body: { dormitoryId: string; period: any; notes?: string; entries: { studentId: string; status: RollCallEntryStatus; notes?: string }[] },
  ) {
    return this.service.submitRollCall(user.schoolId, user.sub, body);
  }

  @Get('allocations')
  findAllocations(@CurrentUser() user: JwtPayload) {
    return this.service.findAllocations(user.schoolId);
  }

  @Post('allocations')
  @Roles(UserRole.HEAD_OF_BOARDING, UserRole.BOARDING_MASTER, UserRole.DEPUTY_HEAD)
  createAllocation(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createAllocation(user.schoolId, body);
  }

  // ─── Incidents ─────────────────────────────────────────────────────────────

  @Get('incidents')
  findIncidents(@CurrentUser() user: JwtPayload, @Query('dormitoryId') dormitoryId: string) {
    return this.service.findIncidents(user.schoolId, dormitoryId);
  }

  @Post('incidents')
  createIncident(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createIncident({ ...body, schoolId: user.schoolId, reportedById: user.sub });
  }

  @Patch('incidents/:id')
  updateIncident(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.updateIncident(id, user.schoolId, body);
  }

  // ─── Night Reports ─────────────────────────────────────────────────────────

  @Get('night-reports')
  findNightReports(@CurrentUser() user: JwtPayload, @Query('dormitoryId') dormitoryId: string) {
    return this.service.findNightReports(user.schoolId, dormitoryId);
  }

  @Post('night-reports')
  @Roles(UserRole.BOARDING_MASTER, UserRole.HEAD_OF_BOARDING)
  submitNightReport(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.submitNightReport({ ...body, schoolId: user.schoolId, submittedById: user.sub });
  }

  // ─── Welfare Reports ───────────────────────────────────────────────────────

  @Get('welfare-reports')
  findWelfareReports(@CurrentUser() user: JwtPayload, @Query('studentId') studentId: string) {
    return this.service.findWelfareReports(user.schoolId, studentId);
  }

  @Post('welfare-reports')
  createWelfareReport(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createWelfareReport({ ...body, schoolId: user.schoolId, reportedById: user.sub });
  }

  @Patch('welfare-reports/:id')
  updateWelfareReport(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.updateWelfareReport(id, user.schoolId, body);
  }
}
