import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User }             from '../users/entities/user.entity';
import { Student }          from '../students/entities/student.entity';
import { ApprovalsModule }  from '../approvals/approvals.module';
import { FinanceModule }    from '../finance/finance.module';
import { AcademicTerm }     from './entities/academic-term.entity';
import { SupportTicket }    from './entities/support-ticket.entity';
import { IntegrationConfig } from './entities/integration-config.entity';
import { AdminService }     from './admin.service';
import { AdminController }  from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Student,
      AcademicTerm,
      SupportTicket,
      IntegrationConfig,
    ]),
    ApprovalsModule,
    FinanceModule,
  ],
  providers:   [AdminService],
  controllers: [AdminController],
  exports:     [AdminService],
})
export class AdminModule {}
