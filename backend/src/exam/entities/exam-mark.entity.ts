import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExamTimetable } from './exam-timetable.entity';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

export enum MarkVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum ExamGrade {
  D1 = 'D1',
  D2 = 'D2',
  C3 = 'C3',
  C4 = 'C4',
  C5 = 'C5',
  C6 = 'C6',
  P7 = 'P7',
  P8 = 'P8',
  F9 = 'F9',
}

@Entity('exam_marks')
export class ExamMark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExamTimetable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_slot_id' })
  examSlot: ExamTimetable;

  @Column({ name: 'exam_slot_id' })
  examSlotId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  marksObtained: number;

  @Column({ type: 'enum', enum: ExamGrade, nullable: true })
  grade: ExamGrade;

  @Column({ nullable: true, type: 'text' })
  remarks: string;

  @Column({ type: 'enum', enum: MarkVerificationStatus, default: MarkVerificationStatus.PENDING })
  verificationStatus: MarkVerificationStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'entered_by_id' })
  enteredBy: User;

  @Column({ name: 'entered_by_id', nullable: true })
  enteredById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by_id' })
  verifiedBy: User;

  @Column({ name: 'verified_by_id', nullable: true })
  verifiedById: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
