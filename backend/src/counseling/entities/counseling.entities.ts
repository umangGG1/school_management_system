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

// ─── Case Status & Category ───────────────────────────────────────────────────

export enum CaseStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REFERRED = 'REFERRED',
  CLOSED = 'CLOSED',
}

export enum CaseCategory {
  ACADEMIC = 'ACADEMIC',
  BEHAVIOURAL = 'BEHAVIOURAL',
  EMOTIONAL = 'EMOTIONAL',
  SOCIAL = 'SOCIAL',
  FAMILY = 'FAMILY',
  CAREER = 'CAREER',
  HEALTH = 'HEALTH',
  SAFEGUARDING = 'SAFEGUARDING',
  OVC = 'OVC',
}

// ─── Student Case ─────────────────────────────────────────────────────────────

@Entity('counseling_cases')
export class CounselingCase {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' }) studentId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'counselor_id' })
  counselor: User;

  @Column({ name: 'counselor_id', nullable: true }) counselorId: string;

  @Column({ type: 'enum', enum: CaseCategory }) category: CaseCategory;

  @Column() title: string;

  @Column('text') description: string;

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.OPEN }) status: CaseStatus;

  @Column({ nullable: true, type: 'text' }) resolution: string;

  @Column({ default: false }) isConfidential: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── Case Note ────────────────────────────────────────────────────────────────

@Entity('case_notes')
export class CaseNote {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => CounselingCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: CounselingCase;

  @Column({ name: 'case_id' }) caseId: string;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'author_id' }) authorId: string;

  @Column('text') note: string;

  @Column({ nullable: true }) followUpDate: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── Counseling Session ───────────────────────────────────────────────────────

export enum SessionType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
  FAMILY = 'FAMILY',
  FOLLOW_UP = 'FOLLOW_UP',
}

@Entity('counseling_sessions')
export class CounselingSession {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => CounselingCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: CounselingCase;

  @Column({ name: 'case_id' }) caseId: string;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'counselor_id' })
  counselor: User;

  @Column({ name: 'counselor_id' }) counselorId: string;

  @Column({ type: 'date' }) sessionDate: string;

  @Column({ nullable: true }) duration: string;

  @Column({ type: 'enum', enum: SessionType, default: SessionType.INDIVIDUAL }) sessionType: SessionType;

  @Column('text') summary: string;

  @Column({ nullable: true }) nextSessionDate: string;

  @CreateDateColumn() createdAt: Date;
}

// ─── Safeguarding Report ──────────────────────────────────────────────────────

export enum SafeguardingLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('safeguarding_reports')
export class SafeguardingReport {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' }) studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: User;

  @Column({ name: 'reported_by_id' }) reportedById: string;

  @Column('text') concern: string;

  @Column({ type: 'enum', enum: SafeguardingLevel }) level: SafeguardingLevel;

  @Column({ nullable: true, type: 'text' }) actionTaken: string;

  @Column({ nullable: true }) referredTo: string;

  @Column({ default: false }) isResolved: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── OVC Registration ─────────────────────────────────────────────────────────

export enum OVCCategory {
  ORPHAN_BOTH = 'ORPHAN_BOTH',
  ORPHAN_FATHER = 'ORPHAN_FATHER',
  ORPHAN_MOTHER = 'ORPHAN_MOTHER',
  VULNERABLE = 'VULNERABLE',
  CHILD_HEADED = 'CHILD_HEADED',
  DISABILITY = 'DISABILITY',
}

@Entity('ovc_registrations')
export class OVCRegistration {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' }) studentId: string;

  @Column({ type: 'enum', enum: OVCCategory }) category: OVCCategory;

  @Column({ nullable: true, type: 'text' }) background: string;

  @Column({ nullable: true }) supportProvider: string;

  @Column({ nullable: true, type: 'text' }) supportDetails: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by_id' })
  registeredBy: User;

  @Column({ name: 'registered_by_id' }) registeredById: string;

  @Column({ default: true }) isActive: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── Health Referral ──────────────────────────────────────────────────────────

@Entity('health_referrals')
export class HealthReferral {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' }) studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referred_by_id' })
  referredBy: User;

  @Column({ name: 'referred_by_id' }) referredById: string;

  @Column() referredTo: string;

  @Column('text') reason: string;

  @Column({ nullable: true, type: 'date' }) referralDate: string;

  @Column({ nullable: true, type: 'text' }) outcome: string;

  @Column({ default: false }) isCompleted: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
