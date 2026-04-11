import {
  Controller, Get, Post, Patch, Param, Body,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard }   from '../common/guards/jwt-auth.guard';
import { RolesGuard }     from '../common/guards/roles.guard';
import { Roles }          from '../common/decorators/roles.decorator';
import { CurrentUser }    from '../common/decorators/current-user.decorator';
import { UsersService }   from './users.service';
import { JwtPayload }     from '../auth/auth.service';
import { UserRole }       from './entities/user.entity';
import {
  CreateUserDto, UpdateUserDto, ListUsersQueryDto,
} from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* ── GET /api/users/me — any authenticated user ──────────────────── */
  @Get('me')
  async getMe(@CurrentUser() payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    return this.usersService.toPublic(user);
  }

  /* ── GET /api/users — SUPER_ADMIN only ──────────────────────────── */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async listUsers(@Query() query: ListUsersQueryDto) {
    const users = await this.usersService.findAll(query);
    return users.map(u => this.usersService.toPublic(u));
  }

  /* ── POST /api/users — SUPER_ADMIN only ─────────────────────────── */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.usersService.toPublic(user);
  }

  /* ── PATCH /api/users/:id — SUPER_ADMIN only ────────────────────── */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);
    return this.usersService.toPublic(user);
  }

  /* ── PATCH /api/users/:id/toggle-status — SUPER_ADMIN only ─────── */
  @Patch(':id/toggle-status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async toggleStatus(@Param('id') id: string) {
    const user = await this.usersService.toggleStatus(id);
    return this.usersService.toPublic(user);
  }

  /* ── GET /api/users/:id — SUPER_ADMIN only ──────────────────────── */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return this.usersService.toPublic(user);
  }
}
