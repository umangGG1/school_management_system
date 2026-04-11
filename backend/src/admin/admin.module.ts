import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User }          from '../users/entities/user.entity';
import { Student }       from '../students/entities/student.entity';
import { ApprovalsModule } from '../approvals/approvals.module';
import { FinanceModule }   from '../finance/finance.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student]),
    ApprovalsModule,
    FinanceModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
