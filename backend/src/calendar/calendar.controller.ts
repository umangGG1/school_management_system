import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly service: CalendarService) {}

  @Post()
  @Roles(UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCalendarEventDto) {
    return this.service.create(user.schoolId, user.sub, dto);
  }

  @Get()
  findByMonth(
    @CurrentUser() user: JwtPayload,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    const y = Number(year) || new Date().getFullYear();
    const m = Number(month) || new Date().getMonth() + 1;
    return this.service.findByMonth(user.schoolId, y, m);
  }

  @Get('upcoming')
  findUpcoming(@CurrentUser() user: JwtPayload, @Query('days') days?: number) {
    return this.service.findUpcoming(user.schoolId, Number(days) || 14);
  }

  @Get('term')
  findTerm(
    @CurrentUser() user: JwtPayload,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.service.findTerm(user.schoolId, start, end);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.findOne(id, user.schoolId);
  }

  @Patch(':id')
  @Roles(UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.service.update(id, user.schoolId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.HEAD_TEACHER, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.remove(id, user.schoolId);
  }
}
