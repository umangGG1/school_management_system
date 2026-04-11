import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { JwtPayload } from '../auth/auth.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      roles: user.roles,
      activeRole: payload.activeRole,
      schoolName: user.school?.name ?? '',
      schoolId: user.schoolId,
      avatarUrl: user.avatarUrl,
    };
  }
}
