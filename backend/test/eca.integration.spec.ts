/**
 * Integration tests — ECA module HTTP layer
 *
 * Verifies role-based access:
 *   - Any authenticated user can read (GET) ECA data
 *   - Only ECA_OFFICER / HEAD_TEACHER / SUPER_ADMIN can write activities & competitions
 *   - Only ECA_OFFICER / TEACHER / SUPER_ADMIN can record attendance
 *   - Only ECA_OFFICER / HEAD_TEACHER / SUPER_ADMIN can see patrons
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as typeof import('supertest');

import { EcaController } from '../src/eca/eca.controller';
import { EcaService }    from '../src/eca/eca.service';
import { JwtStrategy }   from '../src/auth/strategies/jwt.strategy';
import { JwtAuthGuard }  from '../src/common/guards/jwt-auth.guard';
import { RolesGuard }    from '../src/common/guards/roles.guard';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { UserRole }      from '../src/users/entities/user.entity';
import { signToken, SCHOOL_ID, USER_ID } from './helpers/jwt.helper';

describe('ECA — HTTP integration', () => {
  let app: INestApplication;
  let svc: Record<string, jest.Mock>;

  // ── Tokens ─────────────────────────────────────────────────────────────────

  const ecaOfficerToken  = signToken({ roles: [UserRole.ECA_OFFICER],   activeRole: UserRole.ECA_OFFICER });
  const htToken          = signToken({ roles: [UserRole.HEAD_TEACHER],   activeRole: UserRole.HEAD_TEACHER });
  const teacherToken     = signToken({ roles: [UserRole.TEACHER],        activeRole: UserRole.TEACHER });
  const superAdminToken  = signToken({ roles: [UserRole.SUPER_ADMIN],    activeRole: UserRole.SUPER_ADMIN });
  const parentToken      = signToken({ roles: [UserRole.PARENT],         activeRole: UserRole.PARENT });
  const studentToken     = signToken({ roles: [UserRole.STUDENT],        activeRole: UserRole.STUDENT });

  beforeAll(async () => {
    svc = {
      getSummary:         jest.fn().mockResolvedValue({ totalActivities: 5, totalEnrolled: 120, avgAttendance: 82, competitions: 3 }),
      getActivities:      jest.fn().mockResolvedValue([{ id: 'a1', name: 'Football', category: 'SPORTS' }]),
      createActivity:     jest.fn().mockResolvedValue({ id: 'a-new', name: 'Drama Club', category: 'ARTS' }),
      getCompetitions:    jest.fn().mockResolvedValue([{ id: 'c1', eventName: 'Football Cup', status: 'UPCOMING' }]),
      createCompetition:  jest.fn().mockResolvedValue({ id: 'c-new', eventName: 'Chess Tourney' }),
      getAttendanceRates: jest.fn().mockResolvedValue([{ activityId: 'a1', activityName: 'Football', rate: 88, trend: 'STABLE' }]),
      recordAttendance:   jest.fn().mockResolvedValue([{ id: 'att-1', status: 'PRESENT' }]),
      getPatrons:         jest.fn().mockResolvedValue([{ staffName: 'Mr. Okello', activities: ['Football'], reportCount: 0 }]),
      getLeadership:      jest.fn().mockResolvedValue([{ id: 'a2', name: 'Student Council', category: 'LEADERSHIP' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PassportModule,
        JwtModule.register({ secret: 'fallback_secret_change_me', signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [EcaController],
      providers: [
        JwtStrategy,
        { provide: EcaService, useValue: svc },
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

  // ── GET /eca/summary ───────────────────────────────────────────────────────

  describe('GET /eca/summary', () => {
    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/eca/summary').expect(401);
    });

    it('returns 200 for ECA_OFFICER', async () => {
      const res = await request(app.getHttpServer())
        .get('/eca/summary')
        .set('Authorization', `Bearer ${ecaOfficerToken}`)
        .expect(200);

      expect(res.body.data.totalActivities).toBe(5);
      expect(svc.getSummary).toHaveBeenCalledWith(SCHOOL_ID);
    });

    it('returns 200 for TEACHER (read-only access allowed)', async () => {
      await request(app.getHttpServer())
        .get('/eca/summary')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);
    });

    it('returns 200 for PARENT', async () => {
      await request(app.getHttpServer())
        .get('/eca/summary')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);
    });
  });

  // ── GET /eca/activities ────────────────────────────────────────────────────

  describe('GET /eca/activities', () => {
    it('returns 200 with activity list for any authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/eca/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].name).toBe('Football');
    });

    it('calls getActivities with schoolId from token', async () => {
      await request(app.getHttpServer())
        .get('/eca/activities')
        .set('Authorization', `Bearer ${ecaOfficerToken}`)
        .expect(200);

      expect(svc.getActivities).toHaveBeenCalledWith(SCHOOL_ID);
    });
  });

  // ── POST /eca/activities ───────────────────────────────────────────────────

  describe('POST /eca/activities', () => {
    const activityBody = { name: 'Drama Club', category: 'ARTS' };

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).post('/eca/activities').send(activityBody).expect(401);
    });

    it('returns 403 for PARENT (write not allowed)', async () => {
      await request(app.getHttpServer())
        .post('/eca/activities')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(activityBody)
        .expect(403);
    });

    it('returns 403 for STUDENT', async () => {
      await request(app.getHttpServer())
        .post('/eca/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(activityBody)
        .expect(403);
    });

    it('returns 403 for TEACHER (cannot create activities)', async () => {
      await request(app.getHttpServer())
        .post('/eca/activities')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(activityBody)
        .expect(403);
    });

    it('returns 201 for ECA_OFFICER', async () => {
      const res = await request(app.getHttpServer())
        .post('/eca/activities')
        .set('Authorization', `Bearer ${ecaOfficerToken}`)
        .send(activityBody)
        .expect(201);

      expect(res.body.data.id).toBe('a-new');
      expect(svc.createActivity).toHaveBeenCalledWith(SCHOOL_ID, activityBody);
    });

    it('returns 201 for HEAD_TEACHER', async () => {
      await request(app.getHttpServer())
        .post('/eca/activities')
        .set('Authorization', `Bearer ${htToken}`)
        .send(activityBody)
        .expect(201);
    });

    it('returns 201 for SUPER_ADMIN', async () => {
      await request(app.getHttpServer())
        .post('/eca/activities')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(activityBody)
        .expect(201);
    });
  });

  // ── GET /eca/competitions ──────────────────────────────────────────────────

  describe('GET /eca/competitions', () => {
    it('returns 200 for any authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/eca/competitions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.data[0].eventName).toBe('Football Cup');
    });
  });

  // ── POST /eca/competitions ─────────────────────────────────────────────────

  describe('POST /eca/competitions', () => {
    const compBody = { activityName: 'Football', eventName: 'Chess Tourney', status: 'UPCOMING' };

    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .post('/eca/competitions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(compBody)
        .expect(403);
    });

    it('returns 201 for ECA_OFFICER', async () => {
      const res = await request(app.getHttpServer())
        .post('/eca/competitions')
        .set('Authorization', `Bearer ${ecaOfficerToken}`)
        .send(compBody)
        .expect(201);

      expect(res.body.data.eventName).toBe('Chess Tourney');
      expect(svc.createCompetition).toHaveBeenCalledWith(SCHOOL_ID, compBody);
    });
  });

  // ── GET /eca/attendance ────────────────────────────────────────────────────

  describe('GET /eca/attendance', () => {
    it('returns 200 with attendance rates for any authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/eca/attendance')
        .set('Authorization', `Bearer ${ecaOfficerToken}`)
        .expect(200);

      expect(res.body.data[0].rate).toBe(88);
    });
  });

  // ── POST /eca/attendance ───────────────────────────────────────────────────

  describe('POST /eca/attendance', () => {
    const attendanceBody = {
      activityId:  'a1',
      sessionDate: '2026-04-15',
      entries: [
        { studentId: 'stu-1', status: 'PRESENT' },
        { studentId: 'stu-2', status: 'ABSENT' },
      ],
    };

    it('returns 403 for PARENT', async () => {
      await request(app.getHttpServer())
        .post('/eca/attendance')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(attendanceBody)
        .expect(403);
    });

    it('returns 403 for STUDENT', async () => {
      await request(app.getHttpServer())
        .post('/eca/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(attendanceBody)
        .expect(403);
    });

    it('returns 201 for TEACHER', async () => {
      const res = await request(app.getHttpServer())
        .post('/eca/attendance')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(attendanceBody)
        .expect(201);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(svc.recordAttendance).toHaveBeenCalledWith(SCHOOL_ID, attendanceBody);
    });

    it('returns 201 for ECA_OFFICER', async () => {
      await request(app.getHttpServer())
        .post('/eca/attendance')
        .set('Authorization', `Bearer ${ecaOfficerToken}`)
        .send(attendanceBody)
        .expect(201);
    });
  });

  // ── GET /eca/patrons ───────────────────────────────────────────────────────

  describe('GET /eca/patrons', () => {
    it('returns 403 for TEACHER (patrons are admin-only)', async () => {
      await request(app.getHttpServer())
        .get('/eca/patrons')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('returns 403 for PARENT', async () => {
      await request(app.getHttpServer())
        .get('/eca/patrons')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);
    });

    it('returns 200 for ECA_OFFICER', async () => {
      const res = await request(app.getHttpServer())
        .get('/eca/patrons')
        .set('Authorization', `Bearer ${ecaOfficerToken}`)
        .expect(200);

      expect(res.body.data[0].staffName).toBe('Mr. Okello');
      expect(svc.getPatrons).toHaveBeenCalledWith(SCHOOL_ID);
    });

    it('returns 200 for HEAD_TEACHER', async () => {
      await request(app.getHttpServer())
        .get('/eca/patrons')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);
    });
  });

  // ── GET /eca/leadership ────────────────────────────────────────────────────

  describe('GET /eca/leadership', () => {
    it('returns 200 for any authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/eca/leadership')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.data[0].category).toBe('LEADERSHIP');
    });

    it('calls getLeadership with schoolId', async () => {
      await request(app.getHttpServer())
        .get('/eca/leadership')
        .set('Authorization', `Bearer ${ecaOfficerToken}`)
        .expect(200);

      expect(svc.getLeadership).toHaveBeenCalledWith(SCHOOL_ID);
    });
  });
});
