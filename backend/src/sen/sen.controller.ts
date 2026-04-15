import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import { UserRole }      from '../users/entities/user.entity';
import { SenService }    from './sen.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

// Only teaching / pastoral staff may access SEN data
const SEN_ROLES = [UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.TEACHER, UserRole.HOD, UserRole.SEN_TEACHER];

@Controller('sen')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...SEN_ROLES)
export class SenController {
  constructor(private readonly senService: SenService) {}

  // ── Records ────────────────────────────────────────────────────────────────

  @Get('students')
  findStudentsWithSen(@CurrentUser() user: JwtPayload) {
    return this.senService.findStudentsWithSen(user.schoolId);
  }

  @Get('records/:studentId')
  findStudentRecords(@CurrentUser() user: JwtPayload, @Param('studentId') studentId: string) {
    return this.senService.findStudentRecords(studentId, user.schoolId);
  }

  @Post('records')
  createRecord(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.senService.createRecord(user.schoolId, { ...body, identifiedBy: user.sub });
  }

  @Patch('records/:id')
  updateRecord(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: any) {
    return this.senService.updateRecord(id, user.schoolId, body);
  }

  // ── Observations ───────────────────────────────────────────────────────────

  @Get('observations/:studentId')
  findObservations(@CurrentUser() user: JwtPayload, @Param('studentId') studentId: string) {
    return this.senService.findObservations(studentId, user.schoolId);
  }

  @Post('observations')
  createObservation(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.senService.createObservation(user.schoolId, { ...body, observedBy: user.sub });
  }

  // ── Accommodation Plans ────────────────────────────────────────────────────

  @Get('accommodation-plans/:studentId')
  findPlans(@CurrentUser() user: JwtPayload, @Param('studentId') studentId: string) {
    return this.senService.findPlans(studentId, user.schoolId);
  }

  @Post('accommodation-plans')
  createPlan(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.senService.createPlan(user.schoolId, { ...body, createdBy: user.sub });
  }
}
