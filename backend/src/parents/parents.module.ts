import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { AcademicModule } from '../academic/academic.module';
import { FinanceModule } from '../finance/finance.module';
import { ExamModule } from '../exam/exam.module';
import { MessagingModule } from '../messaging/messaging.module';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, User]),
    AcademicModule,
    FinanceModule,
    ExamModule,
    MessagingModule,
  ],
  providers: [ParentsService],
  controllers: [ParentsController],
  exports: [ParentsService],
})
export class ParentsModule {}
