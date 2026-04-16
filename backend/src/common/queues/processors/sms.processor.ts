import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { QUEUE } from '../queue.constants';

export interface SmsJobData {
  to: string[];
  message: string;
  schoolId: string;
  senderId?: string;
}

@Processor(QUEUE.SMS)
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  async process(job: Job<SmsJobData>): Promise<void> {
    const { to, message, senderId } = job.data;

    const apiKey    = this.config.get<string>('AT_API_KEY', '');
    const username  = this.config.get<string>('AT_USERNAME', 'sandbox');
    const from      = senderId ?? this.config.get<string>('AT_SENDER_ID', 'SMISSI');

    if (!apiKey) {
      this.logger.warn('AT_API_KEY not set — SMS skipped');
      return;
    }

    // Dynamic import — africastalking CommonJS module
    const AfricasTalking = (await import('africastalking')).default;
    const at = AfricasTalking({ apiKey, username });
    const sms = at.SMS;

    const result = await sms.send({ to, message, from });
    const recipients = result?.SMSMessageData?.Recipients ?? [];
    const succeeded  = recipients.filter((r: any) => r.status === 'Success').length;

    this.logger.log(`SMS sent: ${succeeded}/${to.length} delivered`);
  }
}
