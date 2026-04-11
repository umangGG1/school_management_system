import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { MedicalService } from './medical.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical')
export class MedicalController {
  constructor(private readonly service: MedicalService) {}

  @Get('sick-bay')
  currentPatients(@CurrentUser() user: JwtPayload) {
    return this.service.currentPatients(user.schoolId);
  }

  @Get('sick-bay/stats')
  stats(@CurrentUser() user: JwtPayload) {
    return this.service.stats(user.schoolId);
  }

  @Post('sick-bay')
  @Roles(UserRole.NURSE, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD)
  createVisit(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createVisit(user.schoolId, user.sub, body);
  }

  @Patch('sick-bay/:id')
  @Roles(UserRole.NURSE, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD)
  updateVisit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
  ) {
    return this.service.updateVisit(id, user.schoolId, body);
  }

  @Get('reports/monthly')
  monthlyReport(
    @CurrentUser() user: JwtPayload,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.service.monthlyReport(user.schoolId, Number(year), Number(month));
  }

  @Get('history/:studentId')
  @Roles(UserRole.NURSE, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.SCHOOL_COUNSELOR)
  getHistory(@Param('studentId', ParseUUIDPipe) studentId: string, @CurrentUser() user: JwtPayload) {
    return this.service.getMedicalHistory(studentId, user.schoolId);
  }

  @Patch('history/:studentId')
  @Roles(UserRole.NURSE)
  updateHistory(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
  ) {
    return this.service.updateMedicalHistory(studentId, user.schoolId, body);
  }

  // ── Medication Log ─────────────────────────────────────────────────────────

  @Get('medications')
  findMedications(
    @CurrentUser() user: JwtPayload,
    @Query('studentId') studentId: string,
    @Query('visitId') visitId: string,
  ) {
    return this.service.findMedications(user.schoolId, studentId, visitId);
  }

  @Post('medications')
  @Roles(UserRole.NURSE)
  logMedication(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.logMedication({ ...body, schoolId: user.schoolId, administeredById: user.sub });
  }

  // ── Hospital Referrals ─────────────────────────────────────────────────────

  @Get('referrals')
  findReferrals(@CurrentUser() user: JwtPayload, @Query('studentId') studentId: string) {
    return this.service.findReferrals(user.schoolId, studentId);
  }

  @Post('referrals')
  @Roles(UserRole.NURSE, UserRole.HEAD_TEACHER)
  createReferral(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createReferral({ ...body, schoolId: user.schoolId, referredById: user.sub });
  }

  @Patch('referrals/:id')
  @Roles(UserRole.NURSE, UserRole.HEAD_TEACHER)
  updateReferral(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.updateReferral(id, user.schoolId, body);
  }
}
