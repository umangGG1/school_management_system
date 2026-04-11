import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SickBayVisit, StudentMedicalHistory } from './entities/medical.entities';
import { MedicationLog } from './entities/medication.entity';
import { HospitalReferral } from './entities/hospital-referral.entity';
import { MedicalService } from './medical.service';
import { MedicalController } from './medical.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SickBayVisit, StudentMedicalHistory, MedicationLog, HospitalReferral])],
  controllers: [MedicalController],
  providers: [MedicalService],
  exports: [MedicalService],
})
export class MedicalModule {}
