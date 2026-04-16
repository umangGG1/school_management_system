import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE } from '../queues/queues.module';

export interface SmsJobData {
  to: string[];
  message: string;
  schoolId: string;
  senderId?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @InjectQueue(QUEUE.SMS) private readonly smsQueue: Queue,
    private readonly config: ConfigService,
  ) {}

  /**
   * Enqueue an SMS — never blocks the HTTP thread.
   * @param to       Array of E.164 phone numbers, e.g. ['+256700000000']
   * @param message  Plain-text message (160 chars = 1 SMS unit)
   * @param schoolId Used for logging / per-school sender ID lookup
   */
  async send(to: string[], message: string, schoolId: string): Promise<void> {
    if (!to.length) return;

    const senderId = this.config.get<string>('AT_SENDER_ID', 'SMISSI');

    await this.smsQueue.add(
      'send-sms',
      { to, message, schoolId, senderId } satisfies SmsJobData,
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );

    this.logger.debug(`SMS queued to ${to.length} recipient(s)`);
  }

  /** Convenience: single recipient. */
  async sendTo(phone: string, message: string, schoolId: string): Promise<void> {
    return this.send([phone], message, schoolId);
  }
}
