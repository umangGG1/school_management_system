import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Subject } from '../../academic/entities/subject.entity';
import { SchoolClass } from '../../academic/entities/class.entity';
import { User } from '../../users/entities/user.entity';

export enum ExamTimetableStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
}

@Entity('exam_timetable')
export class ExamTimetable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column()
  title: string;

  @Column()
  term: string;

  @Column()
  academicYear: string;

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'subject_id', nullable: true })
  subjectId: string;

  @Column({ nullable: true })
  subjectName: string;

  /** Class IDs affected by this exam slot */
  @Column('simple-array', { nullable: true })
  classIds: string[];

  @Column({ type: 'date' })
  examDate: string;

  @Column({ nullable: true })
  startTime: string;

  @Column({ nullable: true })
  endTime: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ default: 100 })
  totalMarks: number;

  @Column({ type: 'enum', enum: ExamTimetableStatus, default: ExamTimetableStatus.DRAFT })
  status: ExamTimetableStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
