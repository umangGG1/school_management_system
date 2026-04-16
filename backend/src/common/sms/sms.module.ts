import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SmsService } from './sms.service';
import { QUEUE } from '../queues/queues.module';

@Global()
@Module({
  imports:   [BullModule.registerQueue({ name: QUEUE.SMS })],
  providers: [SmsService],
  exports:   [SmsService],
})
export class SmsModule {}
