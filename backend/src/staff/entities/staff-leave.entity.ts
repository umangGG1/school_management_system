import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  COMPASSIONATE = 'COMPASSIONATE',
  STUDY = 'STUDY',
  UNPAID = 'UNPAID',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('staff_leaves')
export class StaffLeave {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'staff_id' }) staffId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'staff_id' }) staff: User;

  @Column({ name: 'school_id' }) schoolId: string;
  @ManyToOne(() => School, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'school_id' }) school: School;

  @Column({ type: 'enum', enum: LeaveType }) leaveType: LeaveType;
  @Column({ type: 'date' }) startDate: string;
  @Column({ type: 'date' }) endDate: string;
  @Column({ type: 'text' }) reason: string;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING }) status: LeaveStatus;

  @Column({ name: 'approved_by_id', nullable: true }) approvedById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'approved_by_id' }) approvedBy: User;

  @Column({ type: 'timestamp', nullable: true }) approvedAt: Date;
  @Column({ nullable: true, type: 'text' }) rejectionReason: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
