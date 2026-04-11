import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

// ─── Dormitory ────────────────────────────────────────────────────────────────
export enum DormGender { BOYS = 'BOYS', GIRLS = 'GIRLS', MIXED = 'MIXED' }

@Entity('dormitories')
export class Dormitory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @ManyToOne(() => School, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'school_id' }) school: School;
  @Column() name: string;
  @Column({ type: 'enum', enum: DormGender, default: DormGender.BOYS }) gender: DormGender;
  @Column({ default: 0 }) capacity: number;
  @CreateDateColumn() createdAt: Date;
}

// ─── Dorm Room ────────────────────────────────────────────────────────────────
@Entity('dorm_rooms')
export class DormRoom {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'dormitory_id' }) dormitoryId: string;
  @ManyToOne(() => Dormitory) @JoinColumn({ name: 'dormitory_id' }) dormitory: Dormitory;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column() roomNumber: string;
  @Column({ default: 0 }) capacity: number;
  @Column({ nullable: true }) floorNumber: number;
  @CreateDateColumn() createdAt: Date;
}

// ─── Dorm Allocation ─────────────────────────────────────────────────────────
@Entity('dorm_allocations')
export class DormAllocation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'dorm_room_id' }) dormRoomId: string;
  @ManyToOne(() => DormRoom) @JoinColumn({ name: 'dorm_room_id' }) dormRoom: DormRoom;
  @Column({ name: 'student_id' }) studentId: string;
  @ManyToOne(() => Student) @JoinColumn({ name: 'student_id' }) student: Student;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column({ nullable: true }) termId: string;
  @Column({ nullable: true }) bedNumber: number;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() allocatedAt: Date;
}

// ─── Student Leave / Exeat ────────────────────────────────────────────────────
export enum StudentLeaveType { EXEAT = 'EXEAT', MEDICAL = 'MEDICAL', FAMILY = 'FAMILY', OTHER = 'OTHER' }
export enum StudentLeaveStatus {
  PENDING = 'PENDING', APPROVED = 'APPROVED',
  RETURNED = 'RETURNED', OVERDUE = 'OVERDUE', CANCELLED = 'CANCELLED',
}

@Entity('student_leaves')
export class StudentLeave {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'student_id' }) studentId: string;
  @ManyToOne(() => Student) @JoinColumn({ name: 'student_id' }) student: Student;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column({ type: 'enum', enum: StudentLeaveType, default: StudentLeaveType.EXEAT }) leaveType: StudentLeaveType;
  @Column({ type: 'date' }) startDate: string;
  @Column({ type: 'date' }) endDate: string;
  @Column('text') reason: string;
  @Column({ nullable: true }) destination: string;
  @Column({ type: 'enum', enum: StudentLeaveStatus, default: StudentLeaveStatus.PENDING }) status: StudentLeaveStatus;
  @Column({ nullable: true, name: 'approved_by_id' }) approvedById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'approved_by_id' }) approvedBy: User;
  @Column({ type: 'timestamp', nullable: true }) grantedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) expectedReturnAt: Date;
  @Column({ type: 'timestamp', nullable: true }) actualReturnAt: Date;
  @Column({ default: false }) parentNotified: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── Roll Call ────────────────────────────────────────────────────────────────
export enum RollCallPeriod { MORNING = 'MORNING', EVENING = 'EVENING' }
export enum RollCallEntryStatus {
  PRESENT = 'PRESENT', ABSENT = 'ABSENT',
  SICK_BAY = 'SICK_BAY', LEAVE = 'LEAVE', MISSING = 'MISSING',
}

@Entity('dorm_roll_calls')
export class DormRollCall {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column({ name: 'dormitory_id' }) dormitoryId: string;
  @ManyToOne(() => Dormitory) @JoinColumn({ name: 'dormitory_id' }) dormitory: Dormitory;
  @Column({ type: 'date' }) date: string;
  @Column({ type: 'enum', enum: RollCallPeriod }) period: RollCallPeriod;
  @Column({ name: 'conducted_by_id' }) conductedById: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'conducted_by_id' }) conductedBy: User;
  @Column({ type: 'text', nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('dorm_roll_call_entries')
export class DormRollCallEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'roll_call_id' }) rollCallId: string;
  @ManyToOne(() => DormRollCall, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'roll_call_id' }) rollCall: DormRollCall;
  @Column({ name: 'student_id' }) studentId: string;
  @ManyToOne(() => Student) @JoinColumn({ name: 'student_id' }) student: Student;
  @Column({ type: 'enum', enum: RollCallEntryStatus, default: RollCallEntryStatus.PRESENT }) status: RollCallEntryStatus;
  @Column({ nullable: true }) notes: string;
}
