import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

// ─── Sick Bay Visit ───────────────────────────────────────────────────────────
export enum SickBayStatus {
  ADMITTED = 'ADMITTED',
  OBSERVATION = 'OBSERVATION',
  DISCHARGED = 'DISCHARGED',
  REFERRED = 'REFERRED',
}

@Entity('sick_bay_visits')
export class SickBayVisit {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'school_id' }) schoolId: string;
  @ManyToOne(() => School, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'school_id' }) school: School;

  @Column({ name: 'student_id', nullable: true }) studentId: string;
  @ManyToOne(() => Student, { nullable: true }) @JoinColumn({ name: 'student_id' }) student: Student;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) visitDate: Date;
  @Column('text') complaint: string;
  @Column({ nullable: true, type: 'decimal', precision: 4, scale: 1 }) temperature: number;
  @Column({ nullable: true, type: 'text' }) diagnosis: string;
  @Column({ type: 'text' }) treatment: string;
  @Column({ nullable: true, type: 'text' }) medicationGiven: string;

  @Column({ type: 'enum', enum: SickBayStatus, default: SickBayStatus.OBSERVATION })
  status: SickBayStatus;

  @Column({ type: 'timestamp', nullable: true }) dischargedAt: Date;
  @Column({ nullable: true, type: 'text' }) referredTo: string;
  @Column({ nullable: true, type: 'text' }) referralReason: string;

  @Column({ name: 'attended_by_id', nullable: true }) attendedById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'attended_by_id' }) attendedBy: User;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─── Medical History ──────────────────────────────────────────────────────────
@Entity('student_medical_history')
export class StudentMedicalHistory {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'student_id', unique: true }) studentId: string;
  @ManyToOne(() => Student) @JoinColumn({ name: 'student_id' }) student: Student;

  @Column({ name: 'school_id' }) schoolId: string;

  @Column({ nullable: true, type: 'text' }) allergies: string;
  @Column({ nullable: true, type: 'text' }) chronicConditions: string;
  @Column({ nullable: true }) bloodGroup: string;
  @Column({ nullable: true }) emergencyContactName: string;
  @Column({ nullable: true }) emergencyContactPhone: string;

  @UpdateDateColumn() updatedAt: Date;
}
