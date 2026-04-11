import {
  Controller, Get, Delete, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard }   from '../common/guards/roles.guard';
import { Roles }        from '../common/decorators/roles.decorator';
import { CurrentUser }  from '../common/decorators/current-user.decorator';
import { ActivityService } from './activity.service';
import { UserRole }     from '../users/entities/user.entity';
import { ActivitySeverity, ActivityType } from './entities/activity-log.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { IsOptional, IsString } from 'class-validator';

class ActivityQueryDto {
  @IsOptional() @IsString() limit?: string;
  @IsOptional() @IsString() skip?: string;
  @IsOptional() @IsString() severity?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() search?: string;
}

@Controller('activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  /** GET /api/activity?limit=50&skip=0&severity=danger&search=login */
  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Query() query: ActivityQueryDto,
  ) {
    return this.activityService.findAll(user.schoolId, {
      limit:    query.limit    ? Number(query.limit)                   : 50,
      skip:     query.skip     ? Number(query.skip)                    : 0,
      severity: query.severity as ActivitySeverity | undefined,
      type:     query.type     as ActivityType     | undefined,
      search:   query.search,
    });
  }

  /** DELETE /api/activity/old — purge entries older than 90 days */
  @Delete('old')
  @HttpCode(HttpStatus.OK)
  async purgeOld(@CurrentUser() user: JwtPayload) {
    const deleted = await this.activityService.purgeOld(user.schoolId);
    return { deleted, message: `Purged ${deleted} old activity records` };
  }
}
