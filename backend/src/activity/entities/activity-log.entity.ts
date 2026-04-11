import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ActivityType {
  FEE_PAYMENT        = 'FEE_PAYMENT',
  STUDENT_ENROLLED   = 'STUDENT_ENROLLED',
  ATTENDANCE_MARKED  = 'ATTENDANCE_MARKED',
  REPORT_GENERATED   = 'REPORT_GENERATED',
  LEAVE_APPROVED     = 'LEAVE_APPROVED',
  PAYROLL_PROCESSED  = 'PAYROLL_PROCESSED',
  USER_LOGIN         = 'USER_LOGIN',
  USER_LOGIN_FAILED  = 'USER_LOGIN_FAILED',
  USER_CREATED       = 'USER_CREATED',
  USER_UPDATED       = 'USER_UPDATED',
  USER_DEACTIVATED   = 'USER_DEACTIVATED',
  GRADE_ENTERED      = 'GRADE_ENTERED',
  ANNOUNCEMENT_SENT  = 'ANNOUNCEMENT_SENT',
  SCHOOL_UPDATED     = 'SCHOOL_UPDATED',
  APPROVAL_MADE      = 'APPROVAL_MADE',
  SYSTEM             = 'SYSTEM',
  OTHER              = 'OTHER',
}

export type ActivitySeverity = 'info' | 'success' | 'warn' | 'danger';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  /** Snapshot of actor name (survives user deletion) */
  @Column({ nullable: true })
  userName: string;

  /** Snapshot of actor role at time of action */
  @Column({ nullable: true })
  userRole: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({
    type: 'varchar',
    default: 'info',
  })
  severity: ActivitySeverity;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User;

  @Column({ nullable: true, name: 'performed_by' })
  performedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
