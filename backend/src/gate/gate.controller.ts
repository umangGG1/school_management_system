import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import { UserRole }      from '../users/entities/user.entity';
import { GateService }   from './gate.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('gate')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GateController {
  constructor(private readonly gateService: GateService) {}

  // ── Gate Passes ────────────────────────────────────────────────────────────

  @Post('passes/request')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.TEACHER, UserRole.HEAD_OF_BOARDING, UserRole.BOARDING_MASTER)
  requestPass(@CurrentUser() user: JwtPayload, @Body() body: { studentId: string; reason?: string }) {
    return this.gateService.requestPass(user.schoolId, { ...body, requestedBy: user.sub });
  }

  @Patch('passes/:id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.HEAD_OF_BOARDING)
  approvePass(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { validFrom: Date; validUntil: Date },
  ) {
    return this.gateService.approvePass(id, user.schoolId, { ...body, authorizedBy: user.sub });
  }

  @Get('passes/pending')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.HEAD_OF_BOARDING)
  getPendingPasses(@CurrentUser() user: JwtPayload) {
    return this.gateService.getPendingPasses(user.schoolId);
  }

  @Get('passes/active')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.HEAD_OF_SECURITY, UserRole.GATE_GUARD, UserRole.HEAD_OF_BOARDING)
  getActivePasses(@CurrentUser() user: JwtPayload) {
    return this.gateService.getActivePasses(user.schoolId);
  }

  @Get('logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.HEAD_OF_SECURITY, UserRole.HEAD_OF_BOARDING)
  getPassLogs(
    @CurrentUser() user: JwtPayload,
    @Query('date') date?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.gateService.getPassLogs(user.schoolId, { date, page, limit });
  }

  // ── Exit / Return logging ─────────────────────────────────────────────────

  @Post('exit/log')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_OF_SECURITY, UserRole.GATE_GUARD)
  logExit(@CurrentUser() user: JwtPayload, @Body() body: { passCode: string }) {
    return this.gateService.logExit(user.schoolId, body.passCode);
  }

  @Post('return/log')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_OF_SECURITY, UserRole.GATE_GUARD)
  logReturn(@CurrentUser() user: JwtPayload, @Body() body: { passCode: string }) {
    return this.gateService.logReturn(user.schoolId, body.passCode);
  }

  // ── Visitors ───────────────────────────────────────────────────────────────

  @Post('visitors')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_OF_SECURITY, UserRole.GATE_GUARD, UserRole.COMMUNICATIONS_OFFICER)
  registerVisitor(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.gateService.registerVisitor(user.schoolId, body, user.sub);
  }

  @Get('visitors')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.HEAD_OF_SECURITY, UserRole.GATE_GUARD, UserRole.COMMUNICATIONS_OFFICER)
  getVisitorLogs(
    @CurrentUser() user: JwtPayload,
    @Query('date') date?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.gateService.getVisitorLogs(user.schoolId, { date, page, limit });
  }

  @Get('visitors/current')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.HEAD_OF_SECURITY, UserRole.GATE_GUARD, UserRole.COMMUNICATIONS_OFFICER)
  getCurrentVisitors(@CurrentUser() user: JwtPayload) {
    return this.gateService.getCurrentVisitors(user.schoolId);
  }

  @Patch('visitors/:id/exit')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_OF_SECURITY, UserRole.GATE_GUARD, UserRole.COMMUNICATIONS_OFFICER)
  recordVisitorExit(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.gateService.recordVisitorExit(id, user.schoolId);
  }
}
