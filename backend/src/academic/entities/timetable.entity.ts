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
import { SchoolClass } from './class.entity';
import { Subject } from './subject.entity';
import { User } from '../../users/entities/user.entity';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
}

@Entity('timetable_entries')
export class TimetableEntry {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => SchoolClass, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: SchoolClass;

  @Column({ name: 'class_id' }) classId: string;

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'subject_id', nullable: true }) subjectId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'teacher_id', nullable: true }) teacherId: string;

  @Column({ type: 'enum', enum: DayOfWeek }) dayOfWeek: DayOfWeek;

  @Column() startTime: string;

  @Column() endTime: string;

  @Column({ nullable: true }) room: string;

  @Column() academicYear: string;

  @Column() term: string;

  @Column({ default: true }) isActive: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── Cover Lesson ─────────────────────────────────────────────────────────────

export enum CoverStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED',
}

@Entity('cover_lessons')
export class CoverLesson {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => TimetableEntry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timetable_entry_id' })
  timetableEntry: TimetableEntry;

  @Column({ name: 'timetable_entry_id' }) timetableEntryId: string;

  @Column({ name: 'school_id' }) schoolId: string;

  @Column({ type: 'date' }) date: string;

  /** Absent teacher */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'absent_teacher_id' })
  absentTeacher: User;

  @Column({ name: 'absent_teacher_id', nullable: true }) absentTeacherId: string;

  /** Cover teacher */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cover_teacher_id' })
  coverTeacher: User;

  @Column({ name: 'cover_teacher_id', nullable: true }) coverTeacherId: string;

  @Column({ type: 'enum', enum: CoverStatus, default: CoverStatus.PENDING }) status: CoverStatus;

  @Column({ nullable: true, type: 'text' }) notes: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy: User;

  @Column({ name: 'assigned_by_id', nullable: true }) assignedById: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
