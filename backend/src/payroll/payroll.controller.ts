import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import { UserRole }      from '../users/entities/user.entity';
import { PayrollService } from './payroll.service';
import { ComponentType } from './entities/salary-component.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.FINANCE_OFFICER, UserRole.PAYROLL_OFFICER)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // ── Payroll Runs ───────────────────────────────────────────────────────────

  @Get('runs')
  listRuns(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.payrollService.listRuns(user.schoolId, page, limit);
  }

  @Post('runs')
  @HttpCode(HttpStatus.ACCEPTED)
  createRun(
    @CurrentUser() user: JwtPayload,
    @Body() body: { month: string; staffMemberIds?: string[] },
  ) {
    return this.payrollService.createRun(user.schoolId, body.month, user.sub, body.staffMemberIds);
  }

  @Get('runs/:id')
  getRun(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.payrollService.getRun(id, user.schoolId);
  }

  @Post('runs/:id/approve')
  approveRun(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.payrollService.approveRun(id, user.schoolId, user.sub);
  }

  // ── Payslips ───────────────────────────────────────────────────────────────

  @Get('payslips/:staffId')
  getPayslips(@CurrentUser() user: JwtPayload, @Param('staffId') staffId: string) {
    return this.payrollService.getPayslipsByStaff(staffId, user.schoolId);
  }

  // ── Salary Components ──────────────────────────────────────────────────────

  @Get('components/:staffId')
  getComponents(@CurrentUser() user: JwtPayload, @Param('staffId') staffId: string) {
    return this.payrollService.getComponents(staffId, user.schoolId);
  }

  @Post('components')
  upsertComponent(
    @CurrentUser() user: JwtPayload,
    @Body() body: { staffMemberId: string; componentType: ComponentType; amount: number },
  ) {
    return this.payrollService.upsertComponent(
      user.schoolId,
      body.staffMemberId,
      body.componentType,
      body.amount,
    );
  }

  // ── PAYE Brackets ──────────────────────────────────────────────────────────

  @Get('paye-brackets')
  getBrackets() {
    return this.payrollService.getBrackets();
  }
}
