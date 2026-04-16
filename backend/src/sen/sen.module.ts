import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SenRecord }         from './entities/sen-record.entity';
import { SenObservation }    from './entities/sen-observation.entity';
import { AccommodationPlan } from './entities/accommodation-plan.entity';
import { SenService }        from './sen.service';
import { SenController }     from './sen.controller';

@Module({
  imports:     [TypeOrmModule.forFeature([SenRecord, SenObservation, AccommodationPlan])],
  providers:   [SenService],
  controllers: [SenController],
  exports:     [SenService],
})
export class SenModule {}
