/**
 * Integration tests — Auth module HTTP layer
 *
 * Tests the full pipeline: ValidationPipe → AuthController → AuthService.
 * AuthService is mocked so no DB or JWT refresh-secret is needed.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as typeof import('supertest');

import { AuthController }  from '../src/auth/auth.controller';
import { AuthService }     from '../src/auth/auth.service';
import { UsersService }    from '../src/users/users.service';
import { JwtStrategy }     from '../src/auth/strategies/jwt.strategy';
import { UserRole }        from '../src/users/entities/user.entity';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { signToken, SCHOOL_ID, USER_ID } from './helpers/jwt.helper';

const JWT_SECRET = 'fallback_secret_change_me';

describe('Auth — HTTP integration', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<Pick<UsersService, 'findByEmail' | 'validatePassword' | 'findById'>>;

  const mockUser: any = {
    id: USER_ID,
    email: 'head@smissi.ac.ug',
    firstName: 'John',
    lastName: 'Doe',
    roles: [UserRole.HEAD_TEACHER],
    schoolId: SCHOOL_ID,
    isActive: true,
    avatarUrl: null,
    school: { name: 'SMISSI Secondary' },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PassportModule,
        JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [AuthController],
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser:       jest.fn(),
            login:              jest.fn(),
            refreshAccessToken: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail:      jest.fn(),
            validatePassword: jest.fn(),
            findById:         jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    authService  = module.get(AuthService);
    usersService = module.get(UsersService) as any;
  });

  afterAll(() => app.close());

  beforeEach(() => jest.clearAllMocks());

  // ── POST /auth/login ────────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('returns 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'pass123' })
        .expect(400);
    });

    it('returns 400 when password is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'head@smissi.ac.ug' })
        .expect(400);
    });

    it('returns 401 for bad credentials', async () => {
      authService.validateUser.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'head@smissi.ac.ug', password: 'wrongpass', role: UserRole.HEAD_TEACHER })
        .expect(401);
    });

    it('returns 200 with accessToken and refreshToken on success', async () => {
      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue({
        accessToken: 'access.token.here',
        refreshToken: 'refresh.token.here',
        user: { id: USER_ID, name: 'John Doe', email: 'head@smissi.ac.ug' },
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'head@smissi.ac.ug', password: 'correct', role: UserRole.HEAD_TEACHER })
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.id).toBe(USER_ID);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.timestamp).toBeDefined();
    });

    it('wraps response in TransformInterceptor envelope', async () => {
      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue({ accessToken: 'tok', refreshToken: 'rtok', user: {} });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'head@smissi.ac.ug', password: 'correct', role: UserRole.HEAD_TEACHER })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('statusCode');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // ── POST /auth/refresh ──────────────────────────────────────────────────────

  describe('POST /auth/refresh', () => {
    it('returns 400 when refreshToken is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });

    it('returns 401 for invalid refresh token', async () => {
      // UnauthorizedException (HttpException) → NestJS maps it to 401.
      authService.refreshAccessToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'bad.token' })
        .expect(401);
    });

    it('returns 200 with new accessToken', async () => {
      authService.refreshAccessToken.mockResolvedValue({ accessToken: 'new.access.token' });

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'valid.refresh.token' })
        .expect(200);

      expect(res.body.data.accessToken).toBe('new.access.token');
    });
  });

  // ── POST /auth/logout ───────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    it('returns 204 (stateless — no body)', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(204);
    });

    it('does not require authentication', async () => {
      // No Authorization header — should still 204
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(204);
    });
  });
});
