import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ParentsService } from './parents.service';
import { MessageCategory } from '../messaging/entities/message.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('me/child')
  @Roles(UserRole.PARENT, UserRole.HEAD_TEACHER, UserRole.SUPER_ADMIN)
  getChild(@CurrentUser() user: JwtPayload) {
    return this.parentsService.getChild(user.sub, user.schoolId);
  }

  @Get('me/child/marks')
  @Roles(UserRole.PARENT, UserRole.HEAD_TEACHER, UserRole.SUPER_ADMIN)
  getChildMarks(@CurrentUser() user: JwtPayload) {
    return this.parentsService.getChildMarks(user.sub, user.schoolId);
  }

  @Get('me/child/attendance')
  @Roles(UserRole.PARENT, UserRole.HEAD_TEACHER, UserRole.SUPER_ADMIN)
  getChildAttendance(@CurrentUser() user: JwtPayload) {
    return this.parentsService.getChildAttendance(user.sub, user.schoolId);
  }

  @Get('me/child/balance')
  @Roles(UserRole.PARENT, UserRole.HEAD_TEACHER, UserRole.SUPER_ADMIN)
  getChildBalance(@CurrentUser() user: JwtPayload) {
    return this.parentsService.getChildBalance(user.sub, user.schoolId);
  }

  @Post('me/messages')
  @Roles(UserRole.PARENT)
  sendMessage(
    @CurrentUser() user: JwtPayload,
    @Body() body: { recipientId: string; subject: string; message: string; category?: MessageCategory },
  ) {
    return this.parentsService.sendMessage(user.sub, user.schoolId, body);
  }
}
