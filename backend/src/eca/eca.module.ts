import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcaActivity }         from './entities/eca-activity.entity';
import { EcaCompetition }      from './entities/eca-competition.entity';
import { EcaAttendanceRecord } from './entities/eca-attendance.entity';
import { EcaService }     from './eca.service';
import { EcaController }  from './eca.controller';

@Module({
  imports:     [TypeOrmModule.forFeature([EcaActivity, EcaCompetition, EcaAttendanceRecord])],
  providers:   [EcaService],
  controllers: [EcaController],
  exports:     [EcaService],
})
export class EcaModule {}
