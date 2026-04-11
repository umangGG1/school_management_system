import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MessagingService } from './messaging.service';
import { MessageCategory } from './entities/message.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  send(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      recipientId: string;
      subject: string;
      body: string;
      category?: MessageCategory;
      parentMessageId?: string;
    },
  ) {
    return this.messagingService.sendMessage({
      schoolId: user.schoolId,
      senderId: user.sub,
      recipientId: body.recipientId,
      subject: body.subject,
      body: body.body,
      category: body.category,
      parentMessageId: body.parentMessageId,
    });
  }

  @Get('inbox')
  inbox(@CurrentUser() user: JwtPayload) {
    return this.messagingService.getInbox(user.sub, user.schoolId);
  }

  @Get('sent')
  sent(@CurrentUser() user: JwtPayload) {
    return this.messagingService.getSent(user.sub, user.schoolId);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: JwtPayload) {
    return this.messagingService.getUnreadCount(user.sub, user.schoolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.messagingService.getMessage(id, user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.messagingService.markRead(id, user.sub);
  }

  @Patch('mark-all-read')
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.messagingService.markAllRead(user.sub, user.schoolId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.messagingService.deleteMessage(id, user.sub);
  }
}
