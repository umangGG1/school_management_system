/**
 * Integration tests — Store module HTTP layer
 *
 * Key scenarios:
 * - All endpoints require JWT
 * - Write endpoints (POST items, approve/reject requisitions) need admin roles
 * - Any authenticated user can create requisitions and read items
 * - Role enforcement: TEACHER can create a requisition but cannot approve it
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as typeof import('supertest');

import { StoreController }   from '../src/store/store.controller';
import { StoreService }      from '../src/store/store.service';
import { JwtStrategy }       from '../src/auth/strategies/jwt.strategy';
import { JwtAuthGuard }      from '../src/common/guards/jwt-auth.guard';
import { RolesGuard }        from '../src/common/guards/roles.guard';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { UserRole }          from '../src/users/entities/user.entity';
import { RequisitionStatus } from '../src/store/entities/requisition.entity';
import { MovementType }      from '../src/store/entities/stock-movement.entity';
import { signToken, SCHOOL_ID, USER_ID } from './helpers/jwt.helper';

const JWT_SECRET = 'fallback_secret_change_me';

describe('Store — HTTP integration', () => {
  let app: INestApplication;
  let svc: Record<string, jest.Mock>;

  const htToken      = signToken({ roles: [UserRole.HEAD_TEACHER],   activeRole: UserRole.HEAD_TEACHER });
  const financeToken = signToken({ roles: [UserRole.FINANCE_OFFICER], activeRole: UserRole.FINANCE_OFFICER });
  const teacherToken = signToken({ roles: [UserRole.TEACHER],         activeRole: UserRole.TEACHER });

  beforeAll(async () => {
    svc = {
      findItems:          jest.fn().mockResolvedValue({ data: [], total: 0 }),
      findLowStock:       jest.fn().mockResolvedValue([]),
      createItem:         jest.fn().mockResolvedValue({ id: 'item-1', name: 'Chalk', quantityInStock: 100 }),
      updateItem:         jest.fn().mockResolvedValue({ id: 'item-1', name: 'Chalk' }),
      findMovements:      jest.fn().mockResolvedValue({ data: [], total: 0 }),
      manualAdjustment:   jest.fn().mockResolvedValue({ id: 'mov-1', type: MovementType.IN, quantity: 50 }),
      findRequisitions:   jest.fn().mockResolvedValue({ data: [], total: 0 }),
      createRequisition:  jest.fn().mockResolvedValue({ id: 'req-1', status: RequisitionStatus.PENDING }),
      approveRequisition: jest.fn().mockResolvedValue({ id: 'req-1', status: RequisitionStatus.APPROVED }),
      rejectRequisition:  jest.fn().mockResolvedValue({ id: 'req-1', status: RequisitionStatus.REJECTED }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PassportModule,
        JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [StoreController],
      providers: [
        JwtStrategy,
        { provide: StoreService, useValue: svc },
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

  // ── GET /store/items ───────────────────────────────────────────────────────

  describe('GET /store/items', () => {
    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/store/items').expect(401);
    });

    it('returns 200 for any authenticated user (no role restriction)', async () => {
      const res = await request(app.getHttpServer())
        .get('/store/items')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.data).toEqual({ data: [], total: 0 });
      expect(svc.findItems).toHaveBeenCalledWith(SCHOOL_ID, expect.objectContaining({}));
    });
  });

  // ── GET /store/items/low-stock ─────────────────────────────────────────────

  describe('GET /store/items/low-stock', () => {
    it('returns 200 with low-stock items', async () => {
      svc.findLowStock.mockResolvedValueOnce([{ id: 'item-2', name: 'Exercise Books', quantityInStock: 3 }]);

      const res = await request(app.getHttpServer())
        .get('/store/items/low-stock')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Exercise Books');
    });
  });

  // ── POST /store/items ──────────────────────────────────────────────────────

  describe('POST /store/items', () => {
    const itemBody = { name: 'Chalk', code: 'CHK-001', unit: 'box', quantityInStock: 100, unitCost: 500 };

    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .post('/store/items')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(itemBody)
        .expect(403);
    });

    it('returns 201 for HEAD_TEACHER', async () => {
      const res = await request(app.getHttpServer())
        .post('/store/items')
        .set('Authorization', `Bearer ${htToken}`)
        .send(itemBody)
        .expect(201);

      expect(res.body.data.id).toBe('item-1');
      expect(svc.createItem).toHaveBeenCalledWith(SCHOOL_ID, itemBody);
    });

    it('returns 201 for FINANCE_OFFICER', async () => {
      await request(app.getHttpServer())
        .post('/store/items')
        .set('Authorization', `Bearer ${financeToken}`)
        .send(itemBody)
        .expect(201);
    });
  });

  // ── POST /store/movements ──────────────────────────────────────────────────

  describe('POST /store/movements', () => {
    const movBody = { storeItemId: 'item-1', type: MovementType.IN, quantity: 50, reason: 'New delivery' };

    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .post('/store/movements')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(movBody)
        .expect(403);
    });

    it('returns 201 and calls manualAdjustment for HEAD_TEACHER', async () => {
      const res = await request(app.getHttpServer())
        .post('/store/movements')
        .set('Authorization', `Bearer ${htToken}`)
        .send(movBody)
        .expect(201);

      expect(res.body.data.type).toBe(MovementType.IN);
      expect(svc.manualAdjustment).toHaveBeenCalledWith(
        SCHOOL_ID, 'item-1', MovementType.IN, 50, 'New delivery', USER_ID,
      );
    });
  });

  // ── POST /store/requisitions ───────────────────────────────────────────────

  describe('POST /store/requisitions', () => {
    const reqBody = { department: 'Science', items: [{ storeItemId: 'item-1', quantityRequested: 5 }] };

    it('returns 201 for TEACHER (any role can requisition)', async () => {
      const res = await request(app.getHttpServer())
        .post('/store/requisitions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(reqBody)
        .expect(201);

      expect(res.body.data.status).toBe(RequisitionStatus.PENDING);
      expect(svc.createRequisition).toHaveBeenCalledWith(
        SCHOOL_ID,
        expect.objectContaining({ department: 'Science', requestedBy: USER_ID }),
      );
    });
  });

  // ── PATCH /store/requisitions/:id/approve ─────────────────────────────────

  describe('PATCH /store/requisitions/:id/approve', () => {
    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .patch('/store/requisitions/req-1/approve')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('returns 200 for HEAD_TEACHER and status becomes APPROVED', async () => {
      const res = await request(app.getHttpServer())
        .patch('/store/requisitions/req-1/approve')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data.status).toBe(RequisitionStatus.APPROVED);
      expect(svc.approveRequisition).toHaveBeenCalledWith('req-1', SCHOOL_ID, USER_ID);
    });

    it('returns 200 for FINANCE_OFFICER', async () => {
      await request(app.getHttpServer())
        .patch('/store/requisitions/req-1/approve')
        .set('Authorization', `Bearer ${financeToken}`)
        .expect(200);
    });
  });

  // ── PATCH /store/requisitions/:id/reject ──────────────────────────────────

  describe('PATCH /store/requisitions/:id/reject', () => {
    it('returns 403 for TEACHER', async () => {
      await request(app.getHttpServer())
        .patch('/store/requisitions/req-1/reject')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('returns 200 for HEAD_TEACHER and status becomes REJECTED', async () => {
      const res = await request(app.getHttpServer())
        .patch('/store/requisitions/req-1/reject')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data.status).toBe(RequisitionStatus.REJECTED);
      expect(svc.rejectRequisition).toHaveBeenCalledWith('req-1', SCHOOL_ID, USER_ID);
    });
  });

  // ── GET /store/requisitions ────────────────────────────────────────────────

  describe('GET /store/requisitions', () => {
    it('returns 200 with paginated list', async () => {
      svc.findRequisitions.mockResolvedValueOnce({ data: [{ id: 'req-1', status: RequisitionStatus.PENDING }], total: 1 });

      const res = await request(app.getHttpServer())
        .get('/store/requisitions?status=PENDING')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data.total).toBe(1);
      expect(res.body.data.data[0].status).toBe(RequisitionStatus.PENDING);
    });
  });
});
