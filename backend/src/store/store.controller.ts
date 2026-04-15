import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import { UserRole }      from '../users/entities/user.entity';
import { StoreService }  from './store.service';
import { StoreCategory } from './entities/store-item.entity';
import { MovementType }  from './entities/stock-movement.entity';
import { RequisitionStatus } from './entities/requisition.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('store')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // ── Items ──────────────────────────────────────────────────────────────────

  @Get('items')
  findItems(
    @CurrentUser() user: JwtPayload,
    @Query('category') category?: StoreCategory,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storeService.findItems(user.schoolId, { category, page, limit });
  }

  @Get('items/low-stock')
  findLowStock(@CurrentUser() user: JwtPayload) {
    return this.storeService.findLowStock(user.schoolId);
  }

  @Post('items')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.FINANCE_OFFICER)
  createItem(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.storeService.createItem(user.schoolId, body);
  }

  @Patch('items/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.FINANCE_OFFICER)
  updateItem(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: any) {
    return this.storeService.updateItem(id, user.schoolId, body);
  }

  // ── Movements ──────────────────────────────────────────────────────────────

  @Get('movements')
  findMovements(
    @CurrentUser() user: JwtPayload,
    @Query('storeItemId') storeItemId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storeService.findMovements(user.schoolId, { storeItemId, page, limit });
  }

  @Post('movements')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.FINANCE_OFFICER)
  manualAdjustment(
    @CurrentUser() user: JwtPayload,
    @Body() body: { storeItemId: string; type: MovementType; quantity: number; reason: string },
  ) {
    return this.storeService.manualAdjustment(
      user.schoolId, body.storeItemId, body.type, body.quantity, body.reason, user.sub,
    );
  }

  // ── Requisitions ───────────────────────────────────────────────────────────

  @Get('requisitions')
  findRequisitions(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: RequisitionStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storeService.findRequisitions(user.schoolId, { status, page, limit });
  }

  @Post('requisitions')
  createRequisition(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.storeService.createRequisition(user.schoolId, { ...body, requestedBy: user.sub });
  }

  @Patch('requisitions/:id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.FINANCE_OFFICER)
  approveRequisition(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.storeService.approveRequisition(id, user.schoolId, user.sub);
  }

  @Patch('requisitions/:id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.FINANCE_OFFICER)
  rejectRequisition(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.storeService.rejectRequisition(id, user.schoolId, user.sub);
  }
}
