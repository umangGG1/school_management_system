import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffMember } from './entities/staff.entity';
import { StaffAttendance } from './entities/staff-attendance.entity';
import { StaffLeave } from './entities/staff-leave.entity';
import { StaffAction } from './entities/staff-action.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StaffMember, StaffAttendance, StaffLeave, StaffAction])],
  providers: [StaffService],
  controllers: [StaffController],
  exports: [StaffService],
})
export class StaffModule {}
