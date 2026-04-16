import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import { UserRole }      from '../users/entities/user.entity';
import { UniformService } from './uniform.service';
import { UniformSize } from './entities/uniform-stock.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('uniform')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.FINANCE_OFFICER, UserRole.UNIFORM_OFFICER, UserRole.HEAD_OF_BOARDING)
export class UniformController {
  constructor(private readonly uniformService: UniformService) {}

  @Get('stock')
  findStock(@CurrentUser() user: JwtPayload) {
    return this.uniformService.findStock(user.schoolId);
  }

  @Get('stock/low')
  findLowStock(@CurrentUser() user: JwtPayload) {
    return this.uniformService.findLowStock(user.schoolId);
  }

  @Post('stock/adjust')
  adjustStock(
    @CurrentUser() user: JwtPayload,
    @Body() body: { uniformStockId: string; delta: number; reason: string },
  ) {
    return this.uniformService.adjustStock(user.schoolId, body.uniformStockId, body.delta, body.reason);
  }

  @Get('allocations')
  findAllocations(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.uniformService.findAllocations(user.schoolId, { page, limit });
  }

  @Get('allocations/:studentId')
  findStudentAllocations(@CurrentUser() user: JwtPayload, @Param('studentId') studentId: string) {
    return this.uniformService.findStudentAllocations(studentId, user.schoolId);
  }

  @Post('allocations')
  issueUniform(
    @CurrentUser() user: JwtPayload,
    @Body() body: {
      studentId: string;
      uniformItemId: string;
      uniformStockId: string;
      size: UniformSize;
      quantity: number;
    },
  ) {
    return this.uniformService.issueUniform(user.schoolId, { ...body, issuedBy: user.sub });
  }

  @Patch('allocations/:id/return')
  returnUniform(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { condition: string },
  ) {
    return this.uniformService.returnUniform(id, user.schoolId, body.condition);
  }
}
