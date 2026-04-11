import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard }    from '../common/guards/jwt-auth.guard';
import { RolesGuard }      from '../common/guards/roles.guard';
import { Roles }           from '../common/decorators/roles.decorator';
import { CurrentUser }     from '../common/decorators/current-user.decorator';
import { ApprovalsService } from './approvals.service';
import { UserRole }        from '../users/entities/user.entity';
import { ApprovalStatus }  from './entities/approval.entity';
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

  /** GET /api/approvals/pending — items requiring action */
  @Get('pending')
  getPending(@CurrentUser() user: JwtPayload) {
    return this.approvalsService.findPending(user.schoolId);
  }

  /** GET /api/approvals — all approvals, optionally filtered by status */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  getAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: ApprovalStatus,
  ) {
    return this.approvalsService.findAll(user.schoolId, status);
  }

  /** POST /api/approvals/:id/approve */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewDto,
  ) {
    return this.approvalsService.approve(id, user.schoolId, user.sub, dto.notes);
  }

  /** POST /api/approvals/:id/reject */
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
