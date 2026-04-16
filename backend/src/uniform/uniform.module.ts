import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniformItem }       from './entities/uniform-item.entity';
import { UniformStock }      from './entities/uniform-stock.entity';
import { UniformAllocation } from './entities/uniform-allocation.entity';
import { UniformService }    from './uniform.service';
import { UniformController } from './uniform.controller';

@Module({
  imports:     [TypeOrmModule.forFeature([UniformItem, UniformStock, UniformAllocation])],
  providers:   [UniformService],
  controllers: [UniformController],
  exports:     [UniformService],
})
export class UniformModule {}
