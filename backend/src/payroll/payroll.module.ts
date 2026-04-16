import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PayrollRun }       from './entities/payroll-run.entity';
import { Payslip }          from './entities/payslip.entity';
import { SalaryComponent }  from './entities/salary-component.entity';
import { PayeBracket }      from './entities/paye-bracket.entity';
import { PayrollService }   from './payroll.service';
import { PayrollController } from './payroll.controller';
import { QUEUE }            from '../common/queues/queue.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollRun, Payslip, SalaryComponent, PayeBracket]),
    BullModule.registerQueue({ name: QUEUE.PAYROLL }),
  ],
  providers:   [PayrollService],
  controllers: [PayrollController],
  exports:     [PayrollService],
})
export class PayrollModule {}
