import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatePass }    from './entities/gate-pass.entity';
import { VisitorLog }  from './entities/visitor-log.entity';
import { GateService } from './gate.service';
import { GateController } from './gate.controller';

@Module({
  imports:     [TypeOrmModule.forFeature([GatePass, VisitorLog])],
  providers:   [GateService],
  controllers: [GateController],
  exports:     [GateService],
})
export class GateModule {}
