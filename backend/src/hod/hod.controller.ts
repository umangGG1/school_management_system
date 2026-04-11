import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { HodService } from './hod.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hod')
export class HodController {
  constructor(private readonly service: HodService) {}

  @Get('departments')
  findDepartments(@CurrentUser() user: JwtPayload) {
    return this.service.findDepartments(user.schoolId);
  }

  @Post('departments')
  @Roles(UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
  createDepartment(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createDepartment(user.schoolId, body);
  }

  @Get('departments/:id/teachers')
  findDeptTeachers(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.findDeptTeachers(id, user.schoolId);
  }

  @Get('syllabus')
  findSyllabus(@CurrentUser() user: JwtPayload, @Query('staffId') staffId?: string) {
    return this.service.findSyllabus(user.schoolId, staffId);
  }

  @Post('syllabus/update')
  @Roles(UserRole.HOD, UserRole.TEACHER, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD)
  updateSyllabus(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.updateSyllabus(user.schoolId, user.sub, body);
  }

  @Get('observations')
  findObservations(@CurrentUser() user: JwtPayload) {
    return this.service.findObservations(user.schoolId);
  }

  @Post('observations')
  @Roles(UserRole.HOD, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD)
  createObservation(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createObservation(user.schoolId, user.sub, body);
  }

  @Get('observations/:id')
  findObservation(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.findObservation(id, user.schoolId);
  }

  @Get('schemes')
  findSchemes(@CurrentUser() user: JwtPayload) {
    return this.service.findSchemes(user.schoolId);
  }

  @Patch('schemes/:id/approve')
  @Roles(UserRole.HOD, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD)
  approveScheme(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.approveScheme(id, user.schoolId, user.sub);
  }

  @Get('performance')
  getPerformance(@CurrentUser() user: JwtPayload) {
    return this.service.getDeptPerformance(user.schoolId);
  }
}
