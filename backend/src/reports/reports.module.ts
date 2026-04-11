import { Module } from '@nestjs/common';
import { AcademicModule }  from '../academic/academic.module';
import { FinanceModule }   from '../finance/finance.module';
import { BoardingModule }  from '../boarding/boarding.module';
import { MedicalModule }   from '../medical/medical.module';
import { SecurityModule }  from '../security/security.module';
import { StaffModule }     from '../staff/staff.module';
import { ReportsService }  from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    AcademicModule,
    FinanceModule,
    BoardingModule,
    MedicalModule,
    SecurityModule,
    StaffModule,
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
