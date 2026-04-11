import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ApprovalType {
  PAYROLL = 'PAYROLL',
  REPORT_CARD = 'REPORT_CARD',
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  STUDENT_EXEAT = 'STUDENT_EXEAT',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  FEE_WAIVER = 'FEE_WAIVER',
  OTHER = 'OTHER',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ApprovalUrgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('approvals')
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column({ type: 'enum', enum: ApprovalType })
  type: ApprovalType;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ApprovalUrgency, default: ApprovalUrgency.MEDIUM })
  urgency: ApprovalUrgency;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status: ApprovalStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requested_by' })
  requestedBy: User;

  @Column({ nullable: true, name: 'requested_by' })
  requestedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: User;

  @Column({ nullable: true, name: 'reviewed_by' })
  reviewedById: string;

  @Column({ nullable: true, type: 'text' })
  reviewNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
