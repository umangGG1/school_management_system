import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Post()
  @Roles(
    UserRole.HEAD_TEACHER,
    UserRole.DEPUTY_HEAD,
    UserRole.COMMUNICATIONS_OFFICER,
    UserRole.SUPER_ADMIN,
  )
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAnnouncementDto) {
    return this.service.create(user.schoolId, user.sub, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('category') category?: string,
    @Query('audience') audience?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(user.schoolId, { category, audience, page, limit });
  }

  @Get('pinned')
  findPinned(@CurrentUser() user: JwtPayload) {
    return this.service.findPinned(user.schoolId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.findOne(id, user.schoolId);
  }

  @Patch(':id')
  @Roles(
    UserRole.HEAD_TEACHER,
    UserRole.DEPUTY_HEAD,
    UserRole.COMMUNICATIONS_OFFICER,
    UserRole.SUPER_ADMIN,
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAnnouncementDto,
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
