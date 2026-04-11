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

export enum LessonNoteStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  RETURNED = 'RETURNED',
}

@Entity('lesson_notes')
export class LessonNote {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => SchoolClass, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: SchoolClass;

  @Column({ name: 'class_id' }) classId: string;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'subject_id' }) subjectId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'teacher_id' }) teacherId: string;

  @Column() topic: string;

  @Column() term: string;

  @Column() academicYear: string;

  @Column({ type: 'date', nullable: true }) lessonDate: string;

  @Column('text') objectives: string;

  @Column('text') content: string;

  @Column({ nullable: true, type: 'text' }) activities: string;

  @Column({ nullable: true, type: 'text' }) resources: string;

  @Column({ nullable: true, type: 'text' }) evaluation: string;

  @Column({ type: 'enum', enum: LessonNoteStatus, default: LessonNoteStatus.DRAFT })
  status: LessonNoteStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User;

  @Column({ name: 'reviewed_by_id', nullable: true }) reviewedById: string;

  @Column({ nullable: true, type: 'text' }) reviewerComment: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
