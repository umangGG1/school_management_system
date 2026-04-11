import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolClass } from './entities/class.entity';
import { Subject } from './entities/subject.entity';
import { Assessment } from './entities/assessment.entity';
import { StudentAttendance } from './entities/student-attendance.entity';
import { TimetableEntry, CoverLesson } from './entities/timetable.entity';
import { LessonNote } from './entities/lesson-note.entity';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchoolClass,
      Subject,
      Assessment,
      StudentAttendance,
      TimetableEntry,
      CoverLesson,
      LessonNote,
    ]),
  ],
  providers: [AcademicService],
  controllers: [AcademicController],
  exports: [AcademicService],
})
export class AcademicModule {}
