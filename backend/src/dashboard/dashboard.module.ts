import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { StudentsModule } from '../students/students.module';
import { StaffModule } from '../staff/staff.module';
import { FinanceModule } from '../finance/finance.module';
import { AcademicModule } from '../academic/academic.module';
import { ApprovalsModule } from '../approvals/approvals.module';
import { ActivityModule } from '../activity/activity.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { CalendarModule } from '../calendar/calendar.module';
import { BoardingModule } from '../boarding/boarding.module';
import { SecurityModule } from '../security/security.module';
import { MedicalModule } from '../medical/medical.module';

@Module({
  imports: [
    StudentsModule,
    StaffModule,
    FinanceModule,
    AcademicModule,
    ApprovalsModule,
    ActivityModule,
    AnnouncementsModule,
    CalendarModule,
    BoardingModule,
    SecurityModule,
    MedicalModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
