import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department, SyllabusProgress, LessonObservation, SchemeOfWork } from './entities/hod.entities';
import { HodService } from './hod.service';
import { HodController } from './hod.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Department, SyllabusProgress, LessonObservation, SchemeOfWork])],
  controllers: [HodController],
  providers: [HodService],
  exports: [HodService],
})
export class HodModule {}
