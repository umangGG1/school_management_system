import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard }   from '../common/guards/jwt-auth.guard';
import { CurrentUser }    from '../common/decorators/current-user.decorator';
import { Public }         from '../common/decorators/public.decorator';
import { FinanceService } from './finance.service';
import { PesapalService } from '../common/payments/pesapal.service';
import { PaymentMethod }  from './entities/payment.entity';
import { ConfigService }  from '@nestjs/config';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly pesapalService: PesapalService,
    private readonly configService:  ConfigService,
  ) {}

  // ── Collection Summary ─────────────────────────────────────────────────────

  @Get('collection-summary')
  collectionSummary(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    const currentYear = new Date().getFullYear().toString();
    return this.financeService.collectionSummary(user.schoolId, term ?? 'Term 1', academicYear ?? currentYear);
  }

  // ── Invoices ───────────────────────────────────────────────────────────────

  @Get('invoices')
  findInvoices(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.financeService.findInvoices(user.schoolId, page, limit);
  }

  @Post('invoices')
  createInvoice(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.financeService.createInvoice({ ...body, schoolId: user.schoolId });
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  @Get('recent-payments')
  recentPayments(@CurrentUser() user: JwtPayload) {
    return this.financeService.recentPayments(user.schoolId);
  }

  @Get('payments')
  getPayments(
    @CurrentUser() user: JwtPayload,
    @Query('studentId') studentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.financeService.getPaymentHistory(user.schoolId, studentId, page, limit);
  }

  @Post('payments/record')
  recordPayment(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.financeService.recordPayment({ ...body, schoolId: user.schoolId, recordedById: user.sub });
  }

  // ── Student Balance ────────────────────────────────────────────────────────

  @Get('balance/student/:studentId')
  getStudentBalance(
    @Param('studentId') studentId: string,
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.financeService.getStudentBalance(studentId, user.schoolId, term, academicYear);
  }

  @Get('balance/me')
  getMyBalance(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.financeService.getStudentBalance(user.sub, user.schoolId, term, academicYear);
  }

  // ── Defaulters ─────────────────────────────────────────────────────────────

  @Get('defaulters')
  getDefaulters(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    const currentYear = new Date().getFullYear().toString();
    return this.financeService.getDefaulters(user.schoolId, term ?? 'Term 1', academicYear ?? currentYear);
  }

  // ── Expenses ───────────────────────────────────────────────────────────────

  @Get('expenses')
  findExpenses(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.financeService.findExpenses(user.schoolId, term, academicYear, page, limit);
  }

  @Post('expenses')
  createExpense(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.financeService.createExpense({ ...body, schoolId: user.schoolId, submittedById: user.sub });
  }

  @Patch('expenses/:id')
  updateExpense(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.financeService.updateExpense(id, user.schoolId, body);
  }

  @Patch('expenses/:id/approve')
  approveExpense(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.financeService.approveExpense(id, user.schoolId, user.sub);
  }

  @Delete('expenses/:id')
  deleteExpense(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.financeService.deleteExpense(id, user.schoolId);
  }

  @Get('expenses/summary')
  expenseSummary(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    const currentYear = new Date().getFullYear().toString();
    return this.financeService.expenseSummary(user.schoolId, term ?? 'Term 1', academicYear ?? currentYear);
  }

  // ── Fee Structure ──────────────────────────────────────────────────────────

  @Get('fee-structure')
  getFeeStructure(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    const currentYear = new Date().getFullYear().toString();
    return this.financeService.getFeeStructure(user.schoolId, term ?? 'Term 1', academicYear ?? currentYear);
  }

  @Post('fee-structure')
  createFeeStructureItem(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.financeService.createFeeStructureItem({ ...body, schoolId: user.schoolId });
  }

  @Patch('fee-structure/:id')
  updateFeeStructureItem(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.financeService.updateFeeStructureItem(id, user.schoolId, body);
  }

  // ── Mobile Money Payments (Pesapal) ───────────────────────────────────────

  /**
   * POST /api/finance/pay/:invoiceId
   * Initiates a Pesapal mobile money payment for an invoice.
   * Returns a redirect URL — the frontend should open it in a webview/new tab.
   */
  @Post('pay/:invoiceId')
  async initiatePayment(
    @CurrentUser() user: JwtPayload,
    @Param('invoiceId') invoiceId: string,
    @Body() body: { phone: string; network: 'MTN' | 'AIRTEL'; firstName?: string; lastName?: string; email?: string },
  ) {
    // Fetch the invoice to get the amount
    const invoice = await this.financeService.getInvoiceById(invoiceId, user.schoolId);

    const baseUrl   = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const callbackUrl = `${baseUrl}/api/finance/ipn`;

    return this.pesapalService.initiatePayment({
      amount:      invoice.amount - (invoice.paidAmount ?? 0),
      currency:    'UGX',
      orderId:     `INV-${invoiceId}-${Date.now()}`,
      description: `School fees payment — Invoice ${invoiceId}`,
      phone:       body.phone,
      network:     body.network,
      firstName:   body.firstName,
      lastName:    body.lastName,
      email:       body.email,
      callbackUrl,
    });
  }

  /**
   * POST /api/finance/ipn
   * Pesapal IPN (Instant Payment Notification) webhook.
   * Pesapal calls this URL when a payment completes or fails.
   * No auth guard — Pesapal is the caller.
   */
  @Public()
  @Post('ipn')
  async handleIpn(@Body() body: any) {
    const status = await this.pesapalService.handleIpn(body);

    if (status.status === 'COMPLETED' && status.orderId) {
      // orderId format: INV-{invoiceId}-{timestamp}
      // invoiceId may contain hyphens (UUID), so match everything up to the trailing numeric timestamp
      const match = status.orderId.match(/^INV-(.+)-\d+$/);
      const invoiceId = match?.[1] ?? null;

      if (invoiceId) {
        // Look up the invoice to get schoolId (IPN has no auth context)
        const invoice = await this.financeService.getInvoiceByIdUnsafe(invoiceId);
        if (invoice) {
          await this.financeService.recordPayment({
            invoiceId,
            amount:       status.amount ?? 0,
            method:       PaymentMethod.MTN_MOBILE_MONEY,  // Pesapal normalises the method
            reference:    status.pesapalTransactionId,
            schoolId:     invoice.schoolId,
            recordedById: 'pesapal-ipn',
          });
        }
      }
    }

    // Pesapal expects a 200 with specific body
    return { orderNotificationType: body.pesapal_notification_type, orderTrackingId: body.pesapal_transaction_tracking_id, orderMerchantReference: body.pesapal_merchant_reference };
  }
}

