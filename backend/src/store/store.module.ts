import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreItem }       from './entities/store-item.entity';
import { StockMovement }   from './entities/stock-movement.entity';
import { Requisition }     from './entities/requisition.entity';
import { RequisitionItem } from './entities/requisition-item.entity';
import { StoreService }    from './store.service';
import { StoreController } from './store.controller';

@Module({
  imports:     [TypeOrmModule.forFeature([StoreItem, StockMovement, Requisition, RequisitionItem])],
  providers:   [StoreService],
  controllers: [StoreController],
  exports:     [StoreService],
})
export class StoreModule {}
