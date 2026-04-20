import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActivityModule } from '../../activity/activity.module';
import { PdfModule }  from '../pdf/pdf.module';
import { StorageModule } from '../storage/storage.module';

import { PayrollProcessor } from './processors/payroll.processor';
import { PdfProcessor }     from './processors/pdf.processor';
import { SmsProcessor }     from './processors/sms.processor';
import { EmailProcessor }   from './processors/email.processor';
import { ArchivalProcessor } from './processors/archival.processor';
import { getRedisConfigFromEnv } from '../config/runtime-config';

import { QUEUE } from './queue.constants';
export { QUEUE };

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (_config: ConfigService) => ({
        connection: getRedisConfigFromEnv(),
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      }),
    }),

    BullModule.registerQueue(
      { name: QUEUE.PAYROLL },
      { name: QUEUE.PDF },
      { name: QUEUE.SMS },
      { name: QUEUE.EMAIL },
      { name: QUEUE.ARCHIVAL },
    ),

    ActivityModule,
    PdfModule,
    StorageModule,
  ],
  providers: [
    PayrollProcessor,
    PdfProcessor,
    SmsProcessor,
    EmailProcessor,
    ArchivalProcessor,
  ],
  exports: [BullModule],
})
export class QueuesModule {}
