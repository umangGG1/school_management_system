import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';
import { SchoolClass } from '../../academic/entities/class.entity';
import { Subject } from '../../academic/entities/subject.entity';

// ─── Department ───────────────────────────────────────────────────────────────
@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @ManyToOne(() => School, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'school_id' }) school: School;
  @Column() name: string;
  @Column({ nullable: true }) code: string;
  @Column({ name: 'hod_id', nullable: true }) hodId: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'hod_id' }) hod: User;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── Syllabus Progress ────────────────────────────────────────────────────────
@Entity('syllabus_progress')
export class SyllabusProgress {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column({ name: 'staff_id' }) staffId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'staff_id' }) staff: User;
  @Column({ name: 'subject_id', nullable: true }) subjectId: string;
  @ManyToOne(() => Subject, { nullable: true }) @JoinColumn({ name: 'subject_id' }) subject: Subject;
  @Column({ name: 'class_id', nullable: true }) classId: string;
  @ManyToOne(() => SchoolClass, { nullable: true }) @JoinColumn({ name: 'class_id' }) schoolClass: SchoolClass;
  @Column({ nullable: true }) termId: string;
  @Column({ default: 0 }) topicsPlanned: number;
  @Column({ default: 0 }) topicsCovered: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) coveragePercent: number;
  @Column({ default: 1 }) weekNumber: number;
  @Column({ type: 'text', nullable: true }) notes: string;
  @UpdateDateColumn() lastUpdated: Date;
}

// ─── Lesson Observation ───────────────────────────────────────────────────────
@Entity('lesson_observations')
export class LessonObservation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column({ name: 'observed_staff_id' }) observedStaffId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'observed_staff_id' }) observedStaff: User;
  @Column({ name: 'observed_by_id' }) observedById: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'observed_by_id' }) observedBy: User;
  @Column({ type: 'date' }) date: string;
  @Column({ name: 'class_id', nullable: true }) classId: string;
  @Column({ name: 'subject_id', nullable: true }) subjectId: string;
  @Column({ type: 'int', default: 3 }) preparationScore: number;
  @Column({ type: 'int', default: 3 }) deliveryScore: number;
  @Column({ type: 'int', default: 3 }) engagementScore: number;
  @Column({ type: 'int', default: 3 }) disciplineScore: number;
  @Column({ type: 'int', default: 3 }) assessmentScore: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) overallScore: number;
  @Column({ type: 'text', nullable: true }) comments: string;
  @Column({ type: 'text', nullable: true }) recommendations: string;
  @CreateDateColumn() createdAt: Date;
}

// ─── Scheme of Work ───────────────────────────────────────────────────────────
export enum SchemeStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
}

@Entity('schemes_of_work')
export class SchemeOfWork {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column({ name: 'staff_id' }) staffId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'staff_id' }) staff: User;
  @Column({ name: 'subject_id', nullable: true }) subjectId: string;
  @Column({ name: 'class_id', nullable: true }) classId: string;
  @Column({ nullable: true }) termId: string;
  @Column({ nullable: true }) fileUrl: string;
  @Column({ type: 'enum', enum: SchemeStatus, default: SchemeStatus.NOT_SUBMITTED }) status: SchemeStatus;
  @Column({ type: 'timestamp', nullable: true }) submittedAt: Date;
  @Column({ name: 'approved_by_id', nullable: true }) approvedById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'approved_by_id' }) approvedBy: User;
  @Column({ type: 'timestamp', nullable: true }) approvedAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
