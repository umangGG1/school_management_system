import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamTimetable } from './entities/exam-timetable.entity';
import { InvigilationAssignment } from './entities/invigilation.entity';
import { ExamMark } from './entities/exam-mark.entity';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExamTimetable, InvigilationAssignment, ExamMark])],
  providers: [ExamService],
  controllers: [ExamController],
  exports: [ExamService],
})
export class ExamModule {}
