import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Dormitory, DormRoom, DormAllocation, StudentLeave, DormRollCall, DormRollCallEntry,
} from './entities/boarding.entities';
import { DormIncident, NightReport, WelfareReport } from './entities/boarding-reports.entities';
import { Student } from '../students/entities/student.entity';
import { BoardingService } from './boarding.service';
import { BoardingController } from './boarding.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dormitory, DormRoom, DormAllocation, StudentLeave, DormRollCall, DormRollCallEntry,
      DormIncident, NightReport, WelfareReport,
      Student,
    ]),
  ],
  controllers: [BoardingController],
  providers: [BoardingService],
  exports: [BoardingService],
})
export class BoardingModule {}
