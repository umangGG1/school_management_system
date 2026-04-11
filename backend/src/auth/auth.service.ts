import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export type { JwtPayload };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) return null;
    const valid = await this.usersService.validatePassword(user, password);
    return valid ? user : null;
  }

  async login(user: User, activeRole: UserRole): Promise<{ accessToken: string; refreshToken: string; user: object }> {
    if (!user.roles.includes(activeRole)) {
      throw new UnauthorizedException(`User does not have role ${activeRole}`);
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      activeRole,
      schoolId: user.schoolId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    const fullUser = await this.usersService.findById(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: fullUser.id,
        name: `${fullUser.firstName} ${fullUser.lastName}`,
        email: fullUser.email,
        roles: fullUser.roles,
        activeRole,
        schoolName: fullUser.school?.name ?? '',
        schoolId: fullUser.schoolId,
        avatarUrl: fullUser.avatarUrl,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.usersService.findById(decoded.sub);
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        activeRole: user.roles[0],
        schoolId: user.schoolId,
      };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
