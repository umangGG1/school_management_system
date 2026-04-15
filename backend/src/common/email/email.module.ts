import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { QUEUE } from '../queues/queues.module';

@Global()
@Module({
  imports:   [BullModule.registerQueue({ name: QUEUE.EMAIL })],
  providers: [EmailService],
  exports:   [EmailService],
})
export class EmailModule {}
