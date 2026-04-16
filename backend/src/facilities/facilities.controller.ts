import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import { UserRole }      from '../users/entities/user.entity';
import { FacilitiesService } from './facilities.service';
import { AssetCategory } from './entities/asset.entity';
import { BookingStatus } from './entities/facility-booking.entity';
import { MaintenanceStatus } from './entities/maintenance-request.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('facilities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.HOD, UserRole.FINANCE_OFFICER, UserRole.FACILITIES_MANAGER)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // ── Assets ─────────────────────────────────────────────────────────────────

  @Get('assets')
  findAssets(
    @CurrentUser() user: JwtPayload,
    @Query('category') category?: AssetCategory,
    @Query('location') location?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.facilitiesService.findAssets(user.schoolId, { category, location, page, limit });
  }

  @Post('assets')
  createAsset(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.facilitiesService.createAsset(user.schoolId, body);
  }

  @Patch('assets/:id')
  updateAsset(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: any) {
    return this.facilitiesService.updateAsset(id, user.schoolId, body);
  }

  // ── Bookings ───────────────────────────────────────────────────────────────

  @Get('bookings')
  findBookings(
    @CurrentUser() user: JwtPayload,
    @Query('date') date?: string,
    @Query('status') status?: BookingStatus,
  ) {
    return this.facilitiesService.findBookings(user.schoolId, { date, status });
  }

  @Post('bookings')
  createBooking(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.facilitiesService.createBooking(user.schoolId, { ...body, bookedBy: user.sub });
  }

  @Patch('bookings/:id')
  updateBooking(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: any) {
    return this.facilitiesService.updateBooking(id, user.schoolId, { ...body, approvedBy: user.sub });
  }

  // ── Maintenance ────────────────────────────────────────────────────────────

  @Get('maintenance')
  findMaintenance(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: MaintenanceStatus,
  ) {
    return this.facilitiesService.findMaintenance(user.schoolId, status);
  }

  @Post('maintenance')
  createMaintenance(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.facilitiesService.createMaintenance(user.schoolId, { ...body, reportedBy: user.sub });
  }

  @Patch('maintenance/:id')
  updateMaintenance(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: any) {
    return this.facilitiesService.updateMaintenance(id, user.schoolId, { ...body, resolvedBy: user.sub });
  }
}
