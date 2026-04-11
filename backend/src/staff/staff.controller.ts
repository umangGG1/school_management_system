import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StaffService } from './staff.service';
import { LeaveStatus } from './entities/staff-leave.entity';
import { StaffAttendanceStatus } from './entities/staff-attendance.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.staffService.findAll(user.schoolId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.staffService.create({ ...body, schoolId: user.schoolId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.staffService.findOne(id, user.schoolId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.staffService.update(id, user.schoolId, body);
  }

  // ── Attendance ─────────────────────────────────────────────────────────────

  @Get('attendance/today')
  todayAttendance(@CurrentUser() user: JwtPayload) {
    return this.staffService.todayAttendanceSummary(user.schoolId);
  }

  @Post('attendance/mark')
  markAttendance(
    @CurrentUser() user: JwtPayload,
    @Body() body: { date: string; entries: Array<{ staffId: string; status: StaffAttendanceStatus }> },
  ) {
    const today = new Date().toISOString().slice(0, 10);
    return this.staffService.markAttendance(body.entries, user.schoolId, body.date ?? today, user.sub);
  }

  @Get(':id/attendance')
  getAttendanceHistory(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.staffService.getAttendanceHistory(id, user.schoolId, from, to);
  }

  // ── Leave ──────────────────────────────────────────────────────────────────

  @Get('leave/requests')
  findLeaves(
    @CurrentUser() user: JwtPayload,
    @Query('staffId') staffId: string,
    @Query('status') status: LeaveStatus,
  ) {
    return this.staffService.findLeaves(user.schoolId, staffId, status);
  }

  @Post('leave/request')
  requestLeave(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.staffService.requestLeave({ ...body, schoolId: user.schoolId, staffId: body.staffId ?? user.sub });
  }

  @Patch('leave/:id/approve')
  approveLeave(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.staffService.approveLeave(id, user.schoolId, user.sub);
  }

  @Patch('leave/:id/reject')
  rejectLeave(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { reason: string },
  ) {
    return this.staffService.rejectLeave(id, user.schoolId, body.reason);
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  @Get('actions')
  findActions(@CurrentUser() user: JwtPayload, @Query('staffId') staffId: string) {
    return this.staffService.findActions(user.schoolId, staffId);
  }

  @Post('actions')
  recordAction(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.staffService.recordAction({ ...body, schoolId: user.schoolId, issuedById: user.sub });
  }

  @Get(':id/actions')
  findStaffActions(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.staffService.findActions(user.schoolId, id);
  }
}
