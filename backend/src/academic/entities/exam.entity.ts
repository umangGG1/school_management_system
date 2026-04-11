import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { SchoolClass } from '../../academic/entities/class.entity';
import { Subject } from '../../academic/entities/subject.entity';
import { User } from '../../users/entities/user.entity';

// ─── Exam ─────────────────────────────────────────────────────────────────────
export enum ExamStatus {
  DRAFT = 'DRAFT',
  SET = 'SET',
  MODERATED = 'MODERATED',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
}

export enum ExamGrade { A = 'A', B = 'B', C = 'C', D = 'D', F = 'F' }

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @ManyToOne(() => School, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'school_id' }) school: School;
  @Column({ nullable: true }) termId: string;
  @Column() title: string;
  @Column({ nullable: true }) subjectName: string;
  @Column({ name: 'subject_id', nullable: true }) subjectId: string;
  @ManyToOne(() => Subject, { nullable: true }) @JoinColumn({ name: 'subject_id' }) subject: Subject;
  @Column('simple-array', { nullable: true }) classIds: string[];
  @Column({ default: 100 }) totalMarks: number;
  @Column({ nullable: true }) durationMinutes: number;
  @Column({ type: 'date', nullable: true }) examDate: string;
  @Column({ nullable: true }) venue: string;
  @Column({ name: 'set_by_id', nullable: true }) setById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'set_by_id' }) setBy: User;
  @Column({ type: 'enum', enum: ExamStatus, default: ExamStatus.DRAFT }) status: ExamStatus;
  @Column({ name: 'moderated_by_id', nullable: true }) moderatedById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'moderated_by_id' }) moderatedBy: User;
  @Column({ name: 'approved_by_id', nullable: true }) approvedById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'approved_by_id' }) approvedBy: User;
  @Column({ type: 'text', nullable: true }) moderationNotes: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── Exam Result ──────────────────────────────────────────────────────────────
@Entity('exam_results')
export class ExamResult {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'exam_id' }) examId: string;
  @ManyToOne(() => Exam, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'exam_id' }) exam: Exam;
  @Column({ name: 'student_id' }) studentId: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 }) marksObtained: number;
  @Column({ type: 'enum', enum: ExamGrade, nullable: true }) grade: ExamGrade;
  @Column({ nullable: true, type: 'text' }) remarks: string;
  @Column({ type: 'timestamp', nullable: true }) publishedAt: Date;
  @CreateDateColumn() createdAt: Date;
}
