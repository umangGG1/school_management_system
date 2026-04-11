import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Subject } from './subject.entity';
import { SchoolClass } from './class.entity';
import { User } from '../../users/entities/user.entity';

export enum AssessmentType {
  ASSIGNMENT = 'ASSIGNMENT',
  TEST = 'TEST',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
  PRACTICAL = 'PRACTICAL',
}

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'subject_id' })
  subjectId: string;

  @ManyToOne(() => SchoolClass, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: SchoolClass;

  @Column({ name: 'class_id' })
  classId: string;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column({ type: 'enum', enum: AssessmentType })
  type: AssessmentType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column()
  term: string;

  @Column()
  academicYear: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'entered_by' })
  enteredBy: User;

  @Column({ nullable: true, name: 'entered_by' })
  enteredById: string;

  @CreateDateColumn()
  createdAt: Date;
}
