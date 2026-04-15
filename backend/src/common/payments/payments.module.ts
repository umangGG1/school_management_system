import { Global, Module } from '@nestjs/common';
import { PesapalService } from './pesapal.service';

@Global()
@Module({
  providers: [PesapalService],
  exports:   [PesapalService],
})
export class PaymentsModule {}
