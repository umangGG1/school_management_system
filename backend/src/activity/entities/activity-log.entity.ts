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
  FEE_PAYMENT = 'FEE_PAYMENT',
  STUDENT_ENROLLED = 'STUDENT_ENROLLED',
  ATTENDANCE_MARKED = 'ATTENDANCE_MARKED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  PAYROLL_PROCESSED = 'PAYROLL_PROCESSED',
  USER_LOGIN = 'USER_LOGIN',
  GRADE_ENTERED = 'GRADE_ENTERED',
  ANNOUNCEMENT_SENT = 'ANNOUNCEMENT_SENT',
  OTHER = 'OTHER',
}

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

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User;

  @Column({ nullable: true, name: 'performed_by' })
  performedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
