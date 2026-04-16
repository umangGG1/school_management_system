/**
 * Integration tests — Finance module HTTP layer
 *
 * Key scenarios:
 * - JWT guard on all finance endpoints
 * - POST /finance/pay/:invoiceId → Pesapal redirect URL
 * - POST /finance/ipn → no auth guard, returns Pesapal ACK shape
 * - Collection summary, invoice list response shape
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as typeof import('supertest');

import { FinanceController } from '../src/finance/finance.controller';
import { FinanceService }    from '../src/finance/finance.service';
import { PesapalService }    from '../src/common/payments/pesapal.service';
import { JwtStrategy }       from '../src/auth/strategies/jwt.strategy';
import { JwtAuthGuard }      from '../src/common/guards/jwt-auth.guard';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { signToken, SCHOOL_ID } from './helpers/jwt.helper';

const JWT_SECRET = 'fallback_secret_change_me';

describe('Finance — HTTP integration', () => {
  let app: INestApplication;
  let financeSvc: Record<string, jest.Mock>;
  let pesapalSvc: Record<string, jest.Mock>;

  const htToken = signToken();   // HEAD_TEACHER by default

  beforeAll(async () => {
    financeSvc = {
      collectionSummary:    jest.fn().mockResolvedValue({ classes: [], termTarget: 0, totalCollected: 0 }),
      findInvoices:         jest.fn().mockResolvedValue({ data: [], total: 0 }),
      createInvoice:        jest.fn().mockResolvedValue({ id: 'inv-1', amount: 500000 }),
      recentPayments:       jest.fn().mockResolvedValue([]),
      getPaymentHistory:    jest.fn().mockResolvedValue({ data: [], total: 0 }),
      recordPayment:        jest.fn().mockResolvedValue({ id: 'pay-1', amount: 100000 }),
      getStudentBalance:    jest.fn().mockResolvedValue({ balance: 400000, invoiceTotal: 500000, paidAmount: 100000 }),
      getDefaulters:        jest.fn().mockResolvedValue([]),
      findExpenses:         jest.fn().mockResolvedValue({ data: [], total: 0 }),
      createExpense:        jest.fn().mockResolvedValue({ id: 'exp-1' }),
      updateExpense:        jest.fn().mockResolvedValue({ id: 'exp-1' }),
      approveExpense:       jest.fn().mockResolvedValue({ id: 'exp-1', status: 'APPROVED' }),
      deleteExpense:        jest.fn().mockResolvedValue(undefined),
      expenseSummary:       jest.fn().mockResolvedValue({ total: 0, categories: [] }),
      getFeeStructure:      jest.fn().mockResolvedValue([]),
      createFeeStructureItem: jest.fn().mockResolvedValue({ id: 'fs-1' }),
      updateFeeStructureItem: jest.fn().mockResolvedValue({ id: 'fs-1' }),
      getInvoiceById:       jest.fn().mockResolvedValue({ id: 'inv-1', amount: 500000, paidAmount: 100000, schoolId: SCHOOL_ID }),
      getInvoiceByIdUnsafe: jest.fn().mockResolvedValue({ id: 'inv-1', amount: 500000, paidAmount: 100000, schoolId: SCHOOL_ID }),
    };

    pesapalSvc = {
      initiatePayment: jest.fn().mockResolvedValue({ redirectUrl: 'https://pay.pesapal.com/redirect', orderTrackingId: 'ord-abc123' }),
      getPaymentStatus: jest.fn().mockResolvedValue({ status: 'COMPLETED' }),
      handleIpn:        jest.fn().mockResolvedValue({ status: 'COMPLETED', orderId: 'INV-inv-1-1234567890', amount: 400000, pesapalTransactionId: 'tx-001' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PassportModule,
        JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [FinanceController],
      providers: [
        JwtStrategy,
        { provide: FinanceService, useValue: financeSvc },
        { provide: PesapalService, useValue: pesapalSvc },
      ],
    }).compile();

    app = module.createNestApplication();
    const reflector = module.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  // ── GET /finance/collection-summary ───────────────────────────────────────

  describe('GET /finance/collection-summary', () => {
    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/finance/collection-summary').expect(401);
    });

    it('returns 200 with summary shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/finance/collection-summary?term=Term%201&academicYear=2026')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('termTarget');
      expect(res.body.data).toHaveProperty('totalCollected');
      expect(financeSvc.collectionSummary).toHaveBeenCalledWith(SCHOOL_ID, 'Term 1', '2026');
    });

    it('uses defaults when term/academicYear not provided', async () => {
      await request(app.getHttpServer())
        .get('/finance/collection-summary')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(financeSvc.collectionSummary).toHaveBeenCalledWith(
        SCHOOL_ID,
        'Term 1',
        expect.stringMatching(/^\d{4}$/),
      );
    });
  });

  // ── GET /finance/invoices ──────────────────────────────────────────────────

  describe('GET /finance/invoices', () => {
    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/finance/invoices').expect(401);
    });

    it('returns 200 with paginated invoice list', async () => {
      const res = await request(app.getHttpServer())
        .get('/finance/invoices?page=1&limit=10')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data).toEqual({ data: [], total: 0 });
      expect(financeSvc.findInvoices).toHaveBeenCalledWith(SCHOOL_ID, 1, 10);
    });
  });

  // ── GET /finance/balance/student/:studentId ────────────────────────────────

  describe('GET /finance/balance/student/:studentId', () => {
    it('returns balance with correct fields', async () => {
      const res = await request(app.getHttpServer())
        .get('/finance/balance/student/stu-1?term=Term%201&academicYear=2026')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('balance');
      expect(res.body.data).toHaveProperty('invoiceTotal');
      expect(res.body.data).toHaveProperty('paidAmount');
    });
  });

  // ── POST /finance/pay/:invoiceId ───────────────────────────────────────────

  describe('POST /finance/pay/:invoiceId', () => {
    const payBody = { phone: '+256700123456', network: 'MTN' as const };

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).post('/finance/pay/inv-1').send(payBody).expect(401);
    });

    it('returns 201 with redirectUrl and orderTrackingId', async () => {
      const res = await request(app.getHttpServer())
        .post('/finance/pay/inv-1')
        .set('Authorization', `Bearer ${htToken}`)
        .send(payBody)
        .expect(201);

      expect(res.body.data.redirectUrl).toContain('pesapal.com');
      expect(res.body.data.orderTrackingId).toBeDefined();
    });

    it('fetches invoice to compute balance due (amount - paidAmount)', async () => {
      await request(app.getHttpServer())
        .post('/finance/pay/inv-1')
        .set('Authorization', `Bearer ${htToken}`)
        .send(payBody)
        .expect(201);

      expect(financeSvc.getInvoiceById).toHaveBeenCalledWith('inv-1', SCHOOL_ID);
      // amount - paidAmount = 500000 - 100000 = 400000
      expect(pesapalSvc.initiatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 400000, currency: 'UGX', network: 'MTN' }),
      );
    });

    it('includes orderId with INV- prefix', async () => {
      await request(app.getHttpServer())
        .post('/finance/pay/inv-1')
        .set('Authorization', `Bearer ${htToken}`)
        .send(payBody)
        .expect(201);

      const callArg = pesapalSvc.initiatePayment.mock.calls[0][0];
      expect(callArg.orderId).toMatch(/^INV-inv-1-\d+$/);
    });
  });

  // ── POST /finance/ipn ──────────────────────────────────────────────────────

  describe('POST /finance/ipn (no auth guard)', () => {
    it('returns 201 without Authorization header', async () => {
      const ipnBody = {
        pesapal_notification_type: 'CHANGE',
        pesapal_transaction_tracking_id: 'ord-abc123',
        pesapal_merchant_reference: 'INV-inv-1-1234567890',
      };

      const res = await request(app.getHttpServer())
        .post('/finance/ipn')
        .send(ipnBody)
        .expect(201);

      // Should return the Pesapal ACK shape
      expect(res.body.data).toHaveProperty('orderNotificationType');
      expect(res.body.data).toHaveProperty('orderTrackingId');
      expect(res.body.data).toHaveProperty('orderMerchantReference');
    });

    it('records payment when IPN status is COMPLETED', async () => {
      const ipnBody = { pesapal_merchant_reference: 'INV-inv-1-9999999999' };

      await request(app.getHttpServer())
        .post('/finance/ipn')
        .send(ipnBody)
        .expect(201);

      expect(pesapalSvc.handleIpn).toHaveBeenCalledWith(ipnBody);
      expect(financeSvc.getInvoiceByIdUnsafe).toHaveBeenCalledWith('inv-1');
      expect(financeSvc.recordPayment).toHaveBeenCalledWith(
        expect.objectContaining({ invoiceId: 'inv-1', schoolId: SCHOOL_ID, recordedById: 'pesapal-ipn' }),
      );
    });

    it('does NOT record payment when IPN status is FAILED', async () => {
      pesapalSvc.handleIpn.mockResolvedValueOnce({ status: 'FAILED', orderId: null });

      await request(app.getHttpServer())
        .post('/finance/ipn')
        .send({})
        .expect(201);

      expect(financeSvc.recordPayment).not.toHaveBeenCalled();
    });
  });

  // ── GET /finance/defaulters ────────────────────────────────────────────────

  describe('GET /finance/defaulters', () => {
    it('returns 200 with defaulter list', async () => {
      financeSvc.getDefaulters.mockResolvedValueOnce([{ studentId: 'stu-5', outstanding: 250000 }]);

      const res = await request(app.getHttpServer())
        .get('/finance/defaulters?term=Term%201&academicYear=2026')
        .set('Authorization', `Bearer ${htToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].studentId).toBe('stu-5');
    });
  });
});
