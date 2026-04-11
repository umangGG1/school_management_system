import {
  Controller, Get, Patch, Body, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard }   from '../common/guards/roles.guard';
import { Roles }        from '../common/decorators/roles.decorator';
import { CurrentUser }  from '../common/decorators/current-user.decorator';
import { SchoolsService, UpdateSchoolDto } from './schools.service';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('schools')
@UseGuards(JwtAuthGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  /** GET /api/schools/me — any authenticated user can see their school */
  @Get('me')
  async getMySchool(@CurrentUser() user: JwtPayload) {
    return this.schoolsService.findOne(user.schoolId);
  }

  /** PATCH /api/schools/me — SUPER_ADMIN or HEAD_TEACHER */
  @Patch('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async updateMySchool(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateSchoolDto,
  ) {
    return this.schoolsService.update(user.schoolId, dto);
  }

  /** GET /api/schools — SUPER_ADMIN: list all schools */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.schoolsService.findAll();
  }
}
