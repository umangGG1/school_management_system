import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CounselingCase,
  CaseNote,
  CounselingSession,
  SafeguardingReport,
  OVCRegistration,
  HealthReferral,
} from './entities/counseling.entities';
import { CounselingService } from './counseling.service';
import { CounselingController } from './counseling.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CounselingCase,
      CaseNote,
      CounselingSession,
      SafeguardingReport,
      OVCRegistration,
      HealthReferral,
    ]),
  ],
  providers: [CounselingService],
  controllers: [CounselingController],
  exports: [CounselingService],
})
export class CounselingModule {}
