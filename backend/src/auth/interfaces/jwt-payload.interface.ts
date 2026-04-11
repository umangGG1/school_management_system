import type { UserRole } from '../../users/entities/user.entity';

/** Shape of the JWT token payload after verification */
export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
  schoolId: string;
  iat?: number;
  exp?: number;
}
