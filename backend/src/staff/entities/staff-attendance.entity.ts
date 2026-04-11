import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { StaffMember } from './staff.entity';

export enum StaffAttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEAVE = 'LEAVE',
}

@Entity('staff_attendance')
export class StaffAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StaffMember, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffMember;

  @Column({ name: 'staff_id' })
  staffId: string;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: StaffAttendanceStatus })
  status: StaffAttendanceStatus;

  @CreateDateColumn()
  createdAt: Date;
}
