/**
 * Integration tests — Gate module HTTP layer
 *
 * Tests role-based access: GATE_GUARD can log exit/return but cannot approve passes;
 * HEAD_OF_BOARDING can approve but HEAD_OF_SECURITY cannot request passes, etc.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as typeof import('supertest');

import { GateController } from '../src/gate/gate.controller';
import { GateService }    from '../src/gate/gate.service';
import { JwtStrategy }    from '../src/auth/strategies/jwt.strategy';
import { JwtAuthGuard }   from '../src/common/guards/jwt-auth.guard';
import { RolesGuard }     from '../src/common/guards/roles.guard';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { UserRole }       from '../src/users/entities/user.entity';
import { GatePassStatus } from '../src/gate/entities/gate-pass.entity';
import { signToken, SCHOOL_ID, USER_ID } from './helpers/jwt.helper';

const JWT_SECRET = 'fallback_secret_change_me';

describe('Gate — HTTP integration', () => {
  let app: INestApplication;
  let svc: Record<string, jest.Mock>;

  // Tokens for different roles
  const htToken         = signToken({ roles: [UserRole.HEAD_TEACHER],    activeRole: UserRole.HEAD_TEACHER });
  const boardingToken   = signToken({ roles: [UserRole.HEAD_OF_BOARDING], activeRole: UserRole.HEAD_OF_BOARDING });
  const gateGuardToken  = signToken({ roles: [UserRole.GATE_GUARD],      activeRole: UserRole.GATE_GUARD });
  const teacherToken    = signToken({ roles: [UserRole.TEACHER],          activeRole: UserRole.TEACHER });
  const securityToken   = signToken({ roles: [UserRole.HEAD_OF_SECURITY], activeRole: UserRole.HEAD_OF_SECURITY });
  const commsToken      = signToken({ roles: [UserRole.COMMUNICATIONS_OFFICER], activeRole: UserRole.COMMUNICATIONS_OFFICER });

  beforeAll(async () => {
    svc = {
      requestPass:        jest.fn().mockResolvedValue({ id: 'pass-1', passCode: '123456', status: GatePassStatus.PENDING }),
      approvePass:        jest.fn().mockResolvedValue({ id: 'pass-1', status: GatePassStatus.APPROVED, passCode: '123456' }),
      getPendingPasses:   jest.fn().mockResolvedValue([]),
      getActivePasses:    jest.fn().mockResolvedValue([]),
      getPassLogs:        jest.fn().mockResolvedValue({ data: [], total: 0 }),
      logExit:            jest.fn().mockResolvedValue({ id: 'pass-1', status: GatePassStatus.USED }),
      logReturn:          jest.fn().mockResolvedValue({ id: 'pass-1', status: GatePassStatus.USED }),
      registerVisitor:    jest.fn().mockResolvedValue({ id: 'vis-1', visitorName: 'Jane Smith' }),
      getVisitorLogs:     jest.fn().mockResolvedValue({ data: [], total: 0 }),
      getCurrentVisitors: jest.fn().mockResolvedValue([]),
      recordVisitorExit:  jest.fn().mockResolvedValue({ id: 'vis-1', exitTime: new Date().toISOString() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PassportModule,
        JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [GateController],
      providers: [
        JwtStrategy,
        { provide: GateService, useValue: svc },
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

  // ── POST /gate/passes/request ──────────────────────────────────────────────

  describe('POST /gate/passes/request', () => {
    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).post('/gate/passes/request').send({ studentId: 'stu-1' }).expect(401);
    });

    it('returns 403 for GATE_GUARD (cannot request passes)', async () => {
      await request(app.getHttpServer())
        .post('/gate/passes/request')
        .set('Authorization', `Bearer ${gateGuardToken}`)
        .send({ studentId: 'stu-1' })
        .expect(403);
    });

    it('returns 201 for TEACHER', async () => {
      const res = await request(app.getHttpServer())
        .post('/gate/passes/request')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentId: 'stu-1', reason: 'Hospital appointment' })
        .expect(201);

      expect(res.body.data.passCode).toBe('123456');
      expect(res.body.data.status).toBe(GatePassStatus.PENDING);
      expect(svc.requestPass).toHaveBeenCalledWith(
        SCHOOL_ID,
        expect.objectContaining({ studentId: 'stu-1', reason: 'Hospital appointment', requestedBy: USER_ID }),
      );
    });

    it('returns 201 for HEAD_OF_BOARDING', async () => {
      await request(app.getHttpServer())
        .post('/gate/passes/request')
        .set('Authorization', `Bearer ${boardingToken}`)
        .send({ studentId: 'stu-2' })
        .expect(201);
    });
  });

  // ── PATCH /gate/passes/:id/approve ────────────────────────────────────────

  describe('PATCH /gate/passes/:id/approve', () => {
    const validBody = { validFrom: new Date().toISOString(), validUntil: new Date(Date.now() + 3600000).toISOString() };

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).patch('/gate/passes/pass-1/approve').send(validBody).expect(401);
    });

    it('returns 403 for GATE_GUARD (cannot approve)', async () => {
      await request(app.getHttpServer())
        .patch('/gate/passes/pass-1/approve')
        .set('Authorization', `Bearer ${gateGuardToken}`)
        .send(validBody)
        .expect(403);
    });

    it('returns 403 for TEACHER (cannot approve)', async () => {
      await request(app.getHttpServer())
        .patch('/gate/passes/pass-1/approve')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validBody)
        .expect(403);
    });

    it('returns 200 for HEAD_TEACHER', async () => {
      const res = await request(app.getHttpServer())
        .patch('/gate/passes/pass-1/approve')
        .set('Authorization', `Bearer ${htToken}`)
        .send(validBody)
        .expect(200);

      expect(res.body.data.status).toBe(GatePassStatus.APPROVED);
      expect(svc.approvePass).toHaveBeenCalledWith(
        'pass-1',
        SCHOOL_ID,
        expect.objectContaining({ authorizedBy: USER_ID }),
      );
    });

    it('returns 200 for HEAD_OF_BOARDING', async () => {
      await request(app.getHttpServer())
        .patch('/gate/passes/pass-1/approve')
        .set('Authorization', `Bearer ${boardingToken}`)
        .send(validBody)
        .expect(200);
    });
  });

  // ── GET /gate/passes/pending ───────────────────────────────────────────────

  describe('GET /gate/passes/pending', () => {
    it('returns 403 for GATE_GUARD', async () => {
      await request(app.getHttpServer())
        .get('/gate/passes/pending')
        .set('Authorization', `Bearer ${gateGuardToken}`)
        .expect(403);
    });

    it('returns 200 for HEAD_OF_BOARDING', async () => {
      const res = await request(app.getHttpServer())
        .get('/gate/passes/pending')
        .set('Authorization', `Bearer ${boardingToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ── GET /gate/passes/active ────────────────────────────────────────────────

  describe('GET /gate/passes/active', () => {
    it('returns 200 for GATE_GUARD', async () => {
      const res = await request(app.getHttpServer())
        .get('/gate/passes/active')
        .set('Authorization', `Bearer ${gateGuardToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .get('/gate/passes/active')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  // ── POST /gate/exit/log ────────────────────────────────────────────────────

  describe('POST /gate/exit/log', () => {
    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .post('/gate/exit/log')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ passCode: '123456' })
        .expect(403);
    });

    it('returns 201 for GATE_GUARD', async () => {
      const res = await request(app.getHttpServer())
        .post('/gate/exit/log')
        .set('Authorization', `Bearer ${gateGuardToken}`)
        .send({ passCode: '123456' })
        .expect(201);

      expect(res.body.data.status).toBe(GatePassStatus.USED);
      expect(svc.logExit).toHaveBeenCalledWith(SCHOOL_ID, '123456');
    });

    it('returns 201 for HEAD_OF_SECURITY', async () => {
      await request(app.getHttpServer())
        .post('/gate/exit/log')
        .set('Authorization', `Bearer ${securityToken}`)
        .send({ passCode: '123456' })
        .expect(201);
    });
  });

  // ── POST /gate/return/log ──────────────────────────────────────────────────

  describe('POST /gate/return/log', () => {
    it('returns 201 for GATE_GUARD and calls logReturn', async () => {
      await request(app.getHttpServer())
        .post('/gate/return/log')
        .set('Authorization', `Bearer ${gateGuardToken}`)
        .send({ passCode: '123456' })
        .expect(201);

      expect(svc.logReturn).toHaveBeenCalledWith(SCHOOL_ID, '123456');
    });
  });

  // ── POST /gate/visitors ────────────────────────────────────────────────────

  describe('POST /gate/visitors', () => {
    const visitorBody = { visitorName: 'Jane Smith', visitorPhone: '+256700123456', purpose: 'Meeting with HT' };

    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .post('/gate/visitors')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(visitorBody)
        .expect(403);
    });

    it('returns 201 for GATE_GUARD', async () => {
      const res = await request(app.getHttpServer())
        .post('/gate/visitors')
        .set('Authorization', `Bearer ${gateGuardToken}`)
        .send(visitorBody)
        .expect(201);

      expect(res.body.data.visitorName).toBe('Jane Smith');
      expect(svc.registerVisitor).toHaveBeenCalledWith(SCHOOL_ID, visitorBody, USER_ID);
    });

    it('returns 201 for COMMUNICATIONS_OFFICER', async () => {
      await request(app.getHttpServer())
        .post('/gate/visitors')
        .set('Authorization', `Bearer ${commsToken}`)
        .send(visitorBody)
        .expect(201);
    });
  });

  // ── GET /gate/visitors/current ─────────────────────────────────────────────

  describe('GET /gate/visitors/current', () => {
    it('returns 200 for HEAD_TEACHER', async () => {
      const res = await request(app.getHttpServer())
        .get('/gate/visitors/current')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .get('/gate/visitors/current')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });
});
