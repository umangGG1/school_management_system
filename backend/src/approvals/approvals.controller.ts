import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApprovalsService } from './approvals.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { IsOptional, IsString } from 'class-validator';

class ReviewDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('pending')
  getPending(@CurrentUser() user: JwtPayload) {
    return this.approvalsService.findPending(user.schoolId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewDto,
  ) {
    return this.approvalsService.approve(id, user.schoolId, user.sub, dto.notes);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewDto,
  ) {
    return this.approvalsService.reject(id, user.schoolId, user.sub, dto.notes);
  }
}
