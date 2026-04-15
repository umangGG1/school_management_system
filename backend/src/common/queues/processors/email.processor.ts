import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { QUEUE } from '../queue.constants';
import type { EmailJobData } from '../../email/email.service';

@Processor(QUEUE.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, html, from, replyTo } = job.data;

    const apiKey = this.config.get<string>('RESEND_API_KEY', '');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not set — email skipped');
      return;
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from:     from ?? this.config.get<string>('EMAIL_FROM', 'noreply@smissi.ac.ug'),
      to:       Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });

    if (error) {
      this.logger.error(`Email failed: ${error.message}`);
      throw new Error(error.message);   // triggers BullMQ retry
    }

    this.logger.log(`Email sent: "${subject}" → ${Array.isArray(to) ? to.join(', ') : to}`);
  }
}
