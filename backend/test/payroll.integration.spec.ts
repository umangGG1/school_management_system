/**
 * Integration tests — Payroll module HTTP layer
 *
 * Verifies: JWT auth guard, role-based access control, response shape.
 * PayrollService is fully mocked — no DB or queue connections needed.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as typeof import('supertest');

import { PayrollController } from '../src/payroll/payroll.controller';
import { PayrollService }    from '../src/payroll/payroll.service';
import { JwtStrategy }       from '../src/auth/strategies/jwt.strategy';
import { JwtAuthGuard }      from '../src/common/guards/jwt-auth.guard';
import { RolesGuard }        from '../src/common/guards/roles.guard';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { UserRole }          from '../src/users/entities/user.entity';
import { PayrollRunStatus }  from '../src/payroll/entities/payroll-run.entity';
import { ComponentType }     from '../src/payroll/entities/salary-component.entity';
import { signToken, SCHOOL_ID, USER_ID } from './helpers/jwt.helper';

const JWT_SECRET = 'fallback_secret_change_me';

function buildApp(svcOverride: Partial<PayrollService> = {}) {
  const defaultSvc: Record<string, jest.Mock> = {
    listRuns:           jest.fn().mockResolvedValue({ data: [], total: 0 }),
    getRun:             jest.fn().mockResolvedValue({ id: 'run-1', status: PayrollRunStatus.DRAFT }),
    createRun:          jest.fn().mockResolvedValue({ run: { id: 'run-1', status: PayrollRunStatus.DRAFT }, jobId: 'job-1' }),
    approveRun:         jest.fn().mockResolvedValue({ id: 'run-1', status: PayrollRunStatus.APPROVED }),
    getPayslipsByStaff: jest.fn().mockResolvedValue([]),
    getComponents:      jest.fn().mockResolvedValue([]),
    upsertComponent:    jest.fn().mockResolvedValue({ id: 'c1', amount: 500000 }),
    getBrackets:        jest.fn().mockResolvedValue([]),
    calculatePaye:      jest.fn().mockResolvedValue(0),
    ...svcOverride,
  };
  return defaultSvc;
}

describe('Payroll — HTTP integration', () => {
  let app: INestApplication;
  let svc: ReturnType<typeof buildApp>;

  const htToken       = signToken({ roles: [UserRole.HEAD_TEACHER],    activeRole: UserRole.HEAD_TEACHER });
  const financeToken  = signToken({ roles: [UserRole.FINANCE_OFFICER], activeRole: UserRole.FINANCE_OFFICER });
  const teacherToken  = signToken({ roles: [UserRole.TEACHER],         activeRole: UserRole.TEACHER });

  beforeAll(async () => {
    svc = buildApp();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PassportModule,
        JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [PayrollController],
      providers: [
        JwtStrategy,
        { provide: PayrollService, useValue: svc },
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

  // ── GET /payroll/runs ──────────────────────────────────────────────────────

  describe('GET /payroll/runs', () => {
    it('returns 401 without Authorization header', async () => {
      await request(app.getHttpServer()).get('/payroll/runs').expect(401);
    });

    it('returns 403 for TEACHER role (not in allowed list)', async () => {
      await request(app.getHttpServer())
        .get('/payroll/runs')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('returns 200 with paginated data for HEAD_TEACHER', async () => {
      const res = await request(app.getHttpServer())
        .get('/payroll/runs')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data).toEqual({ data: [], total: 0 });
    });

    it('returns 200 for FINANCE_OFFICER', async () => {
      await request(app.getHttpServer())
        .get('/payroll/runs')
        .set('Authorization', `Bearer ${financeToken}`)
        .expect(200);
    });
  });

  // ── POST /payroll/runs ─────────────────────────────────────────────────────

  describe('POST /payroll/runs', () => {
    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).post('/payroll/runs').send({ month: '2026-04' }).expect(401);
    });

    it('returns 403 for TEACHER role', async () => {
      await request(app.getHttpServer())
        .post('/payroll/runs')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ month: '2026-04' })
        .expect(403);
    });

    it('returns 202 Accepted and enqueues payroll job', async () => {
      const res = await request(app.getHttpServer())
        .post('/payroll/runs')
        .set('Authorization', `Bearer ${htToken}`)
        .send({ month: '2026-04' })
        .expect(202);

      expect(res.body.data.run.status).toBe(PayrollRunStatus.DRAFT);
      expect(res.body.data.jobId).toBe('job-1');
      expect(svc.createRun).toHaveBeenCalledWith(SCHOOL_ID, '2026-04', USER_ID, undefined);
    });

    it('passes staffMemberIds when provided', async () => {
      await request(app.getHttpServer())
        .post('/payroll/runs')
        .set('Authorization', `Bearer ${htToken}`)
        .send({ month: '2026-04', staffMemberIds: ['s1', 's2'] })
        .expect(202);

      expect(svc.createRun).toHaveBeenCalledWith(SCHOOL_ID, '2026-04', USER_ID, ['s1', 's2']);
    });
  });

  // ── GET /payroll/runs/:id ──────────────────────────────────────────────────

  describe('GET /payroll/runs/:id', () => {
    it('returns 200 with run details', async () => {
      const res = await request(app.getHttpServer())
        .get('/payroll/runs/run-1')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data.id).toBe('run-1');
      expect(svc.getRun).toHaveBeenCalledWith('run-1', SCHOOL_ID);
    });
  });

  // ── POST /payroll/runs/:id/approve ─────────────────────────────────────────

  describe('POST /payroll/runs/:id/approve', () => {
    it('returns 201 and updates status to APPROVED', async () => {
      const res = await request(app.getHttpServer())
        .post('/payroll/runs/run-1/approve')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(201);

      expect(res.body.data.status).toBe(PayrollRunStatus.APPROVED);
      expect(svc.approveRun).toHaveBeenCalledWith('run-1', SCHOOL_ID, USER_ID);
    });
  });

  // ── GET /payroll/paye-brackets ─────────────────────────────────────────────

  describe('GET /payroll/paye-brackets', () => {
    it('returns 200 with bracket list', async () => {
      (svc.getBrackets as jest.Mock).mockResolvedValueOnce([
        { minIncome: 0, maxIncome: 235000, rate: 0, fixedAmount: 0 },
      ]);

      const res = await request(app.getHttpServer())
        .get('/payroll/paye-brackets')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].rate).toBe(0);
    });
  });

  // ── POST /payroll/components ───────────────────────────────────────────────

  describe('POST /payroll/components', () => {
    it('returns 201 with upserted component', async () => {
      const res = await request(app.getHttpServer())
        .post('/payroll/components')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({ staffMemberId: 's1', componentType: ComponentType.BASE, amount: 500000 })
        .expect(201);

      expect(res.body.data.amount).toBe(500000);
      expect(svc.upsertComponent).toHaveBeenCalledWith(SCHOOL_ID, 's1', ComponentType.BASE, 500000);
    });
  });
});
