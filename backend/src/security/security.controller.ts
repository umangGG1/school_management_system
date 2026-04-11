import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('security')
export class SecurityController {
  constructor(private readonly service: SecurityService) {}

  @Get('overview')
  overview(@CurrentUser() user: JwtPayload) {
    return this.service.overview(user.schoolId);
  }

  @Get('gate-log')
  findGateLog(@CurrentUser() user: JwtPayload, @Query('date') date?: string) {
    return this.service.findGateLog(user.schoolId, date);
  }

  @Post('gate-log')
  @Roles(UserRole.GATE_GUARD, UserRole.HEAD_OF_SECURITY, UserRole.HEAD_TEACHER)
  createGateLog(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createGateLog(user.schoolId, user.sub, body);
  }

  @Patch('gate-log/:id/exit')
  @Roles(UserRole.GATE_GUARD, UserRole.HEAD_OF_SECURITY)
  markCheckout(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.markCheckout(id, user.schoolId);
  }

  @Get('incidents')
  findIncidents(@CurrentUser() user: JwtPayload, @Query('status') status?: string) {
    return this.service.findIncidents(user.schoolId, status);
  }

  @Post('incidents')
  @Roles(UserRole.GATE_GUARD, UserRole.HEAD_OF_SECURITY, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD)
  createIncident(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.service.createIncident(user.schoolId, user.sub, body);
  }

  @Patch('incidents/:id')
  @Roles(UserRole.HEAD_OF_SECURITY, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD)
  updateIncident(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
  ) {
    return this.service.updateIncident(id, user.schoolId, body);
  }
}
