/**
 * Integration tests — Parents module HTTP layer
 *
 * Verifies role-based access:
 *   - PARENT can access all /parents/me/* endpoints
 *   - HEAD_TEACHER / SUPER_ADMIN can also access child data (admin oversight)
 *   - TEACHER, STUDENT cannot access parent endpoints
 *   - Only PARENT can send messages (not HEAD_TEACHER)
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as typeof import('supertest');

import { ParentsController } from '../src/parents/parents.controller';
import { ParentsService }    from '../src/parents/parents.service';
import { JwtStrategy }       from '../src/auth/strategies/jwt.strategy';
import { JwtAuthGuard }      from '../src/common/guards/jwt-auth.guard';
import { RolesGuard }        from '../src/common/guards/roles.guard';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { UserRole }          from '../src/users/entities/user.entity';
import { signToken, SCHOOL_ID, USER_ID } from './helpers/jwt.helper';

describe('Parents — HTTP integration', () => {
  let app: INestApplication;
  let svc: Record<string, jest.Mock>;

  // ── Tokens ─────────────────────────────────────────────────────────────────

  const parentToken     = signToken({ roles: [UserRole.PARENT],       activeRole: UserRole.PARENT });
  const htToken         = signToken({ roles: [UserRole.HEAD_TEACHER],  activeRole: UserRole.HEAD_TEACHER });
  const superAdminToken = signToken({ roles: [UserRole.SUPER_ADMIN],   activeRole: UserRole.SUPER_ADMIN });
  const teacherToken    = signToken({ roles: [UserRole.TEACHER],       activeRole: UserRole.TEACHER });
  const studentToken    = signToken({ roles: [UserRole.STUDENT],       activeRole: UserRole.STUDENT });
  const ecaToken        = signToken({ roles: [UserRole.ECA_OFFICER],   activeRole: UserRole.ECA_OFFICER });

  // ── Mock return data ───────────────────────────────────────────────────────

  const mockChild = {
    id: 'stu-001', name: 'Alice Nakato', schoolId: SCHOOL_ID, parentEmail: 'parent@home.ug',
  };
  const mockMarks = [{ subject: 'Math', score: 88 }, { subject: 'English', score: 76 }];
  const mockAttendance = { present: 40, absent: 3, rate: 93.0 };
  const mockBalance = { totalOwed: 500000, totalPaid: 400000, outstanding: 100000 };

  beforeAll(async () => {
    svc = {
      getChild:          jest.fn().mockResolvedValue(mockChild),
      getChildMarks:     jest.fn().mockResolvedValue(mockMarks),
      getChildAttendance:jest.fn().mockResolvedValue(mockAttendance),
      getChildBalance:   jest.fn().mockResolvedValue(mockBalance),
      sendMessage:       jest.fn().mockResolvedValue({ id: 'msg-1', subject: 'Hello' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PassportModule,
        JwtModule.register({ secret: 'fallback_secret_change_me', signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [ParentsController],
      providers: [
        JwtStrategy,
        { provide: ParentsService, useValue: svc },
      ],
    }).compile();

    app = module.createNestApplication();
    const reflector = module.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(), new RolesGuard(reflector));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  // ── GET /parents/me/child ──────────────────────────────────────────────────

  describe('GET /parents/me/child', () => {
    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/parents/me/child').expect(401);
    });

    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .get('/parents/me/child')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('returns 403 for STUDENT', async () => {
      await request(app.getHttpServer())
        .get('/parents/me/child')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('returns 403 for ECA_OFFICER', async () => {
      await request(app.getHttpServer())
        .get('/parents/me/child')
        .set('Authorization', `Bearer ${ecaToken}`)
        .expect(403);
    });

    it('returns 200 with child data for PARENT', async () => {
      const res = await request(app.getHttpServer())
        .get('/parents/me/child')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.data.id).toBe('stu-001');
      expect(res.body.data.name).toBe('Alice Nakato');
      expect(svc.getChild).toHaveBeenCalledWith(USER_ID, SCHOOL_ID);
    });

    it('returns 200 for HEAD_TEACHER (admin oversight)', async () => {
      await request(app.getHttpServer())
        .get('/parents/me/child')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);
    });

    it('returns 200 for SUPER_ADMIN', async () => {
      await request(app.getHttpServer())
        .get('/parents/me/child')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it('propagates NotFoundException from service as 404', async () => {
      svc.getChild.mockRejectedValueOnce(new NotFoundException('No child found'));

      await request(app.getHttpServer())
        .get('/parents/me/child')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(404);
    });
  });

  // ── GET /parents/me/child/marks ────────────────────────────────────────────

  describe('GET /parents/me/child/marks', () => {
    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .get('/parents/me/child/marks')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('returns 200 with marks array for PARENT', async () => {
      const res = await request(app.getHttpServer())
        .get('/parents/me/child/marks')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].subject).toBe('Math');
      expect(svc.getChildMarks).toHaveBeenCalledWith(USER_ID, SCHOOL_ID);
    });

    it('returns 200 for HEAD_TEACHER', async () => {
      const res = await request(app.getHttpServer())
        .get('/parents/me/child/marks')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ── GET /parents/me/child/attendance ──────────────────────────────────────

  describe('GET /parents/me/child/attendance', () => {
    it('returns 403 for STUDENT', async () => {
      await request(app.getHttpServer())
        .get('/parents/me/child/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('returns 200 with attendance summary for PARENT', async () => {
      const res = await request(app.getHttpServer())
        .get('/parents/me/child/attendance')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.data.rate).toBe(93.0);
      expect(res.body.data.present).toBe(40);
      expect(svc.getChildAttendance).toHaveBeenCalledWith(USER_ID, SCHOOL_ID);
    });
  });

  // ── GET /parents/me/child/balance ──────────────────────────────────────────

  describe('GET /parents/me/child/balance', () => {
    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .get('/parents/me/child/balance')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('returns 200 with balance for PARENT', async () => {
      const res = await request(app.getHttpServer())
        .get('/parents/me/child/balance')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.data.outstanding).toBe(100000);
      expect(svc.getChildBalance).toHaveBeenCalledWith(USER_ID, SCHOOL_ID);
    });

    it('returns 200 for SUPER_ADMIN', async () => {
      await request(app.getHttpServer())
        .get('/parents/me/child/balance')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });
  });

  // ── POST /parents/me/messages ──────────────────────────────────────────────

  describe('POST /parents/me/messages', () => {
    const messageBody = {
      recipientId: 'teacher-001',
      subject:     'Absence notice',
      message:     'My child will be absent tomorrow.',
    };

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).post('/parents/me/messages').send(messageBody).expect(401);
    });

    it('returns 403 for TEACHER (cannot send as parent)', async () => {
      await request(app.getHttpServer())
        .post('/parents/me/messages')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(messageBody)
        .expect(403);
    });

    it('returns 403 for HEAD_TEACHER (only PARENT role allowed)', async () => {
      await request(app.getHttpServer())
        .post('/parents/me/messages')
        .set('Authorization', `Bearer ${htToken}`)
        .send(messageBody)
        .expect(403);
    });

    it('returns 403 for STUDENT', async () => {
      await request(app.getHttpServer())
        .post('/parents/me/messages')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(messageBody)
        .expect(403);
    });

    it('returns 201 for PARENT with message data', async () => {
      const res = await request(app.getHttpServer())
        .post('/parents/me/messages')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(messageBody)
        .expect(201);

      expect(res.body.data.id).toBe('msg-1');
      expect(svc.sendMessage).toHaveBeenCalledWith(
        USER_ID,
        SCHOOL_ID,
        expect.objectContaining({
          recipientId: 'teacher-001',
          subject:     'Absence notice',
          message:     'My child will be absent tomorrow.',
        }),
      );
    });
  });
});
