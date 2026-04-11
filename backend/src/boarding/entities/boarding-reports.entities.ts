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
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';
import { Dormitory } from './boarding.entities';

// ─── Dorm Incident ────────────────────────────────────────────────────────────

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  REFERRED = 'REFERRED',
}

@Entity('dorm_incidents')
export class DormIncident {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Dormitory, { nullable: true })
  @JoinColumn({ name: 'dormitory_id' })
  dormitory: Dormitory;

  @Column({ name: 'dormitory_id', nullable: true }) dormitoryId: string;

  @Column() title: string;

  @Column('text') description: string;

  @Column({ type: 'enum', enum: IncidentSeverity, default: IncidentSeverity.LOW })
  severity: IncidentSeverity;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.REPORTED })
  status: IncidentStatus;

  @Column({ type: 'date' }) incidentDate: string;

  @Column({ nullable: true }) incidentTime: string;

  /** Students involved (comma-separated IDs for simplicity) */
  @Column({ nullable: true, type: 'text' }) involvedStudentIds: string;

  @Column({ nullable: true, type: 'text' }) actionTaken: string;

  @Column({ nullable: true, type: 'text' }) resolution: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: User;

  @Column({ name: 'reported_by_id' }) reportedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolved_by_id' })
  resolvedBy: User;

  @Column({ name: 'resolved_by_id', nullable: true }) resolvedById: string;

  @Column({ default: false }) parentNotified: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── Night Report ─────────────────────────────────────────────────────────────

@Entity('night_reports')
export class NightReport {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Dormitory, { nullable: true })
  @JoinColumn({ name: 'dormitory_id' })
  dormitory: Dormitory;

  @Column({ name: 'dormitory_id', nullable: true }) dormitoryId: string;

  @Column({ type: 'date' }) reportDate: string;

  @Column({ default: true }) allPresent: boolean;

  @Column({ nullable: true }) absentCount: number;

  @Column({ nullable: true, type: 'text' }) absentStudentIds: string;

  @Column({ nullable: true, type: 'text' }) observations: string;

  @Column({ nullable: true, type: 'text' }) incidentsSummary: string;

  @Column({ nullable: true, type: 'text' }) recommendedActions: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitted_by_id' })
  submittedBy: User;

  @Column({ name: 'submitted_by_id' }) submittedById: string;

  @CreateDateColumn() createdAt: Date;
}

// ─── Welfare Report ───────────────────────────────────────────────────────────

export enum WelfareConcernType {
  NUTRITION = 'NUTRITION',
  HYGIENE = 'HYGIENE',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  BULLYING = 'BULLYING',
  ACADEMIC = 'ACADEMIC',
  HEALTH = 'HEALTH',
  FINANCIAL = 'FINANCIAL',
  FAMILY = 'FAMILY',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER',
}

@Entity('welfare_reports')
export class WelfareReport {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' }) studentId: string;

  @Column({ type: 'enum', enum: WelfareConcernType }) concernType: WelfareConcernType;

  @Column('text') description: string;

  @Column({ nullable: true, type: 'text' }) actionTaken: string;

  @Column({ nullable: true }) referredTo: string;

  @Column({ default: false }) isResolved: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: User;

  @Column({ name: 'reported_by_id' }) reportedById: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
