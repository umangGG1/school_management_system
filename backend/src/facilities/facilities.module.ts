import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset }               from './entities/asset.entity';
import { FacilityBooking }     from './entities/facility-booking.entity';
import { MaintenanceRequest }  from './entities/maintenance-request.entity';
import { FacilitiesService }   from './facilities.service';
import { FacilitiesController } from './facilities.controller';

@Module({
  imports:     [TypeOrmModule.forFeature([Asset, FacilityBooking, MaintenanceRequest])],
  providers:   [FacilitiesService],
  controllers: [FacilitiesController],
  exports:     [FacilitiesService],
})
export class FacilitiesModule {}
