import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../src/users/entities/user.entity';
import type { JwtPayload } from '../../src/auth/interfaces/jwt-payload.interface';

const JWT_SECRET = 'fallback_secret_change_me';

const jwtSvc = new JwtService({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } });

/**
 * Mint a short-lived test token with the fallback dev secret.
 * The JwtStrategy uses the same secret, so guards accept these tokens.
 */
export function signToken(overrides: Partial<JwtPayload> = {}): string {
  const payload: JwtPayload = {
    sub:        overrides.sub        ?? 'user-001',
    email:      overrides.email      ?? 'test@smissi.ac.ug',
    roles:      overrides.roles      ?? [UserRole.HEAD_TEACHER],
    activeRole: overrides.activeRole ?? UserRole.HEAD_TEACHER,
    schoolId:   overrides.schoolId   ?? 'school-001',
    ...overrides,
  };
  return jwtSvc.sign(payload);
}

export const SCHOOL_ID = 'school-001';
export const USER_ID   = 'user-001';
