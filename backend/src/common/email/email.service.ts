import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE } from '../queues/queues.module';

export interface EmailJobData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer | string; contentType: string }[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly defaultFrom: string;

  constructor(
    @InjectQueue(QUEUE.EMAIL) private readonly emailQueue: Queue,
    private readonly config: ConfigService,
  ) {
    this.defaultFrom = config.get<string>('EMAIL_FROM', 'noreply@smissi.ac.ug');
  }

  /**
   * Enqueue an email — never blocks the HTTP thread.
   */
  async send(data: Omit<EmailJobData, 'from'> & { from?: string }): Promise<void> {
    await this.emailQueue.add(
      'send-email',
      { from: this.defaultFrom, ...data } satisfies EmailJobData,
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    const recipients = Array.isArray(data.to) ? data.to.join(', ') : data.to;
    this.logger.debug(`Email queued to ${recipients} — "${data.subject}"`);
  }

  /** Convenience: plain-text body auto-wrapped in minimal HTML. */
  async sendText(to: string | string[], subject: string, text: string): Promise<void> {
    return this.send({ to, subject, html: `<p>${text.replace(/\n/g, '<br>')}</p>` });
  }
}
