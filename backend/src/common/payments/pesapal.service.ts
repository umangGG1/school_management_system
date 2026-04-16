import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export type MobileMoneyNetwork = 'MTN' | 'AIRTEL';

export interface InitiatePaymentOptions {
  amount: number;
  currency?: string;         // default UGX
  orderId: string;           // unique per payment attempt
  description: string;
  phone: string;             // E.164, e.g. +256700000000
  network: MobileMoneyNetwork;
  firstName?: string;
  lastName?: string;
  email?: string;
  callbackUrl: string;       // your /finance/ipn endpoint
  cancellationUrl?: string;
}

export interface PaymentStatus {
  orderId: string;
  pesapalTransactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'INVALID' | 'REVERSED';
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  message?: string;
}

@Injectable()
export class PesapalService {
  private readonly logger = new Logger(PesapalService.name);
  private readonly http: AxiosInstance;
  private readonly env: 'sandbox' | 'live';
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {
    this.env            = config.get<string>('PESAPAL_ENV', 'sandbox') as 'sandbox' | 'live';
    this.consumerKey    = config.get<string>('PESAPAL_CONSUMER_KEY', '');
    this.consumerSecret = config.get<string>('PESAPAL_CONSUMER_SECRET', '');

    const baseURL =
      this.env === 'live'
        ? 'https://pay.pesapal.com/v3'
        : 'https://cybqa.pesapal.com/pesapalv3';

    this.http = axios.create({ baseURL, timeout: 30_000 });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  private async getToken(): Promise<string> {
    // Re-use cached token for up to 4 minutes (Pesapal tokens last 5 min)
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const res = await this.http.post('/api/Auth/RequestToken', {
      consumer_key:    this.consumerKey,
      consumer_secret: this.consumerSecret,
    });

    const token = res.data?.token as string;
    if (!token) throw new InternalServerErrorException('Pesapal auth failed');

    this.tokenCache = { token, expiresAt: Date.now() + 4 * 60 * 1000 };
    return token;
  }

  private async authHeaders() {
    return { Authorization: `Bearer ${await this.getToken()}` };
  }

  // ── IPN Registration ──────────────────────────────────────────────────────

  /**
   * Register our IPN URL with Pesapal once (store the returned ipnId in .env).
   * Call this manually at setup time or expose a /admin/payments/register-ipn endpoint.
   */
  async registerIpn(ipnUrl: string): Promise<string> {
    const headers = await this.authHeaders();
    const res = await this.http.post(
      '/api/URLSetup/RegisterIPN',
      { url: ipnUrl, ipn_notification_type: 'POST' },
      { headers },
    );
    const ipnId = res.data?.ipn_id as string;
    this.logger.log(`Pesapal IPN registered: ${ipnId}`);
    return ipnId;
  }

  // ── Initiate Payment ──────────────────────────────────────────────────────

  /**
   * Submit an order to Pesapal and get a redirect URL.
   * For mobile money, the customer is redirected to approve the push USSD.
   */
  async initiatePayment(opts: InitiatePaymentOptions): Promise<{ redirectUrl: string; orderTrackingId: string }> {
    const headers = await this.authHeaders();

    const payload = {
      id:             opts.orderId,
      currency:       opts.currency ?? 'UGX',
      amount:         opts.amount,
      description:    opts.description,
      callback_url:   opts.callbackUrl,
      cancellation_url: opts.cancellationUrl ?? opts.callbackUrl,
      notification_id: this.config.get<string>('PESAPAL_IPN_ID', ''),
      billing_address: {
        phone_number: opts.phone,
        first_name:   opts.firstName ?? '',
        last_name:    opts.lastName  ?? '',
        email_address: opts.email   ?? '',
      },
    };

    const res = await this.http.post('/api/Transactions/SubmitOrderRequest', payload, { headers });

    const redirectUrl      = res.data?.redirect_url      as string;
    const orderTrackingId  = res.data?.order_tracking_id as string;

    if (!redirectUrl) {
      this.logger.error('Pesapal order submission failed', res.data);
      throw new InternalServerErrorException('Payment initiation failed');
    }

    this.logger.debug(`Payment initiated: orderId=${opts.orderId} trackingId=${orderTrackingId}`);
    return { redirectUrl, orderTrackingId };
  }

  // ── Query Payment Status ──────────────────────────────────────────────────

  async getPaymentStatus(orderTrackingId: string): Promise<PaymentStatus> {
    const headers = await this.authHeaders();
    const res = await this.http.get(
      `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      { headers },
    );

    return {
      orderId:              res.data?.merchant_reference  ?? '',
      pesapalTransactionId: res.data?.payment_status_description ?? '',
      status:               res.data?.payment_status_description ?? 'PENDING',
      amount:               res.data?.amount,
      currency:             res.data?.currency,
      paymentMethod:        res.data?.payment_method,
      message:              res.data?.description,
    };
  }

  // ── IPN Handler ───────────────────────────────────────────────────────────

  /**
   * Parse and verify an incoming IPN POST from Pesapal.
   * Returns { orderId, orderTrackingId, status } after verifying with Pesapal.
   */
  async handleIpn(body: {
    pesapal_notification_type: string;
    pesapal_transaction_tracking_id: string;
    pesapal_merchant_reference: string;
  }): Promise<PaymentStatus> {
    const { pesapal_transaction_tracking_id: trackingId } = body;
    return this.getPaymentStatus(trackingId);
  }
}
